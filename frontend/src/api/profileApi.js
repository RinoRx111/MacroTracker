import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const profileApi = {
  getProfile: () => apiClient.get('/profile/me'),
  updateProfile: (data) => apiClient.put('/profile/me', data),
  getUserStats: () => apiClient.get('/profile/stats'),
  updateSettings: (data) => apiClient.put('/profile/settings', data),
  calculateMacros: () => apiClient.post('/profile/calculate-macros'),
};

export default apiClient;
