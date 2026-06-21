import { useState, useEffect } from 'react';
import { profileApi } from '../api/profileApi';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileData, statsData] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getUserStats(),
      ]);
      setProfile(profileData.data);
      setStats(statsData.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await profileApi.updateProfile(updates);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateMacros = async (goal) => {
    try {
      const response = await profileApi.calculateMacros(goal);
      return response.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    calculateMacros,
    reload: loadProfile,
  };
};
