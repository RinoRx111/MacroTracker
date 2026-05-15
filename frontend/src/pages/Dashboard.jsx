import React from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { CalorieCard, MacroCard, NutritionScore } from '../components/dashboard/NutritionScore';
import { MacroSummary } from '../components/dashboard/MacroSummary';
import { MacroPieChart } from '../components/charts/MacroPieChart';
import { Loader } from '../components/ui/Loader';

export const Dashboard = ({ user, profile, loading, dailySummary }) => {
  if (loading) {
    return <Loader fullPage />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {dailySummary && (
        <CalorieCard
          current={dailySummary.nutrition?.calories ?? 0}
          goal={dailySummary.goals?.calories ?? profile.daily_calorie_goal}
          remaining={dailySummary.remaining?.calories ?? 0}
        />
      )}

      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MacroCard
            macro="Protein"
            value={dailySummary.nutrition?.protein_g ?? 0}
            goal={dailySummary.goals?.protein_g ?? profile.protein_goal_g}
            color="text-red-600"
          />
          <MacroCard
            macro="Carbs"
            value={dailySummary.nutrition?.carbs_g ?? 0}
            goal={dailySummary.goals?.carbs_g ?? profile.carbs_goal_g}
            color="text-cyan-600"
          />
          <MacroCard
            macro="Fat"
            value={dailySummary.nutrition?.fat_g ?? 0}
            goal={dailySummary.goals?.fat_g ?? profile.fat_goal_g}
            color="text-yellow-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MacroSummary summary={dailySummary} />
        <MacroPieChart data={dailySummary?.macro_percentages} />
      </div>

      <NutritionScore score={85} />

      <Card>
        <CardHeader title="Today's Stats" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Meals</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dailySummary?.meal_count || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Calories</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(dailySummary?.nutrition?.calories || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Protein</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{(dailySummary?.nutrition?.protein_g ?? 0).toFixed(1)}g</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Water</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">—</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
