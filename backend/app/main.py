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

import logging
import os

# Set up file logging in AppData/macro-tracker-frontend/backend.log
try:
    appdata_path = os.getenv("APPDATA")
    if appdata_path:
        log_dir = os.path.join(appdata_path, "macro-tracker-frontend")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, "backend.log")
        
        # Configure file handler
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
        
        # Add to root and specific loggers
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        root_logger.addHandler(file_handler)
        
        loggers_to_patch = ["uvicorn", "uvicorn.access", "uvicorn.error", "auth", "fastapi"]
        for logger_name in loggers_to_patch:
            l = logging.getLogger(logger_name)
            l.addHandler(file_handler)
            l.setLevel(logging.INFO)
            l.propagate = True
            
        print(f"Logging initialized at: {log_file}")
except Exception as e:
    print(f"Failed to initialize file logging: {e}")

# Create tables
Base.metadata.create_all(bind=engine)


def migrate_db_schema(db: Session):
    """Dynamically run ALTER TABLE if columns don't exist for SQLite."""
    try:
        columns_to_add = [
            ("daily_step_goal", "INTEGER DEFAULT 10000"),
            ("daily_water_goal_ml", "INTEGER DEFAULT 2000"),
            ("daily_calories_burned_goal", "INTEGER DEFAULT 500"),
            ("clerk_id", "VARCHAR(255)"),
        ]
        for col_name, col_type in columns_to_add:
            try:
                db.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                db.commit()
                print(f"Added column {col_name} to users table.")
            except Exception:
                db.rollback()

        # Create unique index for clerk_id separately as SQLite doesn't support UNIQUE in ALTER TABLE ADD COLUMN
        try:
            db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_users_clerk_id ON users (clerk_id)"))
            db.commit()
            print("Ensured unique index on users.clerk_id.")
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


# Serve frontend static files config
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys

# Compute the path to frontend/dist
# If running frozen inside PyInstaller, check next to exe or use sys._MEIPASS
if getattr(sys, "frozen", False):
    exe_dir = os.path.dirname(sys.executable)
    prod_dist_dir = os.path.join(exe_dir, "dist")
    if os.path.exists(prod_dist_dir):
        dist_dir = prod_dist_dir
    else:
        dist_dir = os.path.join(getattr(sys, "_MEIPASS", ""), "frontend", "dist")
else:
    # Development structure
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

print(f"Frontend dist directory configured at: {dist_dir}")


@app.get("/")
async def root():
    """Root endpoint. Serves frontend index.html if available, else API metadata."""
    index_path = os.path.join(dist_dir, "index.html") if dist_dir else ""
    if index_path and os.path.exists(index_path):
        return FileResponse(index_path)
        
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


if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        if path.startswith("api/") or path.startswith("docs") or path.startswith("openapi.json"):
            return None
        file_path = os.path.join(dist_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    print(f"Warning: Frontend dist directory does not exist at {dist_dir}")

