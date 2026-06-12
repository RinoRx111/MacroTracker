"""Main application module."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models import Base
from app.models.user import User
from app.api.v1.api import api_router

# Create tables
Base.metadata.create_all(bind=engine)


def migrate_db_schema(db: Session):
    """Dynamically run ALTER TABLE if columns don't exist for SQLite."""
    try:
        columns_to_add = [
            ("daily_step_goal", "INTEGER DEFAULT 10000"),
            ("daily_water_goal_ml", "INTEGER DEFAULT 2000"),
            ("daily_calories_burned_goal", "INTEGER DEFAULT 500"),
        ]
        for col_name, col_type in columns_to_add:
            try:
                db.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                db.commit()
                print(f"Added column {col_name} to users table.")
            except Exception:
                db.rollback()
    except Exception as e:
        print(f"Migration error: {e}")


def init_demo_user(db: Session):
    """Initialize demo user for testing."""
    existing_user = db.query(User).filter(User.id == 1).first()
    if existing_user:
        return
    
    demo_user = User(
        id=1,
        username="demo",
        email="demo@example.com",
        full_name="Demo User",
        hashed_password="hashed_demo_password",
        age=30,
        weight_kg=75.0,
        height_cm=180,
        gender="male",
        activity_level="moderate",
        daily_calorie_goal=2500,
        protein_goal_g=150,
        carbs_goal_g=300,
        fat_goal_g=80,
        daily_step_goal=10000,
        daily_water_goal_ml=2000,
        daily_calories_burned_goal=500,
        is_active=True,
        dark_mode=True,
    )
    db.add(demo_user)
    db.commit()
    print("Demo user created (username: demo)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    try:
        db = SessionLocal()
        migrate_db_schema(db)
        init_demo_user(db)
        db.close()
    except Exception as e:
        print(f"Error initializing demo user: {e}")
    yield
    # Shutdown
    print("Shutting down")


# Create app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Professional nutrition and macro tracking API",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "api": settings.API_V1_STR,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/debug/users")
async def debug_users():
    """Debug endpoint to check users in database."""
    try:
        db = SessionLocal()
        users = db.query(User).all()
        result = {
            "total_users": len(users),
            "users": [{"id": u.id, "username": u.username, "email": u.email} for u in users],
        }
        db.close()
        return result
    except Exception as e:
        return {"error": str(e)}
