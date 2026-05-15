import React from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { COLORS } from '../../utils/constants';

export const MacroSummary = ({ summary }) => {
  if (!summary) {
    return (
      <Card>
        <CardHeader title="Macro Breakdown" subtitle="No data available" />
      </Card>
    );
  }

  const { protein_percentage, carbs_percentage, fat_percentage } = summary.macro_percentages || {};

  return (
    <Card>
      <CardHeader title="Macro Breakdown" subtitle="Today's distribution" />
      <CardBody>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Protein</span>
              <span className="text-sm font-semibold" style={{ color: COLORS.protein }}>
                {protein_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="h-full rounded-full" style={{ 
                backgroundColor: COLORS.protein, 
                width: `${protein_percentage || 0}%` 
              }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Carbs</span>
              <span className="text-sm font-semibold" style={{ color: COLORS.carbs }}>
                {carbs_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="h-full rounded-full" style={{ 
                backgroundColor: COLORS.carbs, 
                width: `${carbs_percentage || 0}%` 
              }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Fat</span>
              <span className="text-sm font-semibold" style={{ color: COLORS.fat }}>
                {fat_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="h-full rounded-full" style={{ 
                backgroundColor: COLORS.fat, 
                width: `${fat_percentage || 0}%` 
              }} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
