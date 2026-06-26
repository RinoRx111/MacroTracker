import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const WaterChart = ({ data, goal = 2000 }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Water Intake Trends" subtitle="Last 7 days" />
        <div className="h-64 flex items-center justify-center text-[var(--text-secondary)] font-medium">
          No data available
        </div>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    water: item.amount_ml,
  }));

  return (
    <Card>
      <CardHeader title="Water Intake Trends" subtitle="Last 7 days" />
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
              stroke="var(--hydration-accent)" 
              strokeDasharray="3 3" 
              label={{ value: 'Goal', position: 'top', fill: 'var(--hydration-accent)', fontSize: 10, fontFamily: 'var(--font-body)' }} 
            />
            <Bar 
              dataKey="water" 
              fill="var(--hydration-accent)" 
              radius={[4, 4, 0, 0]}
              name="Water (ml)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
