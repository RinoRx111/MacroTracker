import apiClient from './sharedClient';


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
