import React from 'react';
import { Card } from '../ui/Card';

export const MealSection = ({ title, emoji, foods = [], onAddFood, onDeleteFood }) => {
  const totalCalories = foods.reduce((sum, f) => sum + (f.calories_kcal || 0), 0);
  const totalProtein = foods.reduce((sum, f) => sum + (f.protein_g || 0), 0);
  const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs_g || 0), 0);
  const totalFat = foods.reduce((sum, f) => sum + (f.fat_g || 0), 0);

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          <span className="mr-2">{emoji}</span>{title}
        </h3>
        <button
          onClick={onAddFood}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          + Add
        </button>
      </div>

      {foods.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No foods logged</p>
      ) : (
        <div>
          {foods.map(food => (
            <div key={food.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{food.food_name}</p>
                <p className="text-xs text-gray-500">{food.portion_size}{food.portion_unit}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{Math.round(food.calories_kcal)}</p>
                </div>
                {onDeleteFood && (
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="text-red-500 hover:text-red-700 hover:scale-110 transition-all p-1.5 focus:outline-none"
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 grid grid-cols-4 gap-2 text-sm font-semibold">
            <div>Cal: {Math.round(totalCalories)}</div>
            <div>P: {totalProtein.toFixed(1)}g</div>
            <div>C: {totalCarbs.toFixed(1)}g</div>
            <div>F: {totalFat.toFixed(1)}g</div>
          </div>
        </div>
      )}
    </Card>
  );
};
