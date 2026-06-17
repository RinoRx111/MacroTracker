import pytest
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend directory is in sys.path
backend_path = Path(__file__).parent.parent.resolve()
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

from app.models import Base, User
from app.core.database import get_db
from app.main import app

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    SessionLocal = sessionmaker(bind=connection)
    session = SessionLocal()
    
    # Seed default test user (id=1) since demo auth mocks user_id=1
    test_user = User(
        id=1,
        username="testuser",
        email="test@example.com",
        hashed_password="pbkdf2:sha256:...",
        height_cm=175.0,
        weight_kg=70.0,
        age=25,
        gender="male",
        daily_calorie_goal=2000,
        protein_goal_g=150.0,
        carbs_goal_g=200.0,
        fat_goal_g=65.0,
        daily_step_goal=10000,
        daily_water_goal_ml=2000,
        daily_calories_burned_goal=500.0,
    )
    session.add(test_user)
    session.commit()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    from fastapi.testclient import TestClient
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
