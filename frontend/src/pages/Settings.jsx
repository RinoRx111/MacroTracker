import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useProfile } from '../hooks/useProfile';

export const Settings = ({ profile, setDarkMode, darkMode, onLogout }) => {
  const { updateProfile } = useProfile();
  const [settings, setSettings] = useState({
    dark_mode: darkMode,
    daily_calorie_goal: profile?.daily_calorie_goal || 2000,
    protein_goal_g: profile?.protein_goal_g || 150,
    carbs_goal_g: profile?.carbs_goal_g || 200,
    fat_goal_g: profile?.fat_goal_g || 65,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile(settings);
    setDarkMode(settings.dark_mode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
