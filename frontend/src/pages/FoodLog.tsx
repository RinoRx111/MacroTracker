import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { FoodSearchModal } from '../components/features/logging/FoodSearchModal';

export const FoodLog: React.FC = () => {
  const { currentDate } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['food-logs', currentDate],
    queryFn: async () => {
      const { data } = await api.nutrition.getLogs(currentDate);
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (logId: number) => api.nutrition.deleteLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-logs'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" /></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Food Log</h2>
          <p className="text-zinc-500">Everything you've eaten today — {currentDate}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors">
          <Plus size={18} /> Add Food
        </button>
      </header>

      {mealTypes.map(meal => {
        const mealLogs = logs.filter((l: any) => l.meal_type === meal);
        const mealCals = mealLogs.reduce((sum: number, l: any) => sum + l.logged_calories, 0);
        
        return (
          <div key={meal} className="p-6 rounded-3xl bg-surface border border-border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold capitalize">{meal}</h3>
              <span className="text-zinc-500 text-sm">{Math.round(mealCals)} kcal</span>
            </div>
            
            {mealLogs.length === 0 ? (
              <p className="text-zinc-600 text-sm italic py-4">No {meal} logged yet</p>
            ) : (
              <div className="space-y-2">
                {mealLogs.map((log: any) => (
                  <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-panel border border-border"
                  >
                    <div>
                      <p className="font-medium">{log.food_name || 'Food Item'}</p>
                      <p className="text-xs text-zinc-500">
                        {log.amount}g · {Math.round(log.logged_protein)}g P · {Math.round(log.logged_carbs)}g C · {Math.round(log.logged_fats)}g F
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{Math.round(log.logged_calories)} kcal</span>
                      <button onClick={() => deleteMutation.mutate(log.id)} className="text-zinc-600 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <FoodSearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};