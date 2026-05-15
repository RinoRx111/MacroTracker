# backend/App/services/trend_engine.py
from typing import List

class TrendEngine:
    @staticmethod
    def calculate_weight_trend(weights: List[float], span: int = 7) -> List[float]:
        """
        Calculates an Exponential Moving Average (EMA) to smooth out 
        daily water weight fluctuations.
        """
        if not weights:
            return []

        ema = []
        # Initialize EMA with the first weight
        current_ema = weights[0]
        ema.append(current_ema)

        # Multiplier: 2 / (span + 1)
        multiplier = 2 / (span + 1)

        for weight in weights[1:]:
            current_ema = (weight - current_ema) * multiplier + current_ema
            ema.append(round(current_ema, 2))

        return ema

    @staticmethod
    def calculate_adherence(target: float, actual: float) -> float:
        """Calculates how close the user was to their calorie goal (percentage)"""
        if target == 0: return 0
        diff = abs(target - actual)
        adherence = max(0, 100 - (diff / target * 100))
        return round(adherence, 1)
