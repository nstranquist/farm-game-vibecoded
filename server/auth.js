import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, getUserByUsername } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (username, password) => {
  try {
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return { success: false, message: 'Username already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = createUser(username, hashedPassword);

    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });

    return { success: true, token, userId, username };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

export const login = async (username, password) => {
  try {
    const user = getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, message: 'Invalid credentials' };
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return { success: true, token, userId: user.id, username: user.username };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
