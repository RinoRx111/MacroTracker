export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little exercise)' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (twice per day)' },
];

export const GOAL_TYPES = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
];

export const COLORS = {
  protein: 'var(--warning-state)',
  carbs: 'var(--accent-primary)',
  fat: 'var(--text-secondary)',
  primary: 'var(--accent-primary)',
  success: 'var(--accent-primary)',
  warning: 'var(--warning-state)',
  danger: 'var(--warning-state)',
};

export const MACRO_TARGETS = {
  protein_percentage: 30,
  carbs_percentage: 45,
  fat_percentage: 25,
};
