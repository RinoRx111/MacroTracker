import React from 'react';
import { ProgressBar } from '../ui/ProgressBar';
import { Card, CardHeader, CardBody } from '../ui/Card';

export const MacroCard = ({ macro, value, goal }) => (
  <Card className="p-4 flex flex-col justify-between h-full">
    <div className="mb-3">
      <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{macro}</h4>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl font-extrabold text-[var(--text-primary)] stat-number">{Math.round(value)}g</span>
        <span className="text-xs text-[var(--text-secondary)]">/ {Math.round(goal)}g</span>
      </div>
    </div>
    <ProgressBar 
      value={value} 
      max={goal} 
      color="bg-[var(--accent-primary)]"
      showLabel={false}
    />
  </Card>
);

export const CalorieCard = ({ current, goal, remaining }) => {
  const isOverBudget = remaining < 0;
  
  return (
    <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex-1 text-center md:text-left">
        <p className="text-xs md:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Today's Calories</p>
        <h2 className="text-6xl md:text-7xl font-extrabold text-[var(--text-primary)] mt-2 mb-2 display-number tracking-tight">
          {Math.round(current)} <span className="text-2xl md:text-3xl font-medium text-[var(--text-secondary)] uppercase tracking-wide">kcal</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Daily Goal: <span className="stat-number font-bold text-[var(--text-primary)]">{Math.round(goal)} kcal</span>
        </p>
      </div>
      
      <div className="w-full md:w-96 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Calorie Balance</span>
          <span className={`text-sm font-bold stat-number ${isOverBudget ? 'text-[var(--warning-state)]' : 'text-[var(--accent-primary)]'}`}>
            {isOverBudget 
              ? `${Math.abs(Math.round(remaining))} kcal over`
              : `${Math.round(remaining)} kcal remaining`}
          </span>
        </div>
        <ProgressBar 
          value={current} 
          max={goal} 
          color={isOverBudget ? "bg-[var(--warning-state)]" : "bg-[var(--accent-primary)]"}
          showLabel={false}
        />
      </div>
    </Card>
  );
};

export const NutritionScore = ({ score = 85 }) => (
  <Card className="p-4 md:p-6">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-center md:text-left">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Nutrition Score</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Consistency check based on macro ratios</p>
      </div>
      
      <div className="w-full md:w-80 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-semibold">Daily Score</span>
          <span className="text-2xl font-extrabold text-[var(--text-primary)] stat-number">{score} / 100</span>
        </div>
        <ProgressBar 
          value={score} 
          max={100} 
          color="bg-[var(--accent-primary)]"
          showLabel={false}
        />
      </div>
    </div>
  </Card>
);
