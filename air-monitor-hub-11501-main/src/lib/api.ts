// API Configuration for Backend Connection
// This file manages the backend API base URL

// Get backend URL from environment variable or use default
// In development, Vite dev server runs on 8080, backend on 5008
// In production, backend serves the frontend, so use relative URLs
const isDevelopment = import.meta.env.DEV;
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '5008';
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST || 'localhost';

// Use relative URL in production (backend serves frontend)
// Use absolute URL in development (Vite dev server on 8080, backend on 5008)
export const API_BASE_URL = isDevelopment 
  ? `http://${BACKEND_HOST}:${BACKEND_PORT}`
  : '';

export const API_ENDPOINTS = {
  readings: `${API_BASE_URL}/readings`,
  login: `${API_BASE_URL}/login`,
  register: `${API_BASE_URL}/register`,
  weather: `${API_BASE_URL}/weather`,
  health: `${API_BASE_URL}/health`,
  apiStatus: `${API_BASE_URL}/api-status`,
} as const;

