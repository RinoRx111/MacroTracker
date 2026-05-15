import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  checkUsers: () => apiClient.get('/auth/check'),
};

// Auth helpers
export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('macrotracker_auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeAuth = (authData) => {
  localStorage.setItem('macrotracker_auth', JSON.stringify(authData));
};

export const clearAuth = () => {
  localStorage.removeItem('macrotracker_auth');
};

export const isAuthenticated = () => !!getStoredAuth();
