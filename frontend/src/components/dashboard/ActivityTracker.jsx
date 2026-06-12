import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { CircularProgress } from '../ui/ProgressBar';
import { activityApi } from '../../api/activityApi';

export const ActivityTracker = ({ activity, goal = 10000, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forms
  const [steps, setSteps] = useState(activity?.steps || 0);
  const [distance, setDistance] = useState(activity?.distance_km || 0.0);
  const [activeMins, setActiveMins] = useState(activity?.active_minutes || 0);
  const [calories, setCalories] = useState(activity?.calories_burned || 0.0);

  useEffect(() => {
    if (activity) {
      setSteps(activity.steps || 0);
      setDistance(activity.distance_km || 0.0);
      setActiveMins(activity.active_minutes || 0);
      setCalories(activity.calories_burned || 0.0);
    }
  }, [activity]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await activityApi.updateActivityLog({
        steps: parseInt(steps) || 0,
        distance_km: parseFloat(distance) || 0.0,
        active_minutes: parseInt(activeMins) || 0,
        calories_burned: parseFloat(calories) || 0.0,
        logged_date: today,
      });
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const stepPercentage = Math.min(Math.round((steps / goal) * 100), 100);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Steps & Activity 🏃</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Monitor your daily movement</p>
        </div>
        {!isEditing && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-xs px-2.5 py-1"
          >
            Update Stats ✏️
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Circular Step Progress */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative">
              <CircularProgress 
                value={steps} 
                max={goal} 
                color="text-emerald-500" 
                size="md" 
              />
              <div className="text-center mt-2">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white block">
                  {steps.toLocaleString()}
                </span>
                <span className="text-xxs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  of {goal.toLocaleString()} steps
                </span>
              </div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="md:col-span-7 grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <span className="text-2xl block">📍</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white block mt-1">
                {distance.toFixed(2)}
              </span>
              <span className="text-xxs text-gray-500 uppercase">Distance (km)</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <span className="text-2xl block">⏱️</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white block mt-1">
                {activeMins}
              </span>
              <span className="text-xxs text-gray-500 uppercase">Active Mins</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <span className="text-2xl block">🔥</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white block mt-1">
                {Math.round(calories)}
              </span>
              <span className="text-xxs text-gray-500 uppercase">Kcal Burned</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Steps</label>
              <input
                type="number"
                min="0"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distance (km)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Active Minutes</label>
              <input
                type="number"
                min="0"
                value={activeMins}
                onChange={(e) => setActiveMins(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active Kcal Burned</label>
              <input
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Activity 💾'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                setIsEditing(false);
                // reset back
                if (activity) {
                  setSteps(activity.steps || 0);
                  setDistance(activity.distance_km || 0.0);
                  setActiveMins(activity.active_minutes || 0);
                  setCalories(activity.calories_burned || 0.0);
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};
