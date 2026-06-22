import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { CalorieChart } from '../components/charts/CalorieChart';
import { WeightTrendChart } from '../components/charts/WeightTrendChart';
import { StepsChart } from '../components/charts/StepsChart';
import { WaterChart } from '../components/charts/WaterChart';
import { analyticsApi } from '../api/analyticsApi';
import { Loader } from '../components/ui/Loader';

export const Analytics = ({ user }) => {
  const [calorieData, setCalorieData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [stepsData, setStepsData] = useState([]);
  const [waterData, setWaterData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = 7;
      const today = new Date();
      const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

      const [nutritionResult, weightResult, insightResult, stepsResult, waterResult] = await Promise.allSettled([
        analyticsApi.getNutritionData(
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ),
        analyticsApi.getWeightProgress(
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ),
        analyticsApi.getInsights(days),
        analyticsApi.getStepsData(
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ),
        analyticsApi.getWaterData(
          startDate.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        ),
      ]);

      const failures = [];
      if (nutritionResult.status === 'rejected') failures.push(`Nutrition: ${nutritionResult.reason?.message || 'Failed'}`);
      if (weightResult.status === 'rejected') failures.push(`Weight: ${weightResult.reason?.message || 'Failed'}`);
      if (stepsResult.status === 'rejected') failures.push(`Insights: ${insightResult.reason?.message || 'Failed'}`);
      if (stepsResult.status === 'rejected') failures.push(`Steps: ${stepsResult.reason?.message || 'Failed'}`);
      if (waterResult.status === 'rejected') failures.push(`Water: ${waterResult.reason?.message || 'Failed'}`);

      if (failures.length > 0) {
        setError(`Failed to load some analytics data: ${failures.join(', ')}`);
      }

      if (nutritionResult.status === 'fulfilled') setCalorieData(nutritionResult.value.data || []);
      if (weightResult.status === 'fulfilled') setWeightData(weightResult.value.data || []);
      if (insightResult.status === 'fulfilled') setInsights(insightResult.value.data);
      if (stepsResult.status === 'fulfilled') setStepsData(stepsResult.value.data || []);
      if (waterResult.status === 'fulfilled') setWaterData(waterResult.value.data || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'An unexpected error occurred loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-400">Unable to load complete analytics history</p>
            <p className="text-xs text-red-650 dark:text-red-400/80">{error}</p>
          </div>
          <button 
            onClick={loadAnalytics} 
            className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold rounded-lg transition-all"
          >
            Retry 🔄
          </button>
        </div>
      )}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Calories</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(insights.average_calories)}</p>
            <p className="text-xs text-gray-500 mt-1">Goal Compliance: {insights.calorie_goal_compliance}%</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Daily Protein</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{(insights.average_protein ?? 0).toFixed(1)}g</p>
            <p className="text-xs text-gray-500 mt-1">Days Logged: {insights.total_days_logged}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400">Most Common Meal</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">{insights.most_common_meal_type || '—'}</p>
            <p className="text-xs text-gray-500 mt-1">{insights.period || ''}</p>
          </Card>
        </div>
      )}

      <CalorieChart data={calorieData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StepsChart data={stepsData} goal={user?.daily_step_goal || 10000} />
        <WaterChart data={waterData} goal={user?.daily_water_goal_ml || 2000} />
      </div>

      <WeightTrendChart data={weightData} />

      {insights && (
        <Card>
          <CardHeader title="Average Daily Macros" subtitle={insights.period || ''} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(insights.average_calories)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-red-600">{(insights.average_protein ?? 0).toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-cyan-600">{(insights.average_carbs ?? 0).toFixed(1)}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-2xl font-bold text-yellow-600">{(insights.average_fat ?? 0).toFixed(1)}g</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
