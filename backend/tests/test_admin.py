from app.models.course import Course
from app.models.registration import Registration

def test_admin_get_students(client, admin_headers, student_user):
    response = client.get("/api/admin/students", headers=admin_headers)
    assert response.status_code == 200
    students = response.json()
    assert len(students) >= 1
    assert any(s["email"] == student_user.email for s in students)

def test_student_forbidden_from_admin_students(client, student_headers):
    response = client.get("/api/admin/students", headers=student_headers)
    assert response.status_code == 403
    assert "Administrator access required" in response.json()["detail"]

def test_admin_get_registrations(client, admin_headers, student_headers, sample_course):
    # Student registers
    client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})

    # Admin lists registrations
    response = client.get("/api/admin/registrations", headers=admin_headers)
    assert response.status_code == 200
    regs = response.json()
    assert len(regs) >= 1
    assert regs[0]["course"]["code"] == sample_course.code

def test_admin_statistics(client, admin_headers, student_headers, sample_course):
    client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})

    response = client.get("/api/admin/statistics", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_students"] >= 1
    assert data["total_courses"] >= 1
    assert data["active_enrolments"] >= 1
    assert len(data["department_stats"]) >= 1
    assert len(data["course_stats"]) >= 1

def test_capacity_reduction_below_enrolled_fails(client, admin_headers, student_headers, sample_course):
    # Enrol 1 student
    client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})

    # Try to reduce capacity to 0
    res = client.put(f"/api/courses/{sample_course.id}", headers=admin_headers, json={
        "max_capacity": 0
    })
    # Max capacity validation fails either at pydantic (ge=1) or route logic (max_capacity < enrolled)
    assert res.status_code in (400, 422)

    # Try reducing capacity to a value less than enrolled count (e.g., if we had 1 enrolled, reducing to 0)
    # If we set max_capacity to 1 (which equals enrolled), it should succeed
    res_valid = client.put(f"/api/courses/{sample_course.id}", headers=admin_headers, json={
        "max_capacity": 1
    })
    assert res_valid.status_code == 200
