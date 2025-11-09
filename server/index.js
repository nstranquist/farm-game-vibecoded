import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, verifyToken } from './auth.js';
import {
  getGameState,
  updateGameState,
  getPlants,
  addPlant,
  updatePlant,
  removePlant,
  getInventory,
  updateInventory
} from './database.js';
import {
  PLANT_TYPES,
  getPlantCost,
  getPlantYield,
  getUpgradeCost,
  GRID_EXPANSION_COST,
  canExpandGrid
} from './gameLogic.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// REST API endpoints
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const result = await register(username, password);
  res.json(result);
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await login(username, password);
  res.json(result);
});

app.get('/api/plant-types', (req, res) => {
  res.json(PLANT_TYPES);
});

// WebSocket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new Error('Invalid token'));
  }

  socket.userId = decoded.userId;
  socket.username = decoded.username;
  next();
});

// Active connections
const activeUsers = new Map();

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.username}`);
  activeUsers.set(socket.userId, socket.id);

  // Send initial game state
  socket.on('getGameState', () => {
    try {
      const gameState = getGameState(socket.userId);
      const plants = getPlants(socket.userId);
      const inventory = getInventory(socket.userId);

      socket.emit('gameState', {
        gameState,
        plants,
        inventory
      });
    } catch (error) {
      console.error('Error getting game state:', error);
      socket.emit('error', { message: 'Failed to load game state' });
    }
  });

  // Plant a seed
  socket.on('plantSeed', (data) => {
    try {
      const { x, y, plantType } = data;
      const gameState = getGameState(socket.userId);
      const cost = getPlantCost(plantType, 1);

      if (gameState.currency < cost) {
        socket.emit('error', { message: 'Not enough currency' });
        return;
      }

      // Check if position is valid
      if (x < 0 || y < 0 || x >= gameState.grid_size || y >= gameState.grid_size) {
        socket.emit('error', { message: 'Invalid position' });
        return;
      }

      // Check if position is already occupied
      const plants = getPlants(socket.userId);
      const occupied = plants.some(p => p.position_x === x && p.position_y === y);
      if (occupied) {
        socket.emit('error', { message: 'Position already occupied' });
        return;
      }

      // Plant the seed
      const result = addPlant(socket.userId, x, y, plantType, 1);
      updateGameState(socket.userId, gameState.currency - cost, gameState.grid_size);

      // Broadcast update
      const newGameState = getGameState(socket.userId);
      const newPlants = getPlants(socket.userId);

      socket.emit('gameState', {
        gameState: newGameState,
        plants: newPlants,
        inventory: getInventory(socket.userId)
      });

      // Auto-grow plant after growth time
      const plantConfig = PLANT_TYPES[plantType.toUpperCase()];
      setTimeout(() => {
        try {
          const plant = getPlants(socket.userId).find(p => p.id === result.lastInsertRowid);
          if (plant && plant.growth_stage === 0) {
            updatePlant(result.lastInsertRowid, 1, 1);
            const updatedPlants = getPlants(socket.userId);
            
            // Notify user if still connected
            if (activeUsers.has(socket.userId)) {
              io.to(activeUsers.get(socket.userId)).emit('plantGrown', {
                plantId: result.lastInsertRowid,
                plants: updatedPlants
              });
            }
          }
        } catch (error) {
          console.error('Error auto-growing plant:', error);
        }
      }, plantConfig.growthTime);

    } catch (error) {
      console.error('Error planting seed:', error);
      socket.emit('error', { message: 'Failed to plant seed' });
    }
  });

  // Harvest a plant
  socket.on('harvestPlant', (data) => {
    try {
      const { plantId } = data;
      const plants = getPlants(socket.userId);
      const plant = plants.find(p => p.id === plantId);

      if (!plant) {
        socket.emit('error', { message: 'Plant not found' });
        return;
      }

      if (plant.growth_stage === 0) {
        socket.emit('error', { message: 'Plant not ready to harvest' });
        return;
      }

      const yield_ = getPlantYield(plant.plant_type, plant.level);
      const gameState = getGameState(socket.userId);

      removePlant(plantId);
      updateGameState(socket.userId, gameState.currency + yield_, gameState.grid_size);
      updateInventory(socket.userId, plant.plant_type, 1);

      const newGameState = getGameState(socket.userId);
      const newPlants = getPlants(socket.userId);
      const newInventory = getInventory(socket.userId);

      socket.emit('gameState', {
        gameState: newGameState,
        plants: newPlants,
        inventory: newInventory
      });

    } catch (error) {
      console.error('Error harvesting plant:', error);
      socket.emit('error', { message: 'Failed to harvest plant' });
    }
  });

  // Upgrade a plant
  socket.on('upgradePlant', (data) => {
    try {
      const { plantId } = data;
      const plants = getPlants(socket.userId);
      const plant = plants.find(p => p.id === plantId);

      if (!plant) {
        socket.emit('error', { message: 'Plant not found' });
        return;
      }

      const upgradeCost = getUpgradeCost(plant.plant_type, plant.level);
      if (!upgradeCost) {
        socket.emit('error', { message: 'Plant already at max level' });
        return;
      }

      const gameState = getGameState(socket.userId);
      if (gameState.currency < upgradeCost) {
        socket.emit('error', { message: 'Not enough currency' });
        return;
      }

      updatePlant(plantId, plant.level + 1, plant.growth_stage);
      updateGameState(socket.userId, gameState.currency - upgradeCost, gameState.grid_size);

      const newGameState = getGameState(socket.userId);
      const newPlants = getPlants(socket.userId);

      socket.emit('gameState', {
        gameState: newGameState,
        plants: newPlants,
        inventory: getInventory(socket.userId)
      });

    } catch (error) {
      console.error('Error upgrading plant:', error);
      socket.emit('error', { message: 'Failed to upgrade plant' });
    }
  });

  // Expand grid
  socket.on('expandGrid', () => {
    try {
      const gameState = getGameState(socket.userId);

      if (!canExpandGrid(gameState.grid_size, gameState.currency)) {
        socket.emit('error', { message: 'Cannot expand grid (max size or insufficient funds)' });
        return;
      }

      const newSize = gameState.grid_size + 2;
      updateGameState(socket.userId, gameState.currency - GRID_EXPANSION_COST, newSize);

      const newGameState = getGameState(socket.userId);
      socket.emit('gameState', {
        gameState: newGameState,
        plants: getPlants(socket.userId),
        inventory: getInventory(socket.userId)
      });

    } catch (error) {
      console.error('Error expanding grid:', error);
      socket.emit('error', { message: 'Failed to expand grid' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.username}`);
    activeUsers.delete(socket.userId);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
