import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api/client';

export const Analytics: React.FC = () => {
  const { data: trends } = useQuery({
    queryKey: ['weight-trends'],
    queryFn: async () => {
      const { data } = await api.weight.getTrends();
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-zinc-500">Your trends over time — the truth behind the numbers.</p>
      </header>

      <div className="p-8 rounded-3xl bg-surface border border-border">
        <h3 className="text-lg font-bold mb-6">Weight Trend (EMA)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trends?.ema_data || []}>
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#52525b" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="raw_weight" stroke="#3f3f46" strokeWidth={1} fill="none" dot={false} name="Daily Weight" />
            <Area type="monotone" dataKey="ema_weight" stroke="#ffffff" strokeWidth={2} fill="url(#weightGrad)" dot={false} name="Trend (EMA)" />
          </AreaChart>
        </ResponsiveContainer>
        {(!trends || trends.ema_data?.length === 0) && (
          <p className="text-center text-zinc-600 mt-8">Log at least 3 weight entries to see your trend.</p>
        )}
      </div>
    </div>
  );
};