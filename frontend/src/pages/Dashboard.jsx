import React from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { CalorieCard, MacroCard, NutritionScore } from '../components/dashboard/NutritionScore';
import { MacroSummary } from '../components/dashboard/MacroSummary';
import { MacroPieChart } from '../components/charts/MacroPieChart';
import { Loader } from '../components/ui/Loader';
import { WaterTracker } from '../components/dashboard/WaterTracker';
import { ActivityTracker } from '../components/dashboard/ActivityTracker';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { CalendarWidget } from '../components/dashboard/CalendarWidget';

export const Dashboard = ({ user, profile, loading, error, dailySummary, reloadSummary, reloadProfile }) => {
  const [showCalendar, setShowCalendar] = React.useState(false);

  React.useEffect(() => {
    if (reloadSummary) {
      reloadSummary();
    }
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500 font-semibold">Failed to load profile details</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <Button variant="secondary" onClick={() => { reloadProfile?.(); reloadSummary?.(); }}>
          Retry
        </Button>
      </div>
    );
  }

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
      <div className="flex justify-end">
        <Button 
          variant="secondary" 
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 border border-[var(--border-main)] hover:bg-[var(--bg-card-tint)] text-[var(--text-primary)] font-bold px-4 py-2 rounded-xl transition-all"
        >
          <span>{showCalendar ? '📅 Hide Calendar History' : '📅 Show Calendar History'}</span>
        </Button>
      </div>

      {showCalendar && (
        <CalendarWidget 
          user={profile} 
          onWeightLogged={reloadSummary} 
        />
      )}

      {dailySummary && (
        <CalorieCard
          current={dailySummary.nutrition?.calories ?? 0}
          goal={dailySummary.goals?.calories ?? profile.daily_calorie_goal}
          remaining={dailySummary.remaining?.calories ?? 0}
        />
      )}

      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MacroCard
            macro="Protein"
            value={dailySummary.nutrition?.protein_g ?? 0}
            goal={dailySummary.goals?.protein_g ?? profile.protein_goal_g}
          />
          <MacroCard
            macro="Carbs"
            value={dailySummary.nutrition?.carbs_g ?? 0}
            goal={dailySummary.goals?.carbs_g ?? profile.carbs_goal_g}
          />
          <MacroCard
            macro="Fat"
            value={dailySummary.nutrition?.fat_g ?? 0}
            goal={dailySummary.goals?.fat_g ?? profile.fat_goal_g}
          />
          <Card className="p-4 flex flex-col justify-between h-full">
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Active Burn</h4>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-[var(--text-primary)] stat-number">
                  {Math.round(dailySummary.workout?.calories_burned || 0)}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">/ {dailySummary.goals?.calories_burned || 500} kcal</span>
              </div>
            </div>
            <ProgressBar 
              value={dailySummary.workout?.calories_burned || 0} 
              max={dailySummary.goals?.calories_burned || 500} 
              color="bg-[var(--accent-primary)]"
              showLabel={false}
            />
          </Card>
        </div>
      )}

      {/* Steps & Hydration widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTracker 
          activity={dailySummary?.activity} 
          goal={dailySummary?.goals?.steps || 10000} 
          onUpdate={reloadSummary}
        />
        <WaterTracker 
          initialAmount={dailySummary?.water?.amount_ml || 0} 
          goal={dailySummary?.goals?.water_ml || 2000} 
          onUpdate={reloadSummary}
        />
      </div>

      {/* Today's Workouts List */}
      {dailySummary?.workout?.logs && dailySummary.workout.logs.length > 0 && (
        <Card>
          <CardHeader 
            title="Today's Workouts" 
            subtitle={`Total Burned: ${Math.round(dailySummary.workout.calories_burned)} kcal | Active Time: ${dailySummary.workout.duration_minutes} mins`} 
          />
          <CardBody>
            <div className="divide-y divide-gray-150 dark:divide-gray-700">
              {dailySummary.workout.logs.map((workout) => (
                <div key={workout.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{workout.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{workout.category} • {workout.duration_minutes} mins • {workout.intensity} intensity</p>
                  </div>
                  <span className="text-sm font-bold text-rose-500">-{Math.round(workout.calories_burned)} kcal</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
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
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dailySummary?.water?.amount_ml || 0}ml</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
