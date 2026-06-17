import apiClient from './sharedClient';


export const weightApi = {
  createWeightLog: (data) => apiClient.post('/weight/logs', data),
  getLatestWeight: () => apiClient.get('/weight/latest'),
  getWeightStats: () => apiClient.get('/weight/stats'),
  getWeightRange: (startDate, endDate) => 
    apiClient.get('/weight/range', { params: { start_date: startDate, end_date: endDate } }),
  getWeeklyProgress: (date) => apiClient.get('/weight/weekly-progress', { params: { target_date: date } }),
  deleteWeightLog: (id) => apiClient.delete(`/weight/logs/${id}`),
  createGoal: (data) => apiClient.post('/weight/goals', data),
  getActiveGoal: () => apiClient.get('/weight/goals/active'),
  getGoalHistory: () => apiClient.get('/weight/goals/history'),
};

export default apiClient;
