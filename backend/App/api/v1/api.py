# backend/App/api/v1/api.py
from fastapi import APIRouter
# We import all the endpoint files here
from App.api.v1.endpoints import nutrition, weight, user, recipes

api_router = APIRouter()

# Link the sub-routers to the main API
# This creates the paths: /api/v1/nutrition, /api/v1/weight, etc.
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition"])
api_router.include_router(weight.router, prefix="/weight", tags=["Weight"])
api_router.include_router(user.router, prefix="/user", tags=["User"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
