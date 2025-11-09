import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'farm-game.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS game_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    currency INTEGER DEFAULT 100,
    grid_size INTEGER DEFAULT 8,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    plant_type TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    growth_stage INTEGER DEFAULT 0,
    planted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Database helper functions
export const createUser = (username, hashedPassword) => {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const result = stmt.run(username, hashedPassword);
  
  // Initialize game state for new user
  const initStmt = db.prepare('INSERT INTO game_state (user_id, currency) VALUES (?, ?)');
  initStmt.run(result.lastInsertRowid, 100);
  
  return result.lastInsertRowid;
};

export const getUserByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
};

export const getGameState = (userId) => {
  const stmt = db.prepare('SELECT * FROM game_state WHERE user_id = ?');
  return stmt.get(userId);
};

export const updateGameState = (userId, currency, gridSize) => {
  const stmt = db.prepare('UPDATE game_state SET currency = ?, grid_size = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?');
  return stmt.run(currency, gridSize, userId);
};

export const getPlants = (userId) => {
  const stmt = db.prepare('SELECT * FROM plants WHERE user_id = ?');
  return stmt.all(userId);
};

export const addPlant = (userId, x, y, plantType, level) => {
  const stmt = db.prepare('INSERT INTO plants (user_id, position_x, position_y, plant_type, level) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(userId, x, y, plantType, level);
};

export const updatePlant = (plantId, level, growthStage) => {
  const stmt = db.prepare('UPDATE plants SET level = ?, growth_stage = ? WHERE id = ?');
  return stmt.run(level, growthStage, plantId);
};

export const removePlant = (plantId) => {
  const stmt = db.prepare('DELETE FROM plants WHERE id = ?');
  return stmt.run(plantId);
};

export const getInventory = (userId) => {
  const stmt = db.prepare('SELECT * FROM inventory WHERE user_id = ?');
  return stmt.all(userId);
};

export const updateInventory = (userId, itemType, quantity) => {
  const checkStmt = db.prepare('SELECT * FROM inventory WHERE user_id = ? AND item_type = ?');
  const existing = checkStmt.get(userId, itemType);
  
  if (existing) {
    const stmt = db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE user_id = ? AND item_type = ?');
    return stmt.run(quantity, userId, itemType);
  } else {
    const stmt = db.prepare('INSERT INTO inventory (user_id, item_type, quantity) VALUES (?, ?, ?)');
    return stmt.run(userId, itemType, quantity);
  }
};

export default db;
