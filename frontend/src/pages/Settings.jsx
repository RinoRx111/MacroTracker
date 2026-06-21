import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useProfile } from '../hooks/useProfile';

export const Settings = ({ profile, setDarkMode, darkMode, onLogout }) => {
  const { updateProfile, calculateMacros } = useProfile();
  const [selectedGoal, setSelectedGoal] = useState('maintenance');
  const [calculating, setCalculating] = useState(false);
  const [settings, setSettings] = useState({
    dark_mode: darkMode,
    daily_calorie_goal: profile?.daily_calorie_goal || 2000,
    protein_goal_g: profile?.protein_goal_g || 150,
    carbs_goal_g: profile?.carbs_goal_g || 200,
    fat_goal_g: profile?.fat_goal_g || 65,
    daily_step_goal: profile?.daily_step_goal || 10000,
    daily_water_goal_ml: profile?.daily_water_goal_ml || 2000,
    daily_calories_burned_goal: profile?.daily_calories_burned_goal || 500,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile(settings);
    setDarkMode(settings.dark_mode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAutoCalculate = async () => {
    setCalculating(true);
    try {
      const data = await calculateMacros(selectedGoal);
      if (data) {
        setSettings({
          ...settings,
          daily_calorie_goal: Math.round(data.recommended_daily_calories),
          protein_goal_g: Math.round(data.recommended_protein_g * 10) / 10,
          carbs_goal_g: Math.round(data.recommended_carbs_g * 10) / 10,
          fat_goal_g: Math.round(data.recommended_fat_g * 10) / 10,
        });
      }
    } catch (e) {
      console.error("Error auto-calculating macros:", e);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl">
      <Card>
        <CardHeader title="Display Settings" />
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark mode</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, dark_mode: !settings.dark_mode })}
              className={`w-14 h-8 rounded-full transition-all ${settings.dark_mode ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-all ${settings.dark_mode ? 'ml-7' : 'ml-1'}`} />
            </button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Nutrition Goals" />
        <CardBody>
          {/* Auto calculate controls */}
          <div className="mb-6 p-4 rounded-xl border border-gray-150 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Weight Goal</label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="weight_loss">Weight Loss (Deficit) 📉</option>
                <option value="maintenance">Maintenance (Balance) ⚖️</option>
                <option value="muscle_gain">Muscle Gain (Surplus) 📈</option>
              </select>
            </div>
            <Button
              variant="secondary"
              onClick={handleAutoCalculate}
              disabled={calculating}
              className="w-full sm:w-auto text-sm px-4 py-2 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-bold"
            >
              {calculating ? 'Calculating...' : '🪄 Auto-Calculate Recommended Targets'}
            </Button>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Daily Calorie Goal', key: 'daily_calorie_goal', step: '1', parse: parseInt },
              { label: 'Protein Goal (g)', key: 'protein_goal_g', step: '0.1', parse: parseFloat },
              { label: 'Carbs Goal (g)', key: 'carbs_goal_g', step: '0.1', parse: parseFloat },
              { label: 'Fat Goal (g)', key: 'fat_goal_g', step: '0.1', parse: parseFloat },
            ].map(({ label, key, step, parse }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                <input
                  type="number"
                  step={step}
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: parse(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            ))}
          </div>

          {/* Calorie math balance checks */}
          {(() => {
            const proteinKcal = (settings.protein_goal_g || 0) * 4;
            const carbsKcal = (settings.carbs_goal_g || 0) * 4;
            const fatKcal = (settings.fat_goal_g || 0) * 9;
            const totalMacroKcal = Math.round(proteinKcal + carbsKcal + fatKcal);
            const calorieGoal = settings.daily_calorie_goal || 0;
            const matchesCalorieGoal = Math.abs(totalMacroKcal - calorieGoal) <= 5; // allow small rounding differences

            return (
              <div className="mt-6 p-4 rounded-xl border bg-gray-50/50 dark:bg-gray-800/50 border-gray-150 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Macro Calorie Sum:</span>
                  <span className={`font-bold ${matchesCalorieGoal ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {totalMacroKcal} kcal
                  </span>
                </div>
                {!matchesCalorieGoal && (
                  <p className="text-xs text-amber-500 mt-2">
                    ⚠️ The sum of macros ({totalMacroKcal} kcal) does not match your Calorie Goal ({calorieGoal} kcal). Adjust your macros to match, or use the "Auto-Calculate" button above.
                  </p>
                )}
                {matchesCalorieGoal && (
                  <p className="text-xs text-emerald-500 mt-2">
                    ✓ Macros perfectly match your Calorie Goal!
                  </p>
                )}
              </div>
            );
          })()}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Fitness Goals" />
        <CardBody>
          <div className="space-y-4">
            {[
              { label: 'Daily Steps Goal', key: 'daily_step_goal', step: '1', parse: parseInt },
              { label: 'Daily Water Goal (ml)', key: 'daily_water_goal_ml', step: '50', parse: parseInt },
              { label: 'Daily Active Calorie Burn Goal (kcal)', key: 'daily_calories_burned_goal', step: '10', parse: parseInt },
            ].map(({ label, key, step, parse }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                <input
                  type="number"
                  step={step}
                  value={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: parse(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Button
        variant="primary"
        size="lg"
        onClick={handleSave}
        className="w-full"
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </Button>

      <Card>
        <CardHeader title="About" />
        <CardBody>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            MacroTracker v1.0.0 | Professional nutrition and macro tracking application
          </p>
          <p className="text-xs text-gray-500 mt-2">Built with FastAPI + React</p>
        </CardBody>
      </Card>

      {onLogout && (
        <Button variant="danger" size="lg" onClick={onLogout} className="w-full">
          Sign Out
        </Button>
      )}
    </div>
  );
};
