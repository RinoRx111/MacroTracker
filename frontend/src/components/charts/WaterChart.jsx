import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const WaterChart = ({ data, goal = 2000 }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="Water Intake Trends" subtitle="Last 7 days" />
        <div className="h-64 flex items-center justify-center text-gray-500">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            <ReferenceLine y={goal} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Goal', position: 'top', fill: '#3b82f6', fontSize: 10 }} />
            <Bar 
              dataKey="water" 
              fill="#60a5fa" 
              radius={[4, 4, 0, 0]}
              name="Water (ml)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
