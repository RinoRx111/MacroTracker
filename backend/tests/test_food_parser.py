import pytest
import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_path = Path(__file__).parent.parent.resolve()
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

from app.services.food_parser_service import FoodParserService

def test_parse_locally_weight():
    # "134gm chicken breast" -> 134.0g chicken breast (which is in COMMON_FOODS)
    res = FoodParserService._parse_locally("134gm chicken brest")
    assert len(res) == 1
    item = res[0]
    assert "chicken" in item["food_name"].lower()
    assert item["portion_size"] == 134.0
    assert item["portion_unit"] == "g"
    # chicken breast calories per 100g = 165.0. 134g = 165 * 1.34 = 221.1
    assert item["calories_kcal"] == 221.1

def test_parse_locally_count():
    # "4 boiled eggs" -> 4 * 50g = 200g
    res = FoodParserService._parse_locally("4 boiled eggs")
    assert len(res) == 1
    item = res[0]
    assert "egg" in item["food_name"].lower()
    assert item["portion_size"] == 200.0
    # egg calories per 100g = 155.0. 200g = 310.0
    assert item["calories_kcal"] == 310.0

def test_parse_locally_each():
    # "3 whole wheat chapati each of 50gm" -> 3 * 50g = 150g
    res = FoodParserService._parse_locally("3 whole wheat chapati each of 50gm")
    assert len(res) == 1
    item = res[0]
    assert "chapati" in item["food_name"].lower()
    assert item["portion_size"] == 150.0
    # whole wheat chapati calories per 100g = 264.0. 150g = 264 * 1.5 = 396.0
    assert item["calories_kcal"] == 396.0

@pytest.mark.asyncio
async def test_parse_text_live_groq():
    # We check if the Groq API key is present in environment before running
    # If the key is not present, we skip the live test or assert it falls back to local
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY" or api_key.startswith("gsk_placeholder"):
        pytest.skip("Groq API key not set in environment or is a placeholder. Skipping live test.")
        
    test_text = "134gm chicken brest, 15g Nutella"
    res = await FoodParserService.parse_text(test_text)
    
    assert len(res) == 2
    item1 = res[0]
    item2 = res[1]
    
    assert "chicken" in item1["food_name"].lower()
    assert item1["portion_size"] == 134.0
    
    assert "nutella" in item2["food_name"].lower()
    assert item2["portion_size"] == 15.0
    # Nutella should be fetched from Open Food Facts API and scaled.
    # Nutella is ~539 kcal/100g. 15g = 539 * 0.15 = 80.85 -> 80.9 or similar
    assert item2["calories_kcal"] > 0
    assert item2["protein_g"] > 0
