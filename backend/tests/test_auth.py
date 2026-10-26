def test_student_registration_success(client):
    response = client.post("/api/auth/register", json={
        "email": "new_student@university.edu",
        "full_name": "New Student",
        "student_number": "STU123456",
        "password": "SecurePassword123!"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "new_student@university.edu"
    assert data["user"]["student_number"] == "STU123456"
    assert data["user"]["role"] == "student"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

def test_duplicate_email_registration(client, student_user):
    response = client.post("/api/auth/register", json={
        "email": student_user.email,
        "full_name": "Another Name",
        "student_number": "STU_DIFFERENT",
        "password": "SecurePassword123!"
    })
    assert response.status_code == 400
    assert "email address already exists" in response.json()["detail"]

def test_duplicate_student_number_registration(client, student_user):
    response = client.post("/api/auth/register", json={
        "email": "different_email@university.edu",
        "full_name": "Another Name",
        "student_number": student_user.student_number,
        "password": "SecurePassword123!"
    })
    assert response.status_code == 400
    assert "student number already exists" in response.json()["detail"]

def test_registration_validation_errors(client):
    # Invalid email, too short password
    response = client.post("/api/auth/register", json={
        "email": "not-an-email",
        "full_name": "A",
        "student_number": "",
        "password": "123"
    })
    assert response.status_code == 422
    assert "detail" in response.json()

def test_student_login_success(client, student_user):
    response = client.post("/api/auth/login", json={
        "email": student_user.email,
        "password": "StudentPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == student_user.email

def test_login_invalid_password(client, student_user):
    response = client.post("/api/auth/login", json={
        "email": student_user.email,
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={
        "email": "nobody@university.edu",
        "password": "AnyPassword123!"
    })
    assert response.status_code == 401

def test_get_current_user_profile(client, student_headers, student_user):
    response = client.get("/api/students/me", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == student_user.email
    assert data["student_number"] == student_user.student_number
