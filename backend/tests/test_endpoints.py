import pytest
import sys
from pathlib import Path
from datetime import date

# Ensure backend directory is in sys.path
backend_path = Path(__file__).parent.parent.resolve()
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

def test_get_profile(client):
    response = client.get("/api/v1/profile/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["height_cm"] == 175.0
    assert data["weight_kg"] == 70.0

def test_update_profile(client):
    payload = {
        "full_name": "Updated Name",
        "age": 26,
        "weight_kg": 72.5,
        "height_cm": 176.0,
        "gender": "male",
        "activity_level": "active"
    }
    response = client.put("/api/v1/profile/me", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["age"] == 26
    assert data["weight_kg"] == 72.5
    assert data["height_cm"] == 176.0
    assert data["activity_level"] == "active"

def test_get_profile_stats(client):
    response = client.get("/api/v1/profile/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["bmi"] == 22.9
    assert data["bmi_category"] == "normal"

def test_food_logs_flow(client):
    # Create food log
    payload = {
        "food_name": "Chicken breast",
        "portion_size": 150.0,
        "portion_unit": "g",
        "calories_kcal": 247.5,
        "protein_g": 46.5,
        "carbs_g": 0.0,
        "fat_g": 5.4,
        "meal_type": "lunch",
        "logged_date": date.today().isoformat()
    }
    create_response = client.post("/api/v1/food/logs", json=payload)
    assert create_response.status_code == 200
    log_data = create_response.json()
    assert log_data["id"] is not None
    assert log_data["food_name"] == "Chicken breast"
    assert log_data["portion_size"] == 150.0
    
    # Get daily logs
    get_response = client.get(f"/api/v1/food/daily?target_date={date.today().isoformat()}")
    assert get_response.status_code == 200
    logs = get_response.json()
    assert len(logs) == 1
    assert logs[0]["id"] == log_data["id"]
    
    # Delete log
    delete_response = client.delete(f"/api/v1/food/logs/{log_data['id']}")
    assert delete_response.status_code == 204
    
    # Verify deletion
    verify_response = client.get(f"/api/v1/food/daily?target_date={date.today().isoformat()}")
    assert verify_response.status_code == 200
    assert len(verify_response.json()) == 0

def test_food_logs_batch(client):
    payload = [
        {
            "food_name": "Boiled Egg",
            "portion_size": 100.0,
            "portion_unit": "g",
            "calories_kcal": 155.0,
            "protein_g": 13.0,
            "carbs_g": 1.1,
            "fat_g": 11.0,
            "meal_type": "breakfast",
            "logged_date": date.today().isoformat()
        },
        {
            "food_name": "Whole Milk",
            "portion_size": 200.0,
            "portion_unit": "ml",
            "calories_kcal": 122.0,
            "protein_g": 6.4,
            "carbs_g": 9.6,
            "fat_g": 6.6,
            "meal_type": "breakfast",
            "logged_date": date.today().isoformat()
        }
    ]
    response = client.post("/api/v1/food/logs/batch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["food_name"] == "Boiled Egg"
    assert data[1]["food_name"] == "Whole Milk"

def test_water_logs(client):
    payload = {
        "amount_ml": 500,
        "logged_date": date.today().isoformat()
    }
    # Update water
    response = client.post("/api/v1/water/logs", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["amount_ml"] == 500
    
    # Get water
    get_response = client.get(f"/api/v1/water/daily?target_date={date.today().isoformat()}")
    assert get_response.status_code == 200
    get_data = get_response.json()
    assert get_data["amount_ml"] == 500

def test_weight_logs(client):
    payload = {
        "weight_kg": 71.5,
        "weight_date": date.today().isoformat(),
        "notes": "Morning weight"
    }
    # Create log
    response = client.post("/api/v1/weight/logs", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["weight_kg"] == 71.5
    
    # Get latest
    latest_response = client.get("/api/v1/weight/latest")
    assert latest_response.status_code == 200
    latest_data = latest_response.json()
    assert latest_data["weight_kg"] == 71.5

def test_weight_upsert(client):
    # Log initial weight
    payload1 = {
        "weight_kg": 72.0,
        "weight_date": date.today().isoformat(),
        "notes": "First weight of day"
    }
    response1 = client.post("/api/v1/weight/logs", json=payload1)
    assert response1.status_code == 200
    assert response1.json()["weight_kg"] == 72.0

    # Log updated weight for the same day
    payload2 = {
        "weight_kg": 71.8,
        "weight_date": date.today().isoformat(),
        "notes": "Updated weight of day"
    }
    response2 = client.post("/api/v1/weight/logs", json=payload2)
    assert response2.status_code == 200
    assert response2.json()["weight_kg"] == 71.8

    # Verify that the user profile weight is updated
    profile_response = client.get("/api/v1/profile/me")
    assert profile_response.status_code == 200
    assert profile_response.json()["weight_kg"] == 71.8

