import apiClient from './sharedClient';


export const api = {

  recipes: {
    createRecipe: (data: any) => apiClient.post('/recipes/create', data),
    getRecipes: () => apiClient.get('/recipes/'),
  },

  weight: {
    log: (data: any) => apiClient.post('/weight/log', data),
    getTrends: () => apiClient.get('/weight/trends'),
  },
  user: {
  getProfile: () => apiClient.get('/user/profile'),
  saveProfile: (data: any) => apiClient.post('/user/profile', data),
  getGoals: () => apiClient.get('/user/goals'),
  saveGoals: (data: any) => apiClient.post('/user/goals', data),
},
  nutrition: {
  search: (query: string) => apiClient.get(`/nutrition/search?query=${query}`),
  log: (data: any) => apiClient.post('/nutrition/log', data),
  getSummary: (date: string) => apiClient.get(`/nutrition/summary/${date}`),
  getLogs: (date: string) => apiClient.get(`/nutrition/logs/${date}`),  // NEW
  deleteLog: (id: number) => apiClient.delete(`/nutrition/log/${id}`),  // NEW
  logWater: (amount: number, date: string) => apiClient.post('/nutrition/water', { amount, date }),
  getWaterSummary: (date: string) => apiClient.get(`/nutrition/water/${date}`),
},
};
