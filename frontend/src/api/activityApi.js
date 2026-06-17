import apiClient from './sharedClient';


export const activityApi = {
  updateActivityLog: (data) => apiClient.post('/activity/logs', data),
  getDailyActivity: (date) => apiClient.get('/activity/daily', { params: { target_date: date } }),
};

export default apiClient;
