import { useState, useEffect } from 'react';
import { weightApi } from '../api/weightApi';

export const useWeight = () => {
  const [weights, setWeights] = useState([]);
  const [latestWeight, setLatestWeight] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLatestWeight = async () => {
    setLoading(true);
    try {
      const response = await weightApi.getLatestWeight();
      setLatestWeight(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching latest weight:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await weightApi.getWeightStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weight stats:', err);
    }
  };

  const fetchWeightRange = async (startDate, endDate) => {
    try {
      const response = await weightApi.getWeightRange(startDate, endDate);
      setWeights(response.data || []);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching weight range:', err);
      return [];
    }
  };

  const addWeightLog = async (data) => {
    try {
      const response = await weightApi.createWeightLog(data);
      setLatestWeight(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Error adding weight log:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchLatestWeight();
    fetchStats();
  }, []);

  return {
    weights,
    latestWeight,
    stats,
    loading,
    error,
    fetchLatestWeight,
    fetchStats,
    fetchWeightRange,
    addWeightLog,
  };
};
