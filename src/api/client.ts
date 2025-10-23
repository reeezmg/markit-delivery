import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const api = axios.create({
  baseURL: 'http://localhost:3005/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add token from localStorage
api.interceptors.request.use(async (config) => {
  const token = await Preferences.get({ key: 'token' });
  if (token) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }
  return config;
});

export default api;