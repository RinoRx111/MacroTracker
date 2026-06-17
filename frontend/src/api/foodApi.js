import apiClient from './sharedClient';


export const foodApi = {
  createFoodLog: (data) => apiClient.post('/food/logs', data),
  getDailyLogs: (date) => apiClient.get('/food/daily', { params: { target_date: date } }),
  getDailySummary: (date) => apiClient.get('/food/daily-summary', { params: { target_date: date } }),
  searchFoods: (query, limit = 20) => apiClient.post('/food/search', null, { params: { query, limit } }),
  getFoodByBarcode: (barcode) => apiClient.get(`/food/barcode/${barcode}`),
  deleteFoodLog: (id) => apiClient.delete(`/food/logs/${id}`),
  createCustomFood: (data) => apiClient.post('/food/custom-foods', data),
  getCustomFoods: () => apiClient.get('/food/custom-foods'),
  parseFoodText: (text) => apiClient.post('/food/parse-text', { text }),
  createFoodLogsBatch: (logs) => apiClient.post('/food/logs/batch', logs),
};

export default apiClient;
