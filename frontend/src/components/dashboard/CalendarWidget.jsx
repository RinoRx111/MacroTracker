import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { analyticsApi } from '../../api/analyticsApi';
import { weightApi } from '../../api/weightApi';
import { formatDateLocal } from '../../utils/formatters';

export const CalendarWidget = ({ user, onWeightLogged }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [nutritionData, setNutritionData] = useState({});
  const [weightData, setWeightData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load calendar data when month/year changes
  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      // Get start and end of the month
      const startDateStr = formatDateLocal(new Date(year, month, 1));
      const endDateStr = formatDateLocal(new Date(year, month + 1, 0));

      const [nutritionRes, weightRes] = await Promise.all([
        analyticsApi.getNutritionData(startDateStr, endDateStr),
        analyticsApi.getWeightProgress(startDateStr, endDateStr)
      ]);

      // Map nutrition by date
      const nutritionMap = {};
      if (nutritionRes.data) {
        nutritionRes.data.forEach(item => {
          // date might be "YYYY-MM-DD"
          nutritionMap[item.date] = item;
        });
      }

      // Map weight by date
      const weightMap = {};
      if (weightRes.data) {
        weightRes.data.forEach(item => {
          // date is "YYYY-MM-DD"
          weightMap[item.date] = item.weight;
        });
      }

      setNutritionData(nutritionMap);
      setWeightData(weightMap);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight) || parseFloat(newWeight) <= 0) return;
    
    setSavingWeight(true);
    try {
      const formattedDate = selectedDayDetails.dateStr;
      await weightApi.createWeightLog({
        weight_kg: parseFloat(newWeight),
        weight_date: formattedDate,
        notes: "Logged via Calendar Widget"
      });

      // Reload calendar data
      await fetchCalendarData();
      
      // Update selected day weight log local view
      setSelectedDayDetails(prev => ({
        ...prev,
        weight: parseFloat(newWeight)
      }));

      // Trigger parent callback to update weight trend charts
      if (onWeightLogged) {
        onWeightLogged();
      }
      setNewWeight('');
    } catch (error) {
      console.error('Error saving weight from calendar:', error);
    } finally {
      setSavingWeight(false);
    }
  };

  // Calendar rendering helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarDays = [];
  
  // Padding cells before the 1st of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }

  // Actual day cells
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const dateObj = new Date(year, month, day);
    const dateStr = formatDateLocal(dateObj);
    
    const dayNutrition = nutritionData[dateStr] || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      calories_burned: 0
    };
    
    const dayWeight = weightData[dateStr] || null;

    setSelectedDayDetails({
      day,
      dateStr,
      dateFormatted: dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      calories: dayNutrition.calories,
      protein: dayNutrition.protein,
      carbs: dayNutrition.carbs,
      fat: dayNutrition.fat,
      calories_burned: dayNutrition.calories_burned,
      weight: dayWeight
    });
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-gray-700/50">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span>📅</span> Monthly Log History
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrevMonth} className="px-2.5 py-1">
            &larr;
          </Button>
          <span className="font-bold text-sm text-gray-700 dark:text-gray-200 min-w-[100px] text-center">
            {monthNames[month]} {year}
          </span>
          <Button variant="secondary" onClick={handleNextMonth} className="px-2.5 py-1">
            &rarr;
          </Button>
        </div>
      </div>

      <CardBody className="p-4">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading log history...
          </div>
        ) : (
          <div>
            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-16 bg-gray-50/30 dark:bg-gray-900/10 rounded-lg" />;
                }

                const dateObj = new Date(year, month, day);
                const dateStr = formatDateLocal(dateObj);
                const hasNutrition = nutritionData[dateStr]?.calories > 0;
                const calories = nutritionData[dateStr]?.calories || 0;
                const weight = weightData[dateStr] || null;
                const burned = nutritionData[dateStr]?.calories_burned || 0;

                const calorieGoal = user?.daily_calorie_goal || 2000;
                const calorieProgress = Math.min(100, (calories / calorieGoal) * 100);

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => handleDayClick(day)}
                    className="h-16 flex flex-col justify-between p-1.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-150 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-700/60 rounded-xl transition-all text-left focus:outline-none"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{day}</span>
                      {weight && (
                        <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
                          {weight}kg
                        </span>
                      )}
                    </div>

                    <div className="w-full space-y-1">
                      {hasNutrition && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">
                            {Math.round(calories)} kcal
                          </span>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-0.5 overflow-hidden">
                            <div 
                              className="bg-orange-500 h-full rounded-full" 
                              style={{ width: `${calorieProgress}%` }} 
                            />
                          </div>
                        </div>
                      )}
                      
                      {burned > 0 && (
                        <span className="text-[9px] font-medium text-rose-500 dark:text-rose-400 block leading-tight">
                          🔥 -{Math.round(burned)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>

      {/* Selected Day Details Modal */}
      {selectedDayDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">Log Details</h4>
              <p className="text-xs text-gray-500 mt-0.5">{selectedDayDetails.dateFormatted}</p>
            </div>
            
            <CardBody className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">Calories Logged</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{Math.round(selectedDayDetails.calories)} kcal</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Goal: {user?.daily_calorie_goal || 2000}</p>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl">
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Workout Burn</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">-{Math.round(selectedDayDetails.calories_burned)} kcal</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Goal: {user?.daily_calories_burned_goal || 500}</p>
                </div>
              </div>

              {/* Macros section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/50 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Macros Logged</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-xs text-red-500 font-semibold uppercase block">Protein</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedDayDetails.protein.toFixed(1)}g</span>
                  </div>
                  <div>
                    <span className="text-xs text-cyan-500 font-semibold uppercase block">Carbs</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedDayDetails.carbs.toFixed(1)}g</span>
                  </div>
                  <div>
                    <span className="text-xs text-yellow-500 font-semibold uppercase block">Fat</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedDayDetails.fat.toFixed(1)}g</span>
                  </div>
                </div>
              </div>

              {/* Weight Log Section */}
              <div className="p-4 bg-cyan-50/30 dark:bg-cyan-950/10 border border-cyan-100/50 dark:border-cyan-900/30 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">Daily Scale Weight</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {selectedDayDetails.weight ? `${selectedDayDetails.weight} kg` : 'Not Logged'}
                  </span>
                </div>

                <form onSubmit={handleSaveWeight} className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight in kg..."
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    disabled={savingWeight}
                  />
                  <Button type="submit" variant="primary" disabled={savingWeight || !newWeight} className="px-4 py-1.5 text-xs font-bold">
                    {savingWeight ? 'Saving...' : 'Save Weight'}
                  </Button>
                </form>
              </div>
            </CardBody>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedDayDetails(null)} className="px-5 py-2 font-bold text-sm">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
