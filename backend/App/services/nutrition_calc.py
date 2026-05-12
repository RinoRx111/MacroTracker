# backend/App/services/nutrition_calc.py
from typing import Dict

class NutritionCalculator:
    @staticmethod
    def calculate_tdee(weight: float, height: float, age: int, gender: str, activity: float) -> float:
        """
        Mifflin-St Jeor Equation to calculate maintenance calories
        """
        if gender.lower() == 'male':
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        else:
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
        
        return bmr * activity

    @staticmethod
    def calculate_macro_split(calories: float, protein_ratio: float = 0.3, fat_ratio: float = 0.3) -> Dict[str, float]:
        """
        Splits calories into Protein, Carbs, and Fats
        Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
        """
        protein_cals = calories * protein_ratio
        fat_cals = calories * fat_ratio
        carb_cals = calories - (protein_cals + fat_cals)

        return {
            "protein": protein_cals / 4,
            "fats": fat_cals / 9,
            "carbs": carb_cals / 4
        }
