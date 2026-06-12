import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const waterApi = {
  updateWaterLog: (data) => apiClient.post('/water/logs', data),
  getDailyWater: (date) => apiClient.get('/water/daily', { params: { target_date: date } }),
};

export default apiClient;
