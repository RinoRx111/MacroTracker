# backend/App/main.py
import os
import sys
from pathlib import Path

current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from App.db.session import engine, Base
from App.api.v1.api import api_router

app = FastAPI(title="NutriPremium API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # --- ROUTE VERIFIER START ---
    print("\n" + "="*50)
    print("🚀 REGISTERED API ROUTES:")
    for route in app.routes:
        if hasattr(route, "path"):
            print(f"✅ {route.path}")
    print("="*50 + "\n")
    # --- ROUTE VERIFIER END ---
    
    print("✅ Database tables initialized successfully")

@app.get("/")
async def root():
    return {"status": "online"}

app.include_router(api_router, prefix="/api/v1")
