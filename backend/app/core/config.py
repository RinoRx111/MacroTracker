"""Application configuration settings."""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "MacroTracker"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./nutrition_tracker.db"
    )
    
    # API
    API_V1_STR: str = "/api/v1"

    # Clerk Authentication
    CLERK_ISSUER: Optional[str] = os.getenv("CLERK_ISSUER")
    CLERK_JWKS_URL: Optional[str] = os.getenv("CLERK_JWKS_URL")
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ]
    
    # External APIs
    OPEN_FOOD_FACTS_BASE_URL: str = "https://world.openfoodfacts.org"
    GROQ_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
