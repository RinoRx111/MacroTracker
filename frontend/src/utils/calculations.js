export const calculateMacroRatios = (calories, protein, carbs, fat) => {
  return {
    proteinGrams: calories * 0.3 / 4,
    carbsGrams: calories * 0.45 / 4,
    fatGrams: calories * 0.25 / 9,
  };
};

export const calculateCalorieTarget = (weight, height, age, gender, activity) => {
  // Mifflin-St Jeor equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const multiplier = activityMultipliers[activity] || 1.55;
  return Math.round(bmr * multiplier);
};

export const calculateBMI = (weight, height) => {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  
  return { bmi: Math.round(bmi * 10) / 10, category };
};

export const calculateWeightGoal = (currentWeight, goalType) => {
  if (goalType === 'weight_loss') {
    return Math.round((currentWeight - currentWeight * 0.1) * 10) / 10;
  } else if (goalType === 'muscle_gain') {
    return Math.round((currentWeight + currentWeight * 0.05) * 10) / 10;
  }
  return currentWeight;
};

export const calculateProgressPercentage = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.round((current / target) * 100);
};
