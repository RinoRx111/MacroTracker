import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workoutApi = {
  createWorkoutLog: (data) => apiClient.post('/workout/logs', data),
  getDailyWorkouts: (date) => apiClient.get('/workout/daily', { params: { target_date: date } }),
  deleteWorkoutLog: (id) => apiClient.delete(`/workout/logs/${id}`),
};

export default apiClient;
