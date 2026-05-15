import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const CalorieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Calorie Trends" subtitle="Last 7 days" />
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    calories: Math.round(item.calories),
  }));

  return (
    <Card>
      <CardHeader title="Calorie Trends" subtitle="Last 7 days" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="#a78bfa" 
              strokeWidth={2}
              dot={{ fill: '#a78bfa' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
