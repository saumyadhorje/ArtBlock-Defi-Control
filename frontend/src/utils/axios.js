import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from './auth';

const axiosInstance = axios.create({
  //baseURL: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:5000',
  baseURL: (process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, ''),
  headers: { 'Content-Type': 'application/json' }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    return Promise.reject(error);
  }
);

export default axiosInstance;
