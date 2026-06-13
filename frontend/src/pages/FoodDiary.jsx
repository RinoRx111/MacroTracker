import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FoodSearch } from '../components/food/FoodSearch';
import { MealSection } from '../components/food/MealSection';
import { useFood } from '../hooks/useFood';

export const FoodDiary = ({ user }) => {
  const { foods, loading, error, fetchDailyLogs, addFoodLog, searchFoods, deleteFoodLog, parseFoodText, addFoodLogsBatch } = useFood();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [inputText, setInputText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState([]);
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

  const handleParseText = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setParsing(true);
    try {
      const data = await parseFoodText(inputText);
      if (data) {
        setParsedPreview(data);
      }
    } catch (err) {
      console.error('Error parsing food text:', err);
    } finally {
      setParsing(false);
    }
  };

  const handleClearPreview = () => {
    setParsedPreview([]);
    setInputText('');
  };

  const handleLogBatch = async () => {
    if (parsedPreview.length === 0) return;
    setParsing(true);
    try {
      const loggedData = await addFoodLogsBatch(parsedPreview);
      if (loggedData) {
        handleClearPreview();
      }
    } catch (err) {
      console.error('Error batch logging foods:', err);
    } finally {
      setParsing(false);
    }
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

      {/* AI Quick Log Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Quick Log</h3>
            <p className="text-xs text-gray-500">Type meals in plain language (e.g. "134gm chicken breast, 4 boiled eggs, 3 chapati each of 50g")</p>
          </div>
        </div>

        <form onSubmit={handleParseText} className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your foods here..."
            rows={3}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
            disabled={parsing}
          />
          <div className="flex justify-end gap-2">
            {parsedPreview.length > 0 && (
              <Button type="button" variant="secondary" onClick={handleClearPreview} disabled={parsing}>
                Clear
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={parsing || !inputText.trim()}>
              {parsing ? 'Estimating...' : 'Estimate Nutrition'}
            </Button>
          </div>
        </form>

        {parsedPreview.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Nutrition Preview</h4>
            <div className="space-y-2">
              {parsedPreview.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">{item.food_name}</div>
                    <div className="text-xs text-gray-500">{item.portion_size}g · {item.meal_type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">{Math.round(item.calories_kcal)} kcal</div>
                    <div className="flex gap-2 text-[10px] font-semibold text-gray-400 uppercase">
                      <span className="text-red-500">P: {Math.round(item.protein_g)}g</span>
                      <span className="text-cyan-500">C: {Math.round(item.carbs_g)}g</span>
                      <span className="text-yellow-500">F: {Math.round(item.fat_g)}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" onClick={handleLogBatch} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all" disabled={parsing}>
              Log all {parsedPreview.length} items to Diary
            </Button>
          </div>
        )}
      </Card>

      <MealSection
        title="Breakfast"
        emoji="🌅"
        foods={mealFoods.breakfast}
        onAddFood={() => { setSelectedMeal('breakfast'); setShowSearchModal(true); }}
        onDeleteFood={deleteFoodLog}
      />
      <MealSection
        title="Lunch"
        emoji="🥗"
        foods={mealFoods.lunch}
        onAddFood={() => { setSelectedMeal('lunch'); setShowSearchModal(true); }}
        onDeleteFood={deleteFoodLog}
      />
      <MealSection
        title="Dinner"
        emoji="🍽️"
        foods={mealFoods.dinner}
        onAddFood={() => { setSelectedMeal('dinner'); setShowSearchModal(true); }}
        onDeleteFood={deleteFoodLog}
      />
      <MealSection
        title="Snacks"
        emoji="🍿"
        foods={mealFoods.snack}
        onAddFood={() => { setSelectedMeal('snack'); setShowSearchModal(true); }}
        onDeleteFood={deleteFoodLog}
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
