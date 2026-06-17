import apiClient from './sharedClient';


export const workoutApi = {
  createWorkoutLog: (data) => apiClient.post('/workout/logs', data),
  getDailyWorkouts: (date) => apiClient.get('/workout/daily', { params: { target_date: date } }),
  deleteWorkoutLog: (id) => apiClient.delete(`/workout/logs/${id}`),
};

export default apiClient;
