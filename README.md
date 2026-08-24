# 🌾 Farm Building Game

An online multiplayer farm building game where users can plant different crops, upgrade them, and expand their farm in real-time.

## Features

- **8x8 Expandable Grid**: Start with an 8x8 grid and expand up to 16x16
- **Multiple Plant Types**: Wheat, Corn, Tomato, and Pumpkin with different costs and yields
- **Plant Levels**: Upgrade plants to increase their yield (up to level 5)
- **Real-time Updates**: WebSocket-based real-time synchronization
- **User Authentication**: Secure login and registration system
- **In-game Currency**: Earn currency by harvesting plants and use it to buy more
- **Inventory System**: Track all your harvested items
- **Auto-growing**: Plants automatically grow after a set time period
- **Interactive HUD**: See your currency, grid size, and player info at a glance

## Technology Stack

### Frontend
- React with Vite
- Socket.IO Client for real-time communication
- Axios for HTTP requests
- CSS3 for animations and styling

### Backend
- Node.js with Express
- Socket.IO for WebSocket connections
- Better-SQLite3 for database
- JWT for authentication
- bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd farm-game-vibecoded
```

2. Install dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

3. Configure environment variables:

Server (.env in server directory):
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:5173
```

Client (.env in client directory):
```
VITE_API_URL=http://localhost:3000
```

## Running the Application

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:

Server only:
```bash
npm run server
```

Client only:
```bash
npm run client
```

### Production Mode

Build the client:
```bash
npm run build
```

Start the server:
```bash
npm start
```

## How to Play

1. **Register/Login**: Create an account or login with existing credentials
2. **Select a Plant**: Click on a plant type in the shop (right sidebar)
3. **Plant Seeds**: Click on empty cells in the grid to plant
4. **Wait for Growth**: Plants automatically grow after their growth time
5. **Harvest**: Click on fully grown plants (with sparkles ✨) to harvest
6. **Earn Currency**: Get currency from harvesting plants
7. **Expand Grid**: Use currency to expand your farm grid (costs 500 💰)
8. **Track Progress**: Check your inventory to see all harvested items

## Game Mechanics

### Plant Types

| Plant   | Cost | Growth Time | Base Yield | Max Level |
|---------|------|-------------|------------|-----------|
| Wheat   | 10   | 30 seconds  | 15         | 5         |
| Corn    | 25   | 1 minute    | 40         | 5         |
| Tomato  | 50   | 1.5 minutes | 80         | 5         |
| Pumpkin | 100  | 2 minutes   | 150        | 5         |

### Progression
- Plant cost increases by 1.5x per level
- Plant yield increases by 1.3x per level
- Upgrade cost doubles with each level
- Grid expansion costs 500 currency and increases grid by 2x2

## Project Structure

```
farm-game-vibecoded/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Auth.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── GameGrid.jsx
│   │   │   ├── HUD.jsx
│   │   │   └── Inventory.jsx
│   │   ├── services/      # API and Socket services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   ├── database.js       # Database operations
│   ├── auth.js           # Authentication logic
│   ├── gameLogic.js      # Game mechanics
│   └── package.json
└── package.json          # Root package.json
```

## API Endpoints

### REST API
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/plant-types` - Get all available plant types

### WebSocket Events

#### Client → Server
- `getGameState` - Request current game state
- `plantSeed` - Plant a seed at position
- `harvestPlant` - Harvest a grown plant
- `upgradePlant` - Upgrade a plant level
- `expandGrid` - Expand the farm grid

#### Server → Client
- `gameState` - Send game state update
- `plantGrown` - Notify when a plant finishes growing
- `error` - Send error message

## Database Schema

### Users Table
- id (PRIMARY KEY)
- username (UNIQUE)
- password (hashed)
- created_at

### Game State Table
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- currency
- grid_size
- created_at
- updated_at

### Plants Table
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- position_x
- position_y
- plant_type
- level
- growth_stage
- planted_at

### Inventory Table
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- item_type
- quantity

## License

MIT
