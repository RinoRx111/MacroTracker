// frontend/src/pages/UserProfile.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Ruler, Weight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

const useUserInternal = () => {
  const queryClient = useQueryClient();

  const useProfile = () => {
    return useQuery({
      queryKey: ['user-profile'],
      queryFn: async () => {
        const { data } = await api.user.getProfile();
        return data;
      },
    });
  };

  const updateGoalsMutation = useMutation({
    mutationFn: (userId: number) => api.user.calculateGoals(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });

  return { useProfile, updateGoalsMutation };
};

export const UserProfile: React.FC = () => {
  const { useProfile, updateGoalsMutation } = useUserInternal();
  const { data: profile, isLoading } = useProfile();
  
  const [metrics, setMetrics] = useState({
    weight: profile?.current_weight || 75,
    height: profile?.height || 175,
    age: profile?.age || 30,
    gender: profile?.gender || 'male',
    activity: profile?.activity_multiplier || 1.2,
  });

  const handleCalculate = async () => {
    await updateGoalsMutation.mutate(profile?.id || 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
        <p className="text-zinc-500">Configure your physical metrics for accurate goal calculations.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-surface border border-border space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Weight size={14} /> Current Weight (kg)
            </label>
            <input 
              type="number" 
              className="w-full bg-panel border border-border rounded-xl px-4 py-2 outline-none focus:border-white transition-colors"
              value={metrics.weight}
              onChange={(e) => setMetrics({...metrics, weight: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Ruler size={14} /> Height (cm)
            </label>
            <input 
              type="number" 
              className="w-full bg-panel border border-border rounded-xl px-4 py-2 outline-none focus:border-white transition-colors"
              value={metrics.height}
              onChange={(e) => setMetrics({...metrics, height: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <User size={14} /> Age
            </label>
            <input 
              type="number" 
              className="w-full bg-panel border border-border rounded-xl px-4 py-2 outline-none focus:border-white transition-colors"
              value={metrics.age}
              onChange={(e) => setMetrics({...metrics, age: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Activity size={14} /> Activity Level
            </label>
            <select 
              className="w-full bg-panel border border-border rounded-xl px-4 py-2 outline-none focus:border-white transition-colors appearance-none"
              value={metrics.activity}
              onChange={(e) => setMetrics({...metrics, activity: parseFloat(e.target.value)})}
            >
              <option value="1.2">Sedentary (Office Job)</option>
              <option value="1.375">Lightly Active</option>
              <option value="1.55">Moderately Active</option>
              <option value="1.725">Very Active</option>
              <option value="1.9">Extra Active</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            onClick={handleCalculate}
            disabled={updateGoalsMutation.isPending}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {updateGoalsMutation.isPending ? 'Calculating...' : 'Update My Goals'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
