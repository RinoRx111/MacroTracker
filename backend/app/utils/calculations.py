"""Nutrition and health calculations."""

from typing import Dict, Tuple
from datetime import datetime, date


def calculate_bmr(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str
) -> float:
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor equation."""
    if gender.lower() == "male":
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Calculate Total Daily Energy Expenditure based on activity level."""
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    multiplier = activity_multipliers.get(activity_level.lower(), 1.55)
    return bmr * multiplier


def calculate_macro_percentages(
    protein_g: float,
    carbs_g: float,
    fat_g: float
) -> Dict[str, float]:
    """Calculate macro percentages from grams."""
    protein_kcal = protein_g * 4
    carbs_kcal = carbs_g * 4
    fat_kcal = fat_g * 9
    total_kcal = protein_kcal + carbs_kcal + fat_kcal

    if total_kcal == 0:
        return {"protein": 0, "carbs": 0, "fat": 0}

    return {
        "protein": round((protein_kcal / total_kcal) * 100, 1),
        "carbs": round((carbs_kcal / total_kcal) * 100, 1),
        "fat": round((fat_kcal / total_kcal) * 100, 1),
    }


def calculate_bmi(weight_kg: float, height_cm: float) -> Tuple[float, str]:
    """Calculate Body Mass Index and category."""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)

    if bmi < 18.5:
        category = "underweight"
    elif 18.5 <= bmi < 25:
        category = "normal"
    elif 25 <= bmi < 30:
        category = "overweight"
    else:
        category = "obese"

    return round(bmi, 1), category


def estimate_daily_macros_for_goal(
    tdee: float,
    goal_type: str,
    weight_kg: float,
) -> Dict[str, float]:
    """Estimate daily macro targets based on goal and TDEE."""
    # Adjust calories based on goal
    if goal_type == "weight_loss":
        target_calories = tdee - 500  # 500 kcal deficit
    elif goal_type == "muscle_gain":
        target_calories = tdee + 300  # 300 kcal surplus
    else:  # maintenance
        target_calories = tdee

    # Protein: 1.6-2.2g per kg for muscle gain, 1.2-1.6g for maintenance/loss
    protein_multiplier = 1.8 if goal_type == "muscle_gain" else 1.6
    protein_g = weight_kg * protein_multiplier

    # Fat: 0.8-1.2g per kg (roughly 25-35% of calories)
    fat_g = weight_kg * 1.0

    # Carbs: remainder
    protein_kcal = protein_g * 4
    fat_kcal = fat_g * 9
    remaining_kcal = target_calories - protein_kcal - fat_kcal
    carbs_g = max(remaining_kcal / 4, 50)  # Minimum 50g carbs

    return {
        "calories": round(target_calories, 0),
        "protein_g": round(protein_g, 1),
        "carbs_g": round(carbs_g, 1),
        "fat_g": round(fat_g, 1),
    }


def calculate_macro_compliance(
    actual_protein_g: float,
    actual_carbs_g: float,
    actual_fat_g: float,
    target_protein_g: float,
    target_carbs_g: float,
    target_fat_g: float,
) -> Dict[str, float]:
    """Calculate how close actual macros are to targets (percentage)."""
    return {
        "protein": round((actual_protein_g / target_protein_g * 100) if target_protein_g > 0 else 0, 1),
        "carbs": round((actual_carbs_g / target_carbs_g * 100) if target_carbs_g > 0 else 0, 1),
        "fat": round((actual_fat_g / target_fat_g * 100) if target_fat_g > 0 else 0, 1),
    }
