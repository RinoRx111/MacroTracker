import apiClient from './sharedClient';


export const profileApi = {
  getProfile: () => apiClient.get('/profile/me'),
  updateProfile: (data) => apiClient.put('/profile/me', data),
  getUserStats: () => apiClient.get('/profile/stats'),
  updateSettings: (data) => apiClient.put('/profile/settings', data),
  calculateMacros: () => apiClient.post('/profile/calculate-macros'),
};

export default apiClient;
