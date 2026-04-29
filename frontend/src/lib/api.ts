import axios from 'axios';
import { useAuthStore } from '@/lib/auth-store';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  
  // Dynamic detection for Vercel environments
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app')) {
    return 'https://the-golf-draw-z71c.vercel.app';
  }
  
  return 'http://localhost:5002';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);