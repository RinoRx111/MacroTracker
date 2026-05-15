import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { COLORS } from '../../utils/constants';

export const MacroPieChart = ({ data }) => {
  if (!data || Object.values(data).every(v => v === 0)) {
    return (
      <Card>
        <CardHeader title="Macro Distribution" subtitle="Add food to see breakdown" />
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </Card>
    );
  }

  const chartData = [
    { name: 'Protein', value: data.protein || 0, color: COLORS.protein },
    { name: 'Carbs', value: data.carbs || 0, color: COLORS.carbs },
    { name: 'Fat', value: data.fat || 0, color: COLORS.fat },
  ];

  return (
    <Card>
      <CardHeader title="Macro Distribution" subtitle="Percentage breakdown" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
