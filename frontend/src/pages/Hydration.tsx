// frontend/src/pages/Hydration.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Plus, RotateCcw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAppStore } from '../store/useAppStore';

export const Hydration: React.FC = () => {
  const { currentDate } = useAppStore();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('250');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['water-summary', currentDate],
    queryFn: async () => {
      const { data } = await api.nutrition.getWaterSummary(currentDate);
      return data;
    },
  });

  const logMutation = useMutation({
    mutationFn: (amount: number) => api.nutrition.logWater(amount, currentDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['water-summary'] }),
  });

  const currentWater = summary?.total_water || 0;
  const target = 3000; // 3 Liters
  const progress = Math.min((currentWater / target) * 100, 100);

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Hydration</h2>
        <p className="text-zinc-500">Stay hydrated to keep your metabolism peaking.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <motion.div className="p-10 rounded-3xl bg-surface border border-border flex flex-col items-center text-center space-y-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={552} strokeDashoffset={552 - (progress / 100 * 552)} 
                strokeLinecap="round" className="text-accent-water transition-all duration-1000" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black">{Math.round(currentWater / 1000)}L</span>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">of {target/1000}L</span>
            </div>
          </div>

          <div className="flex gap-2">
            {[250, 500, 750].map(amount => (
              <button 
                key={amount} 
                onClick={() => logMutation.mutate(amount)}
                className="px-4 py-2 bg-panel border border-border rounded-xl text-sm hover:border-white transition-colors"
              >
                +{amount}ml
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
