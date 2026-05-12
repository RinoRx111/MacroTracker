// frontend/src/pages/WeightTracker.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Scale, Plus, TrendingDown } from 'lucide-react';
import { useWeight } from '../hooks/useWeight';

export const WeightTracker: React.FC = () => {
  const [weightInput, setWeightInput] = useState('');
  const { useWeightTrends, logWeightMutation } = useWeight();
  const { data: trendData, isLoading, error } = useWeightTrends();

  const handleLogWeight = async () => {
    if (!weightInput) return;
    try {
      await logWeightMutation.mutate(parseFloat(weightInput));
      setWeightInput(''); 
    } catch (e) {
      console.error("Error logging weight", e);
    }
  };

  const chartData = trendData && trendData.dates 
    ? trendData.dates.map((date: string, i: number) => ({
        date,
        weight: trendData.raw_weights[i],
        trend: trendData.trend_weights[i]
      })) 
    : [];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weight Analysis</h2>
          <p className="text-zinc-500">Your smoothed trend vs actual weight.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-full text-sm">
          <TrendingDown size={16} className="text-emerald-500" />
          <span className="text-zinc-300">Trend: <span className="text-white font-bold">
            {chartData.length > 1 ? `${(chartData[chartData.length-1].trend - chartData[0].trend).toFixed(1)}kg` : '...'}
          </span></span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="p-6 rounded-3xl bg-surface border border-border flex flex-col gap-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Scale size={18} />
            <span className="text-sm font-medium">Log Daily Weight</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="number" placeholder="00.0" 
              className="flex-1 bg-panel border border-border rounded-2xl px-4 py-2 outline-none focus:border-white transition-colors text-xl font-bold"
              value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
            />
            <button 
              onClick={handleLogWeight}
              disabled={logWeightMutation.isPending}
              className="bg-white text-black p-3 rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Plus size={24} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="p-8 rounded-3xl bg-surface border border-border h-[450px] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold">Weight Trend vs Raw Data</h3>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-zinc-600 rounded-full" /> <span className="text-zinc-500">Raw Weight</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-1 bg-white rounded-full" /> <span className="text-zinc-500">Smoothed Trend</span></div>
          </div>
        </div>
        
        <div className="flex-1 w-full relative">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-zinc-500">Loading your trends...</div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-rose-500">API Error: Please check server</div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
              <Scale size={48} className="opacity-20" />
              <p>No weight data found. Start logging to see your trend!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fafafa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" verticalLines={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="trend" stroke="#fafafa" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                <Line type="monotone" dataKey="weight" stroke="#52525b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
