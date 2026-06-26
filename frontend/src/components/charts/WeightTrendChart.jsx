import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeightTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Weight Trend" subtitle="Track your progress" />
        <div className="h-64 flex items-center justify-center text-[var(--text-secondary)] font-medium">
          No weight data available
        </div>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(item.weight.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader title="Weight Trend" subtitle="Track your progress" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)' }}
              stroke="var(--border-main)"
            />
            <YAxis 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-body)' }}
              stroke="var(--border-main)"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-card)', 
                borderColor: 'var(--border-main)', 
                borderRadius: '8px', 
                color: 'var(--text-primary)', 
                fontFamily: 'var(--font-body)' 
              }} 
              itemStyle={{ color: 'var(--text-primary)' }}
              labelStyle={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}
              formatter={(value) => `${value} kg`}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="var(--accent-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--accent-primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
