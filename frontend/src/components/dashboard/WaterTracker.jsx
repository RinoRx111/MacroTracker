import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { waterApi } from '../../api/waterApi';
import { formatDateLocal } from '../../utils/formatters';

export const WaterTracker = ({ initialAmount = 0, goal = 2000, onUpdate }) => {
  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const handleAddWater = async (ml) => {
    const newAmount = Math.max(0, amount + ml);
    setAmount(newAmount);
    setLoading(true);
    try {
      const today = formatDateLocal();
      await waterApi.updateWaterLog({ amount_ml: newAmount, logged_date: today });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error logging water:', error);
    } finally {
      setLoading(false);
    }
  };

  const percentage = Math.min(Math.round((amount / goal) * 100), 100);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Water Intake 💧</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track your hydration goals</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-semibold px-2.5 py-0.5 rounded-full">
          Goal: {goal} ml
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Animated Water Cup */}
        <div className="md:col-span-4 flex justify-center">
          <div className="relative w-28 h-36 border-4 border-gray-300 dark:border-gray-600 rounded-b-2xl rounded-t-lg overflow-hidden flex items-end justify-center bg-gray-100 dark:bg-gray-800 shadow-inner">
            {/* Water fill level */}
            <div 
              className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-700 ease-out"
              style={{ height: `${percentage}%` }}
            />
            {/* Overlay statistics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-lg font-extrabold text-gray-900 dark:text-white drop-shadow-md">
                {amount}
              </span>
              <span className="text-xxs text-gray-600 dark:text-gray-300 drop-shadow-md font-semibold">
                / {goal} ml
              </span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-1 drop-shadow-md">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Controls */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
            {amount >= goal 
              ? '🎉 Hydration target achieved! Great job!' 
              : `You are ${(goal - amount).toLocaleString()} ml away from your target.`}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleAddWater(250)}
              disabled={loading}
              className="text-xs py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-300"
            >
              +250ml 🥛
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleAddWater(500)}
              disabled={loading}
              className="text-xs py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-300"
            >
              +500ml 🥤
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => handleAddWater(750)}
              disabled={loading}
              className="text-xs py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-300"
            >
              +750ml 🫙
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddWater(-250)}
              disabled={loading || amount <= 0}
              className="flex-1 text-xs text-gray-600 hover:text-red-600 dark:text-gray-300"
            >
              Remove 250ml
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddWater(-amount)}
              disabled={loading || amount === 0}
              className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Reset 🔄
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
