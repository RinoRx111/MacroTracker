"""Food endpoints for managing nutrition logs."""

from typing import List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.food import (
    FoodLogCreate,
    FoodLogResponse,
    CustomFoodCreate,
    CustomFoodResponse,
    FoodSearchResult,
    DailyNutritionSummary,
)
from app.services.food_service import FoodService
from app.services.nutrition_provider import NutritionProvider
from app.services.food_parser_service import FoodParserService
from app.models.user import User

router = APIRouter(prefix="/food", tags=["food"])

# Mock authentication - in production use proper JWT
def get_current_user(user_id: int = 1, db: Session = Depends(get_db)) -> User:
    """Get current user (simplified for demo)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/logs", response_model=FoodLogResponse)
async def create_food_log(
    food_log_data: FoodLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FoodLogResponse:
    """Create a new food log entry."""
    food_log = FoodService.create_food_log(db, user.id, food_log_data)
    return food_log


@router.get("/logs/{food_log_id}", response_model=FoodLogResponse)
async def get_food_log(
    food_log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FoodLogResponse:
    """Get a specific food log."""
    food_log = FoodService.get_food_log(db, food_log_id, user.id)
    if not food_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food log not found",
        )
    return food_log


@router.get("/daily", response_model=List[FoodLogResponse])
async def get_daily_logs(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[FoodLogResponse]:
    """Get food logs for a specific date."""
    if not target_date:
        target_date = date.today()
    
    food_logs = FoodService.get_daily_food_logs(db, user.id, target_date)
    return food_logs


@router.get("/daily-summary", response_model=DailyNutritionSummary)
async def get_daily_summary(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyNutritionSummary:
    """Get daily nutrition summary."""
    if not target_date:
        target_date = date.today()
    
    summary = FoodService.get_daily_nutrition_summary(db, user, target_date)
    return summary


@router.delete("/logs/{food_log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_log(
    food_log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a food log entry."""
    success = FoodService.delete_food_log(db, food_log_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food log not found",
        )


@router.post("/search", response_model=List[FoodSearchResult])
async def search_foods(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
) -> List[FoodSearchResult]:
    """Search for foods from Open Food Facts."""
    results = await NutritionProvider.search_food(query, limit)
    
    if not results:
        return []
    
    return [
        FoodSearchResult(
            id=item.get("code", ""),
            name=item.get("name", ""),
            brand=item.get("brand", ""),
            calories_per_100g=item.get("calories_per_100g"),
            protein_per_100g=item.get("protein_per_100g"),
            carbs_per_100g=item.get("carbs_per_100g"),
            fat_per_100g=item.get("fat_per_100g"),
            fiber_per_100g=item.get("fiber_per_100g"),
        )
        for item in results
    ]


@router.get("/barcode/{barcode}", response_model=FoodSearchResult)
async def get_food_by_barcode(barcode: str) -> FoodSearchResult:
    """Get food information by barcode."""
    result = await NutritionProvider.get_food_by_barcode(barcode)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Food with this barcode not found",
        )
    
    return FoodSearchResult(
        id=result.get("code", ""),
        name=result.get("name", ""),
        brand=result.get("brand", ""),
        calories_per_100g=result.get("calories_per_100g"),
        protein_per_100g=result.get("protein_per_100g"),
        carbs_per_100g=result.get("carbs_per_100g"),
        fat_per_100g=result.get("fat_per_100g"),
        fiber_per_100g=result.get("fiber_per_100g"),
    )


@router.post("/custom-foods", response_model=CustomFoodResponse)
async def create_custom_food(
    custom_food_data: CustomFoodCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CustomFoodResponse:
    """Create a custom food."""
    custom_food = FoodService.create_custom_food(
        db,
        user.id,
        custom_food_data.name,
        custom_food_data.calories_per_100g,
        custom_food_data.protein_per_100g,
        custom_food_data.carbs_per_100g,
        custom_food_data.fat_per_100g,
        custom_food_data.description,
        custom_food_data.fiber_per_100g,
        custom_food_data.sugar_per_100g,
    )
    return custom_food


@router.get("/custom-foods", response_model=List[CustomFoodResponse])
async def get_custom_foods(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[CustomFoodResponse]:
    """Get all custom foods for the user."""
    custom_foods = FoodService.get_custom_foods(db, user.id)
    return custom_foods


@router.delete("/custom-foods/{custom_food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_custom_food(
    custom_food_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a custom food."""
    success = FoodService.delete_custom_food(db, custom_food_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom food not found",
        )


@router.post("/parse-text")
async def parse_food_text(
    payload: dict,
    user: User = Depends(get_current_user),
):
    """Parse freeform food text into structured food logs."""
    text = payload.get("text", "")
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'text' in payload",
        )
    
    parsed_items = await FoodParserService.parse_text(text)
    
    # Automatically determine the meal type based on current hour
    hour = datetime.now().hour
    if 5 <= hour < 11:
        meal_type = "breakfast"
    elif 11 <= hour < 17:
        meal_type = "lunch"
    elif 17 <= hour < 22:
        meal_type = "dinner"
    else:
        meal_type = "snack"

    results = []
    for item in parsed_items:
        results.append({
            "food_name": item["food_name"],
            "portion_size": item["portion_size"],
            "portion_unit": item["portion_unit"],
            "calories_kcal": item["calories_kcal"],
            "protein_g": item["protein_g"],
            "carbs_g": item["carbs_g"],
            "fat_g": item["fat_g"],
            "meal_type": meal_type,
            "logged_date": date.today().isoformat()
        })
        
    return results


@router.post("/logs/batch", response_model=List[FoodLogResponse])
async def create_food_logs_batch(
    food_logs: List[FoodLogCreate],
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[FoodLogResponse]:
    """Create a batch of food log entries."""
    logs = FoodService.create_food_logs_batch(db, user.id, food_logs)
    return logs
