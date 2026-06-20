import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useProfile } from '../hooks/useProfile';
import { Loader } from '../components/ui/Loader';

export const Profile = ({ user: mockUser }) => {
  const { profile, stats, loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const isClerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { user } = isClerkEnabled ? useUser() : { user: null };
  const { signOut } = isClerkEnabled ? useClerk() : { signOut: () => {} };


  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        weight_kg: profile.weight_kg || '',
        height_cm: profile.height_cm || '',
        gender: profile.gender || 'male',
        activity_level: profile.activity_level || 'moderate',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  if (loading || !profile) {
    return <Loader fullPage />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-2xl">
      {isClerkEnabled && user && (
        <Card>
          <CardHeader title="Account Settings (Clerk) 🔒" subtitle="Your secure authentication profile" />
          <CardBody>
            <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
              <img 
                src={user.imageUrl} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-emerald-500 shadow-sm object-cover" 
              />
              <div className="space-y-1 text-center md:text-left flex-1">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{user.fullName || "User"}</h4>
                <p className="text-sm text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                <div className="pt-2 text-xs text-gray-400 space-y-1">
                  <p><span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clerk ID:</span> <code className="bg-gray-150 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">{user.id}</code></p>
                  <p><span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Created:</span> {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => signOut()}
                className="text-xs px-2.5 py-1.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400"
              >
                Sign Out 🚪
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
      <Card>
        <CardHeader title={profile.full_name || profile.username} subtitle={profile.email} />
        <CardBody>
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                  <p className="text-lg font-semibold">{profile.age || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                  <p className="text-lg font-semibold capitalize">{profile.gender || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weight</p>
                  <p className="text-lg font-semibold">{profile.weight_kg}kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Height</p>
                  <p className="text-lg font-semibold">{profile.height_cm}cm</p>
                </div>
              </div>

              {stats && stats.bmi && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">BMI</p>
                  <p className="text-2xl font-bold">{stats.bmi}</p>
                  <p className="text-sm text-gray-500 capitalize">{stats.bmi_category}</p>
                </div>
              )}

              <Button variant="primary" onClick={() => setIsEditing(true)} className="w-full">
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleSave} className="flex-1">Save</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Nutrition Goals" />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Calories</p>
              <p className="text-2xl font-bold">{profile.daily_calorie_goal}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein Goal</p>
              <p className="text-2xl font-bold">{profile.protein_goal_g}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Carbs Goal</p>
              <p className="text-2xl font-bold">{profile.carbs_goal_g}g</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fat Goal</p>
              <p className="text-2xl font-bold">{profile.fat_goal_g}g</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Fitness Goals" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Steps</p>
              <p className="text-2xl font-bold">{(profile.daily_step_goal ?? 10000).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Hydration</p>
              <p className="text-2xl font-bold">{profile.daily_water_goal_ml ?? 2000} ml</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Active Burn</p>
              <p className="text-2xl font-bold">{profile.daily_calories_burned_goal ?? 500} kcal</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
