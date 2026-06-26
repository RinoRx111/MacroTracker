import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CalorieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Calorie Trends" subtitle="Last 7 days" />
        <div className="h-64 flex items-center justify-center text-[var(--text-secondary)] font-medium">
          No data available
        </div>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: Math.round(item.calories),
    burned: Math.round(item.calories_burned || 0),
  }));

  return (
    <Card>
      <CardHeader title="Calorie Trends" subtitle="Consumed vs Burned (Last 7 days)" />
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
            />
            <Line 
              type="monotone" 
              name="Consumed (kcal)"
              dataKey="calories" 
              stroke="var(--accent-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--accent-primary)' }}
            />
            <Line 
              type="monotone" 
              name="Burned (kcal)"
              dataKey="burned" 
              stroke="var(--warning-state)" 
              strokeWidth={2}
              dot={{ fill: 'var(--warning-state)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
