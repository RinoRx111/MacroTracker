import pytest
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_path = Path(__file__).parent.parent.resolve()
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

from app.utils.calculations import (
    calculate_bmr,
    calculate_tdee,
    calculate_macro_percentages,
    calculate_bmi,
    estimate_daily_macros_for_goal,
    calculate_macro_compliance,
)

def test_calculate_bmr():
    # Male: (10 * 70) + (6.25 * 175) - (5 * 25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    assert calculate_bmr(70.0, 175.0, 25, "male") == 1673.75
    
    # Female: (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    assert calculate_bmr(60.0, 165.0, 30, "female") == 1320.25

def test_calculate_tdee():
    bmr = 1500.0
    assert calculate_tdee(bmr, "sedentary") == 1800.0
    assert calculate_tdee(bmr, "light") == 2062.5
    assert calculate_tdee(bmr, "moderate") == 2325.0
    assert calculate_tdee(bmr, "active") == 2587.5
    assert calculate_tdee(bmr, "very_active") == 2850.0
    assert calculate_tdee(bmr, "unknown_level") == 2325.0  # Default to moderate

def test_calculate_macro_percentages():
    # Protein: 100g = 400 kcal
    # Carbs: 200g = 800 kcal
    # Fat: 50g = 450 kcal
    # Total = 1650 kcal
    # P%: 400/1650 * 100 = 24.2%
    # C%: 800/1650 * 100 = 48.5%
    # F%: 450/1650 * 100 = 27.3%
    res = calculate_macro_percentages(100.0, 200.0, 50.0)
    assert res["protein"] == 24.2
    assert res["carbs"] == 48.5
    assert res["fat"] == 27.3
    
    # Zero totals
    assert calculate_macro_percentages(0.0, 0.0, 0.0) == {"protein": 0, "carbs": 0, "fat": 0}

def test_calculate_bmi():
    # Standard: 70kg, 1.75m -> 70 / (1.75^2) = 22.857 -> 22.9, category normal
    bmi, cat = calculate_bmi(70.0, 175.0)
    assert bmi == 22.9
    assert cat == "normal"
    
    # Underweight: 50kg, 1.75m -> 50 / 3.0625 = 16.32 -> 16.3
    bmi, cat = calculate_bmi(50.0, 175.0)
    assert bmi == 16.3
    assert cat == "underweight"
    
    # Overweight: 85kg, 1.75m -> 85 / 3.0625 = 27.75 -> 27.8
    bmi, cat = calculate_bmi(85.0, 175.0)
    assert bmi == 27.8
    assert cat == "overweight"
    
    # Obese: 100kg, 1.75m -> 100 / 3.0625 = 32.65 -> 32.7
    bmi, cat = calculate_bmi(100.0, 175.0)
    assert bmi == 32.7
    assert cat == "obese"

def test_calculate_bmi_robustness():
    # Division-by-zero prevention test cases
    assert calculate_bmi(70.0, 0.0) == (0.0, "unknown")
    assert calculate_bmi(70.0, -150.0) == (0.0, "unknown")
    assert calculate_bmi(0.0, 175.0) == (0.0, "unknown")
    assert calculate_bmi(-70.0, 175.0) == (0.0, "unknown")
    assert calculate_bmi(0.0, 0.0) == (0.0, "unknown")

def test_estimate_daily_macros_for_goal():
    tdee = 2500.0
    weight = 70.0
    
    # weight_loss: calorie target = 2000
    # protein = 70 * 1.6 = 112g
    # fat = 70 * 1.0 = 70g
    # remaining_kcal = 2000 - (112*4) - (70*9) = 2000 - 448 - 630 = 922 kcal -> carbs = 922/4 = 230.5g
    res_loss = estimate_daily_macros_for_goal(tdee, "weight_loss", weight)
    assert res_loss["calories"] == 2000.0
    assert res_loss["protein_g"] == 112.0
    assert res_loss["fat_g"] == 70.0
    assert res_loss["carbs_g"] == 230.5
    
    # muscle_gain: calorie target = 2800
    # protein = 70 * 1.8 = 126g
    # fat = 70 * 1.0 = 70g
    # remaining_kcal = 2800 - 504 - 630 = 1666 kcal -> carbs = 1666/4 = 416.5g
    res_gain = estimate_daily_macros_for_goal(tdee, "muscle_gain", weight)
    assert res_gain["calories"] == 2800.0
    assert res_gain["protein_g"] == 126.0
    assert res_gain["fat_g"] == 70.0
    assert res_gain["carbs_g"] == 416.5

def test_calculate_macro_compliance():
    res = calculate_macro_compliance(80.0, 150.0, 40.0, 100.0, 200.0, 50.0)
    assert res["protein"] == 80.0
    assert res["carbs"] == 75.0
    assert res["fat"] == 80.0
    
    # Zero targets
    res_zero = calculate_macro_compliance(80.0, 150.0, 40.0, 0.0, 0.0, 0.0)
    assert res_zero["protein"] == 0.0
    assert res_zero["carbs"] == 0.0
    assert res_zero["fat"] == 0.0
