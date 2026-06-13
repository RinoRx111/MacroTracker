"""Nutrition provider for external APIs and nutrition data."""

import httpx
from typing import Optional, List, Dict, Any
from app.core.config import settings


class NutritionProvider:
    """Service for external nutrition data providers."""

    @staticmethod
    async def search_food(query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for foods from Open Food Facts API."""
        try:
            headers = {"User-Agent": "MacroTracker - Windows - Version 1.0"}
            async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
                url = f"{settings.OPEN_FOOD_FACTS_BASE_URL}/cgi/search.pl"
                params = {
                    "search_terms": query,
                    "action": "process",
                    "json": 1,
                    "page_size": limit,
                }

                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                results = []
                for product in data.get("products", [])[:limit]:
                    nutrition_data = NutritionProvider._parse_product(product)
                    if nutrition_data:
                        results.append(nutrition_data)

                return results

        except httpx.RequestError as e:
            print(f"Error searching food: {e}")
            return []

    @staticmethod
    async def get_food_by_barcode(barcode: str) -> Optional[Dict[str, Any]]:
        """Get food information by barcode from Open Food Facts."""
        try:
            headers = {"User-Agent": "MacroTracker - Windows - Version 1.0"}
            async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
                url = f"{settings.OPEN_FOOD_FACTS_BASE_URL}/api/v0/product/{barcode}.json"
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

                if data.get("status") == 1 and "product" in data:
                    return NutritionProvider._parse_product(data["product"])

                return None

        except httpx.RequestError as e:
            print(f"Error fetching barcode: {e}")
            return None

    @staticmethod
    def _parse_product(product: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Open Food Facts product data."""
        try:
            nutriments = product.get("nutriments", {})

            # Extract nutrition info (per 100g)
            result = {
                "code": product.get("code", ""),
                "name": product.get("product_name", ""),
                "brand": product.get("brands", ""),
                "calories_per_100g": nutriments.get("energy-kcal_100g"),
                "protein_per_100g": nutriments.get("proteins_100g"),
                "carbs_per_100g": nutriments.get("carbohydrates_100g"),
                "fat_per_100g": nutriments.get("fat_100g"),
                "fiber_per_100g": nutriments.get("fiber_100g"),
                "sugar_per_100g": nutriments.get("sugars_100g"),
                "sodium_per_100g": nutriments.get("sodium_100g"),
                "image_url": product.get("image_front_small_url", ""),
            }

            # Only return if we have at least calories and macros
            if result.get("calories_per_100g") and result.get("protein_per_100g"):
                return result

            return None

        except Exception as e:
            print(f"Error parsing product: {e}")
            return None

    @staticmethod
    async def search_by_barcode_advanced(barcode: str) -> Optional[Dict[str, Any]]:
        """Advanced barcode search with fallback."""
        # Try primary method
        result = await NutritionProvider.get_food_by_barcode(barcode)
        if result:
            return result

        # Try alternative endpoint
        try:
            headers = {"User-Agent": "MacroTracker - Windows - Version 1.0"}
            async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
                url = f"{settings.OPEN_FOOD_FACTS_BASE_URL}/cgi/search.pl"
                params = {
                    "code": barcode,
                    "action": "process",
                    "json": 1,
                }

                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("products"):
                    return NutritionProvider._parse_product(data["products"][0])

                return None

        except httpx.RequestError as e:
            print(f"Error in advanced barcode search: {e}")
            return None
