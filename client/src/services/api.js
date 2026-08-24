import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const register = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/register`, { username, password });
  return response.data;
};

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/api/login`, { username, password });
  return response.data;
};

export const getPlantTypes = async () => {
  const response = await axios.get(`${API_URL}/api/plant-types`);
  return response.data;
};

export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const clearToken = () => {
  localStorage.removeItem('token');
};
