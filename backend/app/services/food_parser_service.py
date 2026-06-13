import os
import re
import json
import httpx
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"

# Local database of common foods with nutrition stats per 100g and default unit weights
COMMON_FOODS = {
    "chicken breast": {"calories_per_100g": 165.0, "protein_per_100g": 31.0, "carbs_per_100g": 0.0, "fat_per_100g": 3.6, "unit_weight": 1.0},
    "chicken": {"calories_per_100g": 165.0, "protein_per_100g": 31.0, "carbs_per_100g": 0.0, "fat_per_100g": 3.6, "unit_weight": 1.0},
    "egg": {"calories_per_100g": 155.0, "protein_per_100g": 13.0, "carbs_per_100g": 1.1, "fat_per_100g": 11.0, "unit_weight": 50.0},
    "eggs": {"calories_per_100g": 155.0, "protein_per_100g": 13.0, "carbs_per_100g": 1.1, "fat_per_100g": 11.0, "unit_weight": 50.0},
    "boiled egg": {"calories_per_100g": 155.0, "protein_per_100g": 13.0, "carbs_per_100g": 1.1, "fat_per_100g": 11.0, "unit_weight": 50.0},
    "boiled eggs": {"calories_per_100g": 155.0, "protein_per_100g": 13.0, "carbs_per_100g": 1.1, "fat_per_100g": 11.0, "unit_weight": 50.0},
    "chapati": {"calories_per_100g": 264.0, "protein_per_100g": 8.0, "carbs_per_100g": 50.0, "fat_per_100g": 3.0, "unit_weight": 40.0},
    "wheat chapati": {"calories_per_100g": 264.0, "protein_per_100g": 8.0, "carbs_per_100g": 50.0, "fat_per_100g": 3.0, "unit_weight": 40.0},
    "whole wheat chapati": {"calories_per_100g": 264.0, "protein_per_100g": 8.0, "carbs_per_100g": 50.0, "fat_per_100g": 3.0, "unit_weight": 50.0},
    "roti": {"calories_per_100g": 264.0, "protein_per_100g": 8.0, "carbs_per_100g": 50.0, "fat_per_100g": 3.0, "unit_weight": 40.0},
    "banana": {"calories_per_100g": 89.0, "protein_per_100g": 1.1, "carbs_per_100g": 23.0, "fat_per_100g": 0.3, "unit_weight": 120.0},
    "apple": {"calories_per_100g": 52.0, "protein_per_100g": 0.3, "carbs_per_100g": 14.0, "fat_per_100g": 0.2, "unit_weight": 150.0},
    "rice": {"calories_per_100g": 130.0, "protein_per_100g": 2.7, "carbs_per_100g": 28.0, "fat_per_100g": 0.3, "unit_weight": 1.0},
    "cooked rice": {"calories_per_100g": 130.0, "protein_per_100g": 2.7, "carbs_per_100g": 28.0, "fat_per_100g": 0.3, "unit_weight": 1.0},
    "white rice": {"calories_per_100g": 130.0, "protein_per_100g": 2.7, "carbs_per_100g": 28.0, "fat_per_100g": 0.3, "unit_weight": 1.0},
    "brown rice": {"calories_per_100g": 111.0, "protein_per_100g": 2.6, "carbs_per_100g": 23.0, "fat_per_100g": 0.9, "unit_weight": 1.0},
    "paneer": {"calories_per_100g": 265.0, "protein_per_100g": 18.3, "carbs_per_100g": 1.2, "fat_per_100g": 20.8, "unit_weight": 1.0},
    "milk": {"calories_per_100g": 42.0, "protein_per_100g": 3.4, "carbs_per_100g": 5.0, "fat_per_100g": 1.0, "unit_weight": 1.0},
    "whole milk": {"calories_per_100g": 61.0, "protein_per_100g": 3.2, "carbs_per_100g": 4.8, "fat_per_100g": 3.3, "unit_weight": 1.0},
    "whey protein": {"calories_per_100g": 380.0, "protein_per_100g": 80.0, "carbs_per_100g": 5.0, "fat_per_100g": 3.0, "unit_weight": 30.0},
    "whey": {"calories_per_100g": 380.0, "protein_per_100g": 80.0, "carbs_per_100g": 5.0, "fat_per_100g": 3.0, "unit_weight": 30.0},
    "oats": {"calories_per_100g": 389.0, "protein_per_100g": 16.9, "carbs_per_100g": 66.3, "fat_per_100g": 6.9, "unit_weight": 1.0},
    "peanut butter": {"calories_per_100g": 588.0, "protein_per_100g": 25.0, "carbs_per_100g": 20.0, "fat_per_100g": 50.0, "unit_weight": 16.0},
    "almonds": {"calories_per_100g": 579.0, "protein_per_100g": 21.0, "carbs_per_100g": 22.0, "fat_per_100g": 49.0, "unit_weight": 1.2},
}

