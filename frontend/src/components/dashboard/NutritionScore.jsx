import React from 'react';
import { CircularProgress, ProgressBar } from '../ui/ProgressBar';
import { Card, CardHeader, CardBody } from '../ui/Card';

export const MacroCard = ({ macro, value, goal, color }) => (
  <Card className="flex items-center justify-between p-4">
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{macro}</h4>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{Math.round(value)}g</p>
      <p className="text-xs text-gray-500 dark:text-gray-500">Goal: {Math.round(goal)}g</p>
    </div>
    <div className="ml-4">
      <CircularProgress 
        value={value} 
        max={goal} 
        color={color}
        size="sm"
      />
    </div>
  </Card>
);

export const CalorieCard = ({ current, goal, remaining }) => (
  <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8">
    <div className="text-center">
      <p className="text-sm font-medium opacity-90">Today's Calories</p>
      <h2 className="text-5xl font-bold my-2">{Math.round(current)}</h2>
      <ProgressBar 
        value={current} 
        max={goal} 
        color="bg-white opacity-50"
        showLabel={false}
      />
      <p className="text-sm mt-3 opacity-90">{Math.round(remaining)} calories remaining</p>
    </div>
  </Card>
);

export const NutritionScore = ({ score = 85 }) => (
  <Card className="text-center">
    <CardHeader title="Nutrition Score" />
    <div className="flex justify-center my-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${2.827 * score} 282.7`} className="text-green-500" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">Great job today!</p>
  </Card>
);
