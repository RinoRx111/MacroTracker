// frontend/src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { FoodSearchModal } from '../components/features/logging/FoodSearchModal';
import { useNutrition } from '../hooks/useNutrition';
import { useAppStore } from '../store/useAppStore';

const MacroRing = ({ label, value, target, color }: { label: string, value: number, target: number, color: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border" />
        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
          strokeDasharray={226} strokeDashoffset={226 - (Math.min(value / target, 1) * 226)} 
          strokeLinecap="round" className={color} />
      </svg>
      <span className="absolute text-xs font-bold">{Math.round(value)}g</span>
    </div>
    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</span>
  </div>
);

export const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentDate } = useAppStore();
  const { useSummary } = useNutrition();
  
  const { data: summary, isLoading, error } = useSummary(currentDate);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <p className="text-xl font-bold">⚠️ API Connection Error</p>
        <p className="text-sm">Make sure your Python server is running!</p>
        <div className="px-4 py-2 bg-border rounded-full text-xs">Check: http://127.0.0.1:8000</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  const caloriesEaten = summary?.total_calories || 0;
  const caloriesRemaining = summary?.remaining_calories || 2000;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good Morning, User</h2>
          <p className="text-zinc-500">Here is your nutrition overview for today.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
        >
          <Plus size={20} />
          <span>Add Food</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 p-8 rounded-3xl bg-surface border border-border flex flex-col justify-center items-center relative overflow-hidden">
          <div className="text-center relative z-10">
            <span className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Calories Remaining</span>
            <h3 className="text-7xl font-black mt-2 mb-4">{Math.round(caloriesRemaining)}</h3>
            <div className="flex gap-4 justify-center">
              <span className="px-3 py-1 bg-border rounded-full text-xs text-zinc-400">Target: {Math.round(summary?.goal_calories || 2000)}</span>
              <span className="px-3 py-1 bg-border rounded-full text-xs text-zinc-400">Eaten: {Math.round(caloriesEaten)}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-20 -mt-20" />
        </motion.div>

        <div className="p-8 rounded-3xl bg-surface border border-border grid grid-cols-3 gap-4">
          <MacroRing label="Protein" value={summary?.total_protein || 0} target={160} color="text-accent-protein" />
          <MacroRing label="Carbs" value={summary?.total_carbs || 0} target={200} color="text-accent-carbs" />
          <MacroRing label="Fats" value={summary?.total_fats || 0} target={70} color="text-accent-fats" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface border border-border">
          <p className="text-zinc-500 text-sm mb-1">Weight Trend</p>
          <h4 className="text-xl font-bold">-0.4 kg <span className="text-emerald-500 text-xs">↓ this week</span></h4>
        </div>
        <div className="p-6 rounded-3xl bg-surface border border-border">
          <p className="text-zinc-500 text-sm mb-1">Water Intake</p>
          <h4 className="text-xl font-bold">{summary?.total_water || 1.2} / {summary?.water_target || 3.0} L</h4>
        </div>
        <div className="p-6 rounded-3xl bg-surface border border-border">
          <p className="text-zinc-500 text-sm mb-1">Consistency</p>
          <h4 className="text-xl font-bold">85% <span className="text-zinc-400 text-xs">of goals met</span></h4>
        </div>
      </div>

      <FoodSearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
