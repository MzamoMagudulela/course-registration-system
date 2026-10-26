import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.course import Course
from app.models.registration import Registration
from app.core.security import get_password_hash, create_access_token

# In-memory SQLite for tests with StaticPool so all threads/sessions share the same DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test function."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db_session):
    admin = User(
        email="test_admin@university.edu",
        full_name="Test Administrator",
        student_number=None,
        password_hash=get_password_hash("AdminPass123!"),
        role="admin"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture
def admin_headers(admin_user):
    token = create_access_token(data={"sub": str(admin_user.id), "role": "admin", "email": admin_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def student_user(db_session):
    student = User(
        email="test_student@university.edu",
        full_name="Test Student",
        student_number="STU999001",
        password_hash=get_password_hash("StudentPass123!"),
        role="student"
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)
    return student

@pytest.fixture
def student_headers(student_user):
    token = create_access_token(data={"sub": str(student_user.id), "role": "student", "email": student_user.email})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def sample_course(db_session):
    course = Course(
        code="CS101",
        name="Introduction to Programming",
        description="Core computing concepts and syntax.",
        department="Computer Science",
        credits=3,
        prerequisites="None",
        max_capacity=30
    )
    db_session.add(course)
    db_session.commit()
    db_session.refresh(course)
    return course
