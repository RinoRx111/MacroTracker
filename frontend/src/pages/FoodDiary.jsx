import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FoodSearch } from '../components/food/FoodSearch';
import { MealSection } from '../components/food/MealSection';
import { useFood } from '../hooks/useFood';

export const FoodDiary = ({ user }) => {
  const { foods, loading, error, fetchDailyLogs, addFoodLog, searchFoods, deleteFoodLog } = useFood();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [mealFoods, setMealFoods] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  useEffect(() => {
    fetchDailyLogs();
  }, []);

  useEffect(() => {
    const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };
    foods.forEach(food => {
      if (grouped[food.meal_type]) {
        grouped[food.meal_type].push(food);
      }
    });
    setMealFoods(grouped);
  }, [foods]);

  const handleAddFood = async (foodItem) => {
    const foodLog = {
      food_name: foodItem.name,
      portion_size: 100,
      portion_unit: 'g',
      calories_kcal: foodItem.calories_per_100g,
      protein_g: foodItem.protein_per_100g,
      carbs_g: foodItem.carbs_per_100g,
      fat_g: foodItem.fat_per_100g,
      meal_type: selectedMeal,
    };
    await addFoodLog(foodLog);
    setShowSearchModal(false);
  };

  const totalCalories = Object.values(mealFoods)
    .flat()
    .reduce((sum, f) => sum + (f.calories_kcal || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <h2 className="text-3xl font-bold mb-2">{Math.round(totalCalories)}</h2>
        <p className="opacity-90">Calories Logged Today</p>
      </Card>

      <MealSection
        title="Breakfast"
        emoji="🌅"
        foods={mealFoods.breakfast}
        onAddFood={() => { setSelectedMeal('breakfast'); setShowSearchModal(true); }}
      />
      <MealSection
        title="Lunch"
        emoji="🥗"
        foods={mealFoods.lunch}
        onAddFood={() => { setSelectedMeal('lunch'); setShowSearchModal(true); }}
      />
      <MealSection
        title="Dinner"
        emoji="🍽️"
        foods={mealFoods.dinner}
        onAddFood={() => { setSelectedMeal('dinner'); setShowSearchModal(true); }}
      />
      <MealSection
        title="Snacks"
        emoji="🍿"
        foods={mealFoods.snack}
        onAddFood={() => { setSelectedMeal('snack'); setShowSearchModal(true); }}
      />

      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader title={`Add to ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`} />
            <div className="mb-4">
              <Button variant="secondary" onClick={() => setShowSearchModal(false)} className="w-full">
                Close
              </Button>
            </div>
            <FoodSearch onSearch={searchFoods} onSelect={handleAddFood} />
          </Card>
        </div>
      )}
    </div>
  );
};
