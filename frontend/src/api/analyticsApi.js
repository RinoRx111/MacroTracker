import apiClient from './sharedClient';


export const analyticsApi = {
  getNutritionData: (startDate, endDate) => 
    apiClient.get('/analytics/nutrition-data', { params: { start_date: startDate, end_date: endDate } }),
  getMacroDistribution: (date) => 
    apiClient.get('/analytics/macro-distribution', { params: { target_date: date } }),
  getWeightProgress: (startDate, endDate) => 
    apiClient.get('/analytics/weight-progress', { params: { start_date: startDate, end_date: endDate } }),
  getInsights: (days = 7) => apiClient.get('/analytics/insights', { params: { days } }),
  getMealBreakdown: (date) => apiClient.get('/analytics/meal-breakdown', { params: { target_date: date } }),
  getSummary: (date) => apiClient.get('/analytics/summary', { params: { target_date: date } }),
  getStepsData: (startDate, endDate) => 
    apiClient.get('/analytics/steps-data', { params: { start_date: startDate, end_date: endDate } }),
  getWaterData: (startDate, endDate) => 
    apiClient.get('/analytics/water-data', { params: { start_date: startDate, end_date: endDate } }),
};

export default apiClient;
