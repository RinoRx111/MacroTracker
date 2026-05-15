import { useState } from 'react';
import { foodApi } from '../api/foodApi';

export const useFood = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDailyLogs = async (date = new Date()) => {
    setLoading(true);
    try {
      const dateStr = (date instanceof Date ? date : new Date(date)).toISOString().split('T')[0];
      const response = await foodApi.getDailyLogs(dateStr);
      setFoods(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching food logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async (date = new Date()) => {
    setLoading(true);
    try {
      const dateStr = (date instanceof Date ? date : new Date(date)).toISOString().split('T')[0];
      const response = await foodApi.getDailySummary(dateStr);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching daily summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addFoodLog = async (foodData) => {
    try {
      const response = await foodApi.createFoodLog(foodData);
      setFoods(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error adding food log:', err);
      return null;
    }
  };

  const searchFoods = async (query) => {
    try {
      const response = await foodApi.searchFoods(query);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error searching foods:', err);
      return [];
    }
  };

  const deleteFoodLog = async (id) => {
    try {
      await foodApi.deleteFoodLog(id);
      setFoods(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting food log:', err);
    }
  };

  return {
    foods,
    loading,
    error,
    fetchDailyLogs,
    fetchDailySummary,
    addFoodLog,
    searchFoods,
    deleteFoodLog,
  };
};
