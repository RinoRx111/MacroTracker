import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';

export const Settings: React.FC = () => {
  const { data: goals } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async () => { const { data } = await api.user.getGoals(); return data; },
  });

  const [form, setForm] = useState({ calories: 2000, protein: 150, carbs: 200, fats: 65, water_target: 3000 });

  useEffect(() => {
    if (goals) setForm({ 
      calories: goals.calories, protein: goals.protein, 
      carbs: goals.carbs, fats: goals.fats, water_target: goals.water_target 
    });
  }, [goals]);

  const saveMutation = useMutation({
    mutationFn: () => api.user.saveGoals(form),
    onSuccess: () => alert('Goals saved! ✅'),
  });

  const fields = [
    { key: 'calories', label: 'Daily Calorie Goal', unit: 'kcal', color: 'text-white' },
    { key: 'protein',  label: 'Protein Goal',       unit: 'g',    color: 'text-accent-protein' },
    { key: 'carbs',    label: 'Carbs Goal',         unit: 'g',    color: 'text-accent-carbs' },
    { key: 'fats',     label: 'Fats Goal',          unit: 'g',    color: 'text-accent-fats' },
    { key: 'water_target', label: 'Water Target',   unit: 'ml',   color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-zinc-500">Set your own nutrition targets — no assumptions.</p>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl bg-surface border border-border space-y-6"
      >
        <h3 className="font-bold text-lg border-b border-border pb-4">Daily Goals</h3>
        
        {fields.map(({ key, label, unit, color }) => (
          <div key={key} className="flex items-center justify-between gap-6">
            <label className={`text-sm font-medium ${color} w-48`}>{label}</label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="number"
                className="w-full bg-panel border border-border rounded-xl px-4 py-2 outline-none focus:border-white transition-colors text-right"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) })}
              />
              <span className="text-zinc-500 text-sm w-10">{unit}</span>
            </div>
          </div>
        ))}

        <div className="pt-4 flex justify-end">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save My Goals'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};