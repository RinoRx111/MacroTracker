import React from 'react';
import { Card } from '../ui/Card';
import { getMealEmoji } from '../../utils/formatters';

export const FoodCard = ({ food, onDelete }) => {
  return (
    <Card className="flex justify-between items-start p-4 mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{getMealEmoji(food.meal_type)}</span>
          <h3 className="font-semibold text-gray-900 dark:text-white">{food.food_name}</h3>
        </div>
        {food.brand && <p className="text-xs text-gray-500">{food.brand}</p>}
        <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
            <p className="text-xs text-gray-500">Cal</p>
            <p className="font-semibold text-gray-900 dark:text-white">{Math.round(food.calories_kcal)}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
            <p className="text-xs text-gray-500">Protein</p>
            <p className="font-semibold text-gray-900 dark:text-white">{food.protein_g}g</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
            <p className="text-xs text-gray-500">Carbs</p>
            <p className="font-semibold text-gray-900 dark:text-white">{food.carbs_g}g</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
            <p className="text-xs text-gray-500">Fat</p>
            <p className="font-semibold text-gray-900 dark:text-white">{food.fat_g}g</p>
          </div>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(food.id)}
          className="ml-4 text-gray-400 hover:text-red-500 transition"
        >
          ✕
        </button>
      )}
    </Card>
  );
};
