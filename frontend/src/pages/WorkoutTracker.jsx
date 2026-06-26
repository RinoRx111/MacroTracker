import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { workoutApi } from '../api/workoutApi';
import { useProfile } from '../hooks/useProfile';
import { formatDateLocal } from '../utils/formatters';

// MET values for standard exercises
const MET_VALUES = {
  running: 9.8,
  walking: 3.5,
  cycling: 7.5,
  swimming: 8.0,
  strength: 6.0,
  yoga: 2.5,
  custom: 0,
};

const EXERCISE_NAMES = {
  running: 'Running 🏃',
  walking: 'Walking 🚶',
  cycling: 'Cycling 🚴',
  swimming: 'Swimming 🏊',
  strength: 'Strength Training 🏋️',
  yoga: 'Yoga 🧘',
  custom: 'Other / Custom ⚡',
};

export const WorkoutTracker = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDateLocal());

  // Form State
  const [exerciseType, setExerciseType] = useState('running');
  const [customName, setCustomName] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');
  const [isManualCalories, setIsManualCalories] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, [selectedDate]);

  // Calculate estimated calories based on MET
  useEffect(() => {
    if (isManualCalories || exerciseType === 'custom') return;
    
    const weight = profile?.weight_kg || 75.0; // fallback to 75kg
    const durationMins = parseInt(duration) || 0;
    const met = MET_VALUES[exerciseType] || 5.0;
    
    // Calorie formula: MET * 3.5 * weight / 200 * duration
    if (durationMins > 0) {
      // Adjust MET slightly based on intensity
      let adjustedMet = met;
      if (intensity === 'low') adjustedMet = met * 0.75;
      if (intensity === 'high') adjustedMet = met * 1.25;

      const estCalories = Math.round(adjustedMet * 3.5 * weight / 200 * durationMins);
      setCaloriesBurned(estCalories.toString());
    } else {
      setCaloriesBurned('');
    }
  }, [exerciseType, duration, intensity, profile, isManualCalories]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await workoutApi.getDailyWorkouts(selectedDate);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!duration || !caloriesBurned) return;

    setSubmitting(true);
    try {
      const name = exerciseType === 'custom' ? customName || 'Custom Workout' : EXERCISE_NAMES[exerciseType];
      const category = (exerciseType === 'strength' || exerciseType === 'yoga') ? 'strength' : 'cardio';
      
      const payload = {
        name,
        category,
        duration_minutes: parseInt(duration),
        calories_burned: parseFloat(caloriesBurned),
        intensity,
        notes: notes || null,
        logged_date: selectedDate,
      };

      await workoutApi.createWorkoutLog(payload);
      
      // Reset form
      setDuration('');
      setCustomName('');
      setCaloriesBurned('');
      setNotes('');
      setIsManualCalories(false);
      
      // Refresh list
      fetchWorkouts();
    } catch (error) {
      console.error('Error logging workout:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await workoutApi.deleteWorkoutLog(id);
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  if (profileLoading) {
    return <Loader fullPage />;
  }

  const totalDuration = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const totalBurned = workouts.reduce((sum, w) => sum + w.calories_burned, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header and Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Workout Tracker 🏋️</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Log and monitor your daily fitness activities</p>
        </div>
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader title="Log New Workout" />
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Exercise Type</label>
                  <select
                    value={exerciseType}
                    onChange={(e) => {
                      setExerciseType(e.target.value);
                      setIsManualCalories(false);
                    }}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {Object.keys(EXERCISE_NAMES).map((key) => (
                      <option key={key} value={key}>
                        {EXERCISE_NAMES[key]}
                      </option>
                    ))}
                  </select>
                </div>

                {exerciseType === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Workout Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boxing, Rowing"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Intensity</label>
                    <select
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="low">Low 💤</option>
                      <option value="medium">Medium 🔥</option>
                      <option value="high">High ⚡</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium">Calories Burned (kcal)</label>
                    {exerciseType !== 'custom' && (
                      <button
                        type="button"
                        onClick={() => setIsManualCalories(!isManualCalories)}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {isManualCalories ? 'Use Estimate' : 'Manual Entry'}
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Est: 250"
                    disabled={!isManualCalories && exerciseType !== 'custom'}
                    value={caloriesBurned}
                    onChange={(e) => {
                      setCaloriesBurned(e.target.value);
                      setIsManualCalories(true);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      !isManualCalories && exerciseType !== 'custom' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    placeholder="Describe how it went..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Logging...' : 'Log Workout 🏋️'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Duration</p>
                <h3 className="text-3xl font-extrabold mt-1 text-[var(--text-primary)] stat-number">{totalDuration} <span className="text-sm font-medium text-[var(--text-secondary)] uppercase">mins</span></h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">Active workout time today</p>
            </Card>
            <Card className="p-4 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Burned</p>
                <h3 className="text-3xl font-extrabold mt-1 text-[var(--text-primary)] stat-number">{totalBurned} <span className="text-sm font-medium text-[var(--text-secondary)] uppercase">kcal</span></h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">Active energy expenditure</p>
            </Card>
          </div>

          {/* List Card */}
          <Card>
            <CardHeader title={`Workout Logs - ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`} />
            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : workouts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl block mb-2">🧘</span>
                  <p>No workouts logged for this day.</p>
                  <p className="text-xs text-gray-400 mt-1">Get moving and log your first activity!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-150 dark:divide-gray-700">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base">{workout.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1 items-center text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
                            {workout.category}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full capitalize">
                            {workout.intensity} Intensity
                          </span>
                          <span>•</span>
                          <span>⏱️ {workout.duration_minutes} mins</span>
                          {workout.notes && (
                            <>
                              <span>•</span>
                              <span className="italic">"{workout.notes}"</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-rose-500">-{Math.round(workout.calories_burned)} kcal</span>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                          title="Delete workout"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