class FoodParserService:
    @staticmethod
    async def parse_text(text: str) -> List[Dict[str, Any]]:
        """
        Parses freeform food text (e.g. '134g chicken breast, 4 boiled eggs')
        into a list of structured food dicts with macros and calories.
        """
        if not text.strip():
            return []

        # 1. Try parsing with Groq API if key is present
        if GROQ_API_KEY and GROQ_API_KEY != "YOUR_API_KEY" and not GROQ_API_KEY.startswith("gsk_placeholder"):
            try:
                parsed_items = await FoodParserService._parse_with_groq(text)
                if parsed_items:
                    return parsed_items
            except Exception as e:
                print(f"[WARNING] Groq API parsing failed, falling back to local: {e}")

        # 2. Fallback to local parsing
        return FoodParserService._parse_locally(text)

    @staticmethod
    async def _parse_with_groq(text: str) -> Optional[List[Dict[str, Any]]]:
        """Call Groq API to parse the text into structured JSON."""
        system_prompt = (
            "You are a precise nutrition and macro tracking assistant. "
            "Your task is to parse a text entry containing foods and their quantities into a JSON list of structured food items. "
            "For each food item: \n"
            "1. Extract the name of the food ('food_name'). If a brand is specified (e.g. 'Nutella', 'Amul', 'Fage', 'Oreo'), search your knowledge base and use that specific brand's exact product info.\n"
            "2. Estimate the total consumed weight in grams ('portion_size'). If count-based, compute total grams (e.g. 4 eggs = 200g, 1 banana = 120g).\n"
            "3. Retrieve or estimate the nutritional values strictly PER 100g of this food item: 'calories_per_100g', 'protein_per_100g', 'carbs_per_100g', and 'fat_per_100g'.\n"
            "Output strictly a JSON object with a single root key 'items' containing the list of parsed foods.\n"
            "Schema: \n"
            "{\n"
            "  \"items\": [\n"
            "    {\n"
            "      \"food_name\": \"string (name of food including brand if specified)\",\n"
            "      \"portion_size\": float (portion weight in grams),\n"
            "      \"portion_unit\": \"g\",\n"
            "      \"calories_per_100g\": float,\n"
            "      \"protein_per_100g\": float,\n"
            "      \"carbs_per_100g\": float,\n"
            "      \"fat_per_100g\": float\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Parse this entry: {text}"}
            ],
            "temperature": 0.0,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                result = json.loads(content)
                items = result.get("items", [])
                
                scaled_items = []
                for item in items:
                    name = item.get("food_name", "").lower()
                    portions = float(item.get("portion_size", 100.0))
                    
                    # Try to find a match in COMMON_FOODS to get exact macros
                    matched_info = None
                    for common_name, info in COMMON_FOODS.items():
                        if common_name in name or name in common_name:
                            matched_info = info
                            break
                            
                    if matched_info:
                        ratio = portions / 100.0
                        scaled_items.append({
                            "food_name": item.get("food_name").capitalize(),
                            "portion_size": portions,
                            "portion_unit": "g",
                            "calories_kcal": round(matched_info["calories_per_100g"] * ratio, 1),
                            "protein_g": round(matched_info["protein_per_100g"] * ratio, 1),
                            "carbs_g": round(matched_info["carbs_per_100g"] * ratio, 1),
                            "fat_g": round(matched_info["fat_per_100g"] * ratio, 1),
                        })
                    else:
                        # Fallback/Brand: search Open Food Facts API as fallback / enrichment
                        from app.services.nutrition_provider import NutritionProvider
                        off_info = None
                        try:
                            # Try searching Open Food Facts with the parsed food name
                            off_results = await NutritionProvider.search_food(item.get("food_name", ""), limit=1)
                            if off_results and len(off_results) > 0:
                                off_info = off_results[0]
                        except Exception as off_err:
                            print(f"[WARNING] Open Food Facts search fallback failed: {off_err}")

                        ratio = portions / 100.0
                        if off_info and off_info.get("calories_per_100g") is not None:
                            scaled_items.append({
                                "food_name": item.get("food_name").capitalize(),
                                "portion_size": portions,
                                "portion_unit": "g",
                                "calories_kcal": round(float(off_info.get("calories_per_100g", 0.0)) * ratio, 1),
                                "protein_g": round(float(off_info.get("protein_per_100g", 0.0)) * ratio, 1),
                                "carbs_g": round(float(off_info.get("carbs_per_100g", 0.0)) * ratio, 1),
                                "fat_g": round(float(off_info.get("fat_per_100g", 0.0)) * ratio, 1),
                            })
                        else:
                            # Fallback/Brand: scale the LLM's returned per-100g macros in Python!
                            scaled_items.append({
                                "food_name": item.get("food_name").capitalize(),
                                "portion_size": portions,
                                "portion_unit": "g",
                                "calories_kcal": round(float(item.get("calories_per_100g", 0.0)) * ratio, 1),
                                "protein_g": round(float(item.get("protein_per_100g", 0.0)) * ratio, 1),
                                "carbs_g": round(float(item.get("carbs_per_100g", 0.0)) * ratio, 1),
                                "fat_g": round(float(item.get("fat_per_100g", 0.0)) * ratio, 1),
                            })
                return scaled_items
            else:
                print(f"Groq API returned status code {response.status_code}: {response.text}")
                return None

    @staticmethod
    def _parse_locally(text: str) -> List[Dict[str, Any]]:
        """Rule-based local regex parser as offline/failure fallback."""
        # Split by comma or newline
        lines = [x.strip() for x in re.split(r'[\n,]+', text) if x.strip()]
        parsed_items = []

        for line in lines:
            line_lower = line.lower().strip()
            
            # Regex 1: "3 whole wheat chapati each of 50g"
            match_each = re.search(r'^(\d+(?:\.\d+)?)\s*(.*?)\s*(?:each of|each|of)\s*(\d+(?:\.\d+)?)\s*(gm|g|grams)?$', line_lower)
            
            # Regex 2: "134g chicken breast" or "134 gm chicken breast"
            match_weight = re.search(r'^(\d+(?:\.\d+)?)\s*(gm|g|grams)\s*(.+)$', line_lower)
            
            # Regex 3: "4 boiled eggs" (pure count)
            match_count = re.search(r'^(\d+(?:\.\d+)?)\s+(.+)$', line_lower)

            portions = 100.0
            food_query = ""

            if match_each:
                count = float(match_each.group(1))
                food_query = match_each.group(2).strip()
                unit_w = float(match_each.group(3))
                portions = count * unit_w
            elif match_weight:
                portions = float(match_weight.group(1))
                food_query = match_weight.group(3).strip()
            elif match_count:
                count = float(match_count.group(1))
                food_query = match_count.group(2).strip()
                # find unit weight from common foods, default to 50g
                unit_w = 50.0
                for name, info in COMMON_FOODS.items():
                    if name in food_query:
                        unit_w = info.get("unit_weight", 50.0)
                        break
                portions = count * unit_w
            else:
                food_query = line_lower
                portions = 100.0

            # Normalize food query (strip punctuation/plural)
            food_query = food_query.replace("brest", "breast").strip()
            
            # Look up in COMMON_FOODS
            matched_info = None
            for name, info in COMMON_FOODS.items():
                if name in food_query or food_query in name:
                    matched_info = info
                    break

            if matched_info:
                ratio = portions / 100.0
                parsed_items.append({
                    "food_name": food_query.capitalize(),
                    "portion_size": portions,
                    "portion_unit": "g",
                    "calories_kcal": round(matched_info["calories_per_100g"] * ratio, 1),
                    "protein_g": round(matched_info["protein_per_100g"] * ratio, 1),
                    "carbs_g": round(matched_info["carbs_per_100g"] * ratio, 1),
                    "fat_g": round(matched_info["fat_per_100g"] * ratio, 1),
                })
            else:
                # Fallback default macros (like a typical moderate food)
                ratio = portions / 100.0
                parsed_items.append({
                    "food_name": food_query.capitalize(),
                    "portion_size": portions,
                    "portion_unit": "g",
                    "calories_kcal": round(150.0 * ratio, 1),
                    "protein_g": round(5.0 * ratio, 1),
                    "carbs_g": round(20.0 * ratio, 1),
                    "fat_g": round(3.0 * ratio, 1),
                })

        return parsed_items

# Simple offline validation when running directly
if __name__ == "__main__":
    import asyncio
    
    test_text = "134gm chicken brest, 4 boiled eggs, 3 whole wheat chapati each of 50gm"
    print("Testing offline local parser fallback:")
    results = FoodParserService._parse_locally(test_text)
    print(json.dumps(results, indent=2))
