import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const WeightTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Weight Trend" subtitle="Track your progress" />
        <div className="h-64 flex items-center justify-center text-gray-500">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              formatter={(value) => `${value} kg`}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
