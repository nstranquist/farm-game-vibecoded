import { useState, useEffect } from 'react';
import { connectSocket, disconnectSocket, emitEvent, onEvent, offEvent } from '../services/socket';
import { getPlantTypes } from '../services/api';
import GameGrid from './GameGrid';
import HUD from './HUD';
import Inventory from './Inventory';
import './Game.css';

const GRID_EXPANSION_COST = 500;

const Game = ({ token, username, onLogout }) => {
  const [gameState, setGameState] = useState(null);
  const [plants, setPlants] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [plantTypes, setPlantTypes] = useState({});
  const [selectedPlantType, setSelectedPlantType] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Load plant types
    getPlantTypes().then(setPlantTypes);

    // Connect to WebSocket
    const socket = connectSocket(token);

    // Request initial game state
    emitEvent('getGameState');

    // Listen for game state updates
    const handleGameState = (data) => {
      setGameState(data.gameState);
      setPlants(data.plants);
      setInventory(data.inventory);
    };

    const handlePlantGrown = (data) => {
      setPlants(data.plants);
      showNotification('🌱 A plant has grown!');
    };

    const handleError = (data) => {
      showNotification(`❌ ${data.message}`, 'error');
    };

    onEvent('gameState', handleGameState);
    onEvent('plantGrown', handlePlantGrown);
    onEvent('error', handleError);

    return () => {
      offEvent('gameState', handleGameState);
      offEvent('plantGrown', handlePlantGrown);
      offEvent('error', handleError);
      disconnectSocket();
    };
  }, [token]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePlantSeed = (x, y, plantType) => {
    emitEvent('plantSeed', { x, y, plantType });
  };

  const handleHarvestPlant = (plantId) => {
    emitEvent('harvestPlant', { plantId });
    showNotification('✅ Plant harvested!');
  };

  const handleExpandGrid = () => {
    emitEvent('expandGrid');
    showNotification('⬆️ Grid expanded!');
  };

  if (!gameState) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your farm...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <HUD
        username={username}
        currency={gameState.currency}
        gridSize={gameState.grid_size}
        onExpandGrid={handleExpandGrid}
        onLogout={onLogout}
        expandCost={GRID_EXPANSION_COST}
      />

      <div className="game-main">
        <GameGrid
          gridSize={gameState.grid_size}
          plants={plants}
          onPlantSeed={handlePlantSeed}
          onHarvestPlant={handleHarvestPlant}
          selectedPlantType={selectedPlantType}
          plantTypes={plantTypes}
        />

        <Inventory
          inventory={inventory}
          plantTypes={plantTypes}
          selectedPlantType={selectedPlantType}
          onSelectPlantType={setSelectedPlantType}
          currency={gameState.currency}
        />
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Game;
