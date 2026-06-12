"""API v1 routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import food, weight, profile, analytics, auth, workout, activity, water

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(food.router)
api_router.include_router(weight.router)
api_router.include_router(profile.router)
api_router.include_router(analytics.router)
api_router.include_router(workout.router)
api_router.include_router(activity.router)
api_router.include_router(water.router)

__all__ = ["api_router"]
