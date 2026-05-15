# MacroTracker Backend

FastAPI-based nutrition and macro tracking backend.

## Quick Start

### 1. Setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

### 2. Run

```bash
python run.py
```

Visit http://localhost:8000/docs for API documentation

### 3. Database

The app uses SQLite by default. On first run, tables are created automatically.

## API Structure

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /docs` - API documentation (Swagger UI)
- `GET /api/v1/...` - API v1 endpoints

## Endpoints

### Food Management
- `POST /api/v1/food/logs` - Create food log
- `GET /api/v1/food/daily` - Get daily food logs
- `GET /api/v1/food/daily-summary` - Get daily summary
- `POST /api/v1/food/search?query=...` - Search foods
- `GET /api/v1/food/barcode/{barcode}` - Get food by barcode
- `POST /api/v1/food/custom-foods` - Create custom food

### Weight Tracking
- `POST /api/v1/weight/logs` - Create weight log
- `GET /api/v1/weight/latest` - Get latest weight
- `GET /api/v1/weight/stats` - Get weight stats
- `GET /api/v1/weight/goals/active` - Get active goal

### Profile
- `GET /api/v1/profile/me` - Get profile
- `PUT /api/v1/profile/me` - Update profile
- `GET /api/v1/profile/stats` - Get user stats

### Analytics
- `GET /api/v1/analytics/nutrition-data` - Get nutrition data
- `GET /api/v1/analytics/insights` - Get insights
- `GET /api/v1/analytics/summary` - Get summary

## Configuration

Edit `.env` to configure:
- `DATABASE_URL` - Database connection
- `DEBUG` - Debug mode
- `CORS_ORIGINS` - Allowed CORS origins
