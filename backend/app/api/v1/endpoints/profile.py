"""Profile and user management endpoints."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserStatsResponse,
    SettingsUpdate,
)
from app.models.user import User
from app.utils.calculations import calculate_bmr, calculate_tdee, calculate_bmi, estimate_daily_macros_for_goal
from app.services.weight_service import WeightService

router = APIRouter(prefix="/profile", tags=["profile"])


from app.core.auth import get_current_user
from pydantic import BaseModel

class UserSyncRequest(BaseModel):
    email: str
    full_name: str

@router.post("/sync", response_model=UserResponse)
async def sync_profile(
    sync_data: UserSyncRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Sync authenticated User metadata from Clerk."""
    if sync_data.email:
        user.email = sync_data.email
    if sync_data.full_name:
        user.full_name = sync_data.full_name
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
async def get_profile(
    user: User = Depends(get_current_user),
) -> UserResponse:
    """Get current user profile."""
    return user



@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Update user profile."""
    # Update fields if provided
    if profile_data.full_name is not None:
        user.full_name = profile_data.full_name
    if profile_data.age is not None:
        user.age = profile_data.age
    if profile_data.weight_kg is not None:
        user.weight_kg = profile_data.weight_kg
    if profile_data.height_cm is not None:
        user.height_cm = profile_data.height_cm
    if profile_data.gender is not None:
        user.gender = profile_data.gender
    if profile_data.activity_level is not None:
        user.activity_level = profile_data.activity_level
    if profile_data.daily_calorie_goal is not None:
        user.daily_calorie_goal = profile_data.daily_calorie_goal
    if profile_data.protein_goal_g is not None:
        user.protein_goal_g = profile_data.protein_goal_g
    if profile_data.carbs_goal_g is not None:
        user.carbs_goal_g = profile_data.carbs_goal_g
    if profile_data.fat_goal_g is not None:
        user.fat_goal_g = profile_data.fat_goal_g
    if profile_data.daily_step_goal is not None:
        user.daily_step_goal = profile_data.daily_step_goal
    if profile_data.daily_water_goal_ml is not None:
        user.daily_water_goal_ml = profile_data.daily_water_goal_ml
    if profile_data.daily_calories_burned_goal is not None:
        user.daily_calories_burned_goal = profile_data.daily_calories_burned_goal
    if profile_data.dark_mode is not None:
        user.dark_mode = profile_data.dark_mode

    db.commit()
    db.refresh(user)
    return user


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserStatsResponse:
    """Get user statistics and calculations."""
    bmi = None
    bmi_category = None
    tdee = None

    if user.weight_kg and user.height_cm:
        bmi, bmi_category = calculate_bmi(user.weight_kg, user.height_cm)

    if user.weight_kg and user.height_cm and user.age and user.gender and user.activity_level:
        bmr = calculate_bmr(user.weight_kg, user.height_cm, user.age, user.gender)
        tdee = calculate_tdee(bmr, user.activity_level)

    return UserStatsResponse(
        user_id=user.id,
        username=user.username,
        bmi=bmi,
        bmi_category=bmi_category,
        tdee=tdee,
        daily_calorie_goal=user.daily_calorie_goal,
        protein_goal_g=user.protein_goal_g,
        carbs_goal_g=user.carbs_goal_g,
        fat_goal_g=user.fat_goal_g,
        daily_step_goal=user.daily_step_goal,
        daily_water_goal_ml=user.daily_water_goal_ml,
        daily_calories_burned_goal=user.daily_calories_burned_goal,
    )


@router.put("/settings", response_model=UserResponse)
async def update_settings(
    settings_data: SettingsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """Update user settings."""
    if settings_data.dark_mode is not None:
        user.dark_mode = settings_data.dark_mode
    if settings_data.daily_calorie_goal is not None:
        user.daily_calorie_goal = settings_data.daily_calorie_goal
    if settings_data.protein_goal_g is not None:
        user.protein_goal_g = settings_data.protein_goal_g
    if settings_data.carbs_goal_g is not None:
        user.carbs_goal_g = settings_data.carbs_goal_g
    if settings_data.fat_goal_g is not None:
        user.fat_goal_g = settings_data.fat_goal_g
    if settings_data.daily_step_goal is not None:
        user.daily_step_goal = settings_data.daily_step_goal
    if settings_data.daily_water_goal_ml is not None:
        user.daily_water_goal_ml = settings_data.daily_water_goal_ml
    if settings_data.daily_calories_burned_goal is not None:
        user.daily_calories_burned_goal = settings_data.daily_calories_burned_goal

    db.commit()
    db.refresh(user)
    return user


@router.post("/calculate-macros")
async def calculate_macros(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate recommended macros based on profile."""
    if not (user.weight_kg and user.height_cm and user.age and user.gender and user.activity_level):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete profile required (weight, height, age, gender, activity level)",
        )

    bmr = calculate_bmr(user.weight_kg, user.height_cm, user.age, user.gender)
    tdee = calculate_tdee(bmr, user.activity_level)

    # Get active goal
    from app.services.weight_service import GoalService
    goal = GoalService.get_active_goal(db, user.id)
    goal_type = goal.goal_type if goal else "maintenance"

    macros = estimate_daily_macros_for_goal(tdee, goal_type, user.weight_kg)

    return {
        "bmr": round(bmr, 0),
        "tdee": round(tdee, 0),
        "recommended_daily_calories": macros["calories"],
        "recommended_protein_g": macros["protein_g"],
        "recommended_carbs_g": macros["carbs_g"],
        "recommended_fat_g": macros["fat_g"],
        "goal_type": goal_type,
    }
