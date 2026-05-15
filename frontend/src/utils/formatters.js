export const formatDate = (date) => {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDatetime = (date) => {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num) => {
  return Math.round(num * 10) / 10;
};

export const formatCalories = (cal) => {
  return Math.round(cal);
};

export const getMealEmoji = (mealType) => {
  const emojis = {
    breakfast: '🌅',
    lunch: '🥗',
    dinner: '🍽️',
    snack: '🍿',
  };
  return emojis[mealType] || '🍴';
};

export const calculateCaloriesFromMacros = (protein, carbs, fat) => {
  return protein * 4 + carbs * 4 + fat * 9;
};

export const calculateMacroPercentages = (protein, carbs, fat) => {
  const total = calculateCaloriesFromMacros(protein, carbs, fat);
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  
  return {
    protein: Math.round((protein * 4) / total * 100),
    carbs: Math.round((carbs * 4) / total * 100),
    fat: Math.round((fat * 9) / total * 100),
  };
};

export const getDateRange = (days) => {
  const range = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    range.push(date.toISOString().split('T')[0]);
  }
  return range;
};

export const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

export const daysAgo = (date) => {
  const today = new Date();
  const d = new Date(date);
  const diff = today - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};
