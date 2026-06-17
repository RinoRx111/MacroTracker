import apiClient from './sharedClient';


export const waterApi = {
  updateWaterLog: (data) => apiClient.post('/water/logs', data),
  getDailyWater: (date) => apiClient.get('/water/daily', { params: { target_date: date } }),
};

export default apiClient;
