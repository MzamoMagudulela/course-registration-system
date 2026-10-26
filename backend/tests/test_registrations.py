from app.models.user import User
from app.models.course import Course
from app.models.registration import Registration
from app.core.security import get_password_hash, create_access_token

def test_successful_registration(client, student_headers, sample_course):
    response = client.post("/api/registrations", headers=student_headers, json={
        "course_id": sample_course.id
    })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "enrolled"
    assert data["course_id"] == sample_course.id

    # Verify course seat count decreases
    c_res = client.get(f"/api/courses/{sample_course.id}")
    assert c_res.json()["enrolled_count"] == 1
    assert c_res.json()["available_seats"] == sample_course.max_capacity - 1

def test_duplicate_registration_rejected(client, student_headers, sample_course):
    # First registration
    client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})

    # Duplicate registration
    response = client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})
    assert response.status_code == 400
    assert "already enrolled" in response.json()["detail"]

def test_full_course_registration_rejected(client, db_session, student_headers):
    # Create a course with capacity of 1
    small_course = Course(
        code="TINY101",
        name="Tiny Seminar",
        description="One student limit",
        department="Computer Science",
        credits=1,
        max_capacity=1
    )
    db_session.add(small_course)
    db_session.commit()
    db_session.refresh(small_course)

    # First student registers
    res1 = client.post("/api/registrations", headers=student_headers, json={"course_id": small_course.id})
    assert res1.status_code == 201

    # Second student registers
    student2 = User(
        email="student2@university.edu",
        full_name="Second Student",
        student_number="STU999002",
        password_hash=get_password_hash("Pass123!"),
        role="student"
    )
    db_session.add(student2)
    db_session.commit()
    token2 = create_access_token(data={"sub": str(student2.id), "role": "student", "email": student2.email})
    headers2 = {"Authorization": f"Bearer {token2}"}

    res2 = client.post("/api/registrations", headers=headers2, json={"course_id": small_course.id})
    assert res2.status_code == 400
    assert "maximum capacity" in res2.json()["detail"]

def test_student_cancel_own_registration(client, student_headers, sample_course):
    reg_res = client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})
    reg_id = reg_res.json()["id"]

    # Student cancels
    cancel_res = client.patch(f"/api/registrations/{reg_id}/status", headers=student_headers, json={"status": "cancelled"})
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Seats should be freed
    c_res = client.get(f"/api/courses/{sample_course.id}")
    assert c_res.json()["enrolled_count"] == 0
    assert c_res.json()["available_seats"] == sample_course.max_capacity

def test_student_cannot_modify_other_students_registration(client, db_session, student_headers, sample_course):
    # Other student
    other_student = User(
        email="other@university.edu",
        full_name="Other Student",
        student_number="STU999003",
        password_hash=get_password_hash("Pass123!"),
        role="student"
    )
    db_session.add(other_student)
    db_session.commit()

    other_reg = Registration(student_id=other_student.id, course_id=sample_course.id, status="enrolled")
    db_session.add(other_reg)
    db_session.commit()

    # Current student attempts to cancel other student's registration
    res = client.patch(f"/api/registrations/{other_reg.id}/status", headers=student_headers, json={"status": "cancelled"})
    assert res.status_code == 403

def test_student_cannot_set_arbitrary_status(client, student_headers, sample_course):
    reg_res = client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})
    reg_id = reg_res.json()["id"]

    # Attempt to set to completed
    res = client.patch(f"/api/registrations/{reg_id}/status", headers=student_headers, json={"status": "completed"})
    assert res.status_code == 400
    assert "only permitted to cancel" in res.json()["detail"]

def test_invalid_registration_id(client, student_headers):
    res = client.get("/api/registrations/99999", headers=student_headers)
    assert res.status_code == 404
