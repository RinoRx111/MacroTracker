import httpx
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class FoodProvider(ABC):
    @abstractmethod
    async def search_food(self, query: str) -> List[Dict[str, Any]]:
        pass

class USDAProvider(FoodProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.nal.usda.gov/fdc/v1"

    async def search_food(self, query: str) -> List[Dict[str, Any]]:
        if self.api_key == "YOUR_API_KEY":
            # Mock mode for testing without key
            return [{"id": 1, "name": f"{query} (Mock)", "calories": 100, "protein": 10, "carbs": 20, "fats": 2, "serving_size": 100.0, "serving_unit": "g", "api_id": "1", "is_api_cached": True}]

        async with httpx.AsyncClient() as client:
            params = {"query": query, "apiKey": self.api_key, "pageSize": 10}
            try:
                response = await client.get(f"{self.base_url}/foods/search", params=params)
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    for item in data.get("foods", []):
                        results.append({
                            "id": item.get("fdcId"), 
                            "name": item.get("description"),
                            "calories": self._extract_nutrient(item, "Energy"),
                            "protein": self._extract_nutrient(item, "Protein"),
                            "carbs": self._extract_nutrient(item, "Carbohydrate"),
                            "fats": self._extract_nutrient(item, "Total lipid"),
                            "serving_size": 100.0,
                            "serving_unit": "g",
                            "brand": "USDA",
                            "api_id": item.get("fdcId"),
                            "is_api_cached": True
                        })
                    return results
            except Exception as e:
                print(f"API Error: {e}")
            return []

    def _extract_nutrient(self, item, name):
        for n in item.get("foodNutrients", []):
            nutrient_name = n.get("nutrientName", "")
            if name.lower() in nutrient_name.lower():
                return n.get("value", 0)
        return 0

class OpenFoodFactsProvider(FoodProvider):
    async def search_food(self, query: str) -> List[Dict[str, Any]]:
        return []
