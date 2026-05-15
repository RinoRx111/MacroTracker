"""Main application module."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models import Base
from app.models.user import User
from app.api.v1.api import api_router

# Create tables
Base.metadata.create_all(bind=engine)


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
        is_active=True,
        dark_mode=True,
    )
    db.add(demo_user)
    db.commit()
    print("✅ Demo user created (username: demo)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    try:
        db = SessionLocal()
        init_demo_user(db)
        db.close()
    except Exception as e:
        print(f"⚠️ Error initializing demo user: {e}")
    yield
    # Shutdown
    print("👋 Shutting down")


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
