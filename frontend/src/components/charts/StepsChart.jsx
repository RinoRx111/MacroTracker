import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const StepsChart = ({ data, goal = 10000 }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Step Trends" subtitle="Last 7 days" />
        <div className="h-64 flex items-center justify-center text-[var(--text-secondary)] font-medium">
          No data available
        </div>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    steps: item.steps,
  }));

  return (
    <Card>
      <CardHeader title="Step Trends" subtitle="Last 7 days" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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
            <ReferenceLine 
              y={goal} 
              stroke="var(--accent-primary)" 
              strokeDasharray="3 3" 
              label={{ value: 'Goal', position: 'top', fill: 'var(--accent-primary)', fontSize: 10, fontFamily: 'var(--font-body)' }} 
            />
            <Bar 
              dataKey="steps" 
              fill="var(--accent-primary)" 
              radius={[4, 4, 0, 0]}
              name="Steps"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
