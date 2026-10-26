def test_get_courses_public(client, sample_course):
    response = client.get("/api/courses")
    assert response.status_code == 200
    courses = response.json()
    assert len(courses) >= 1
    assert courses[0]["code"] == sample_course.code
    assert "available_seats" in courses[0]
    assert "enrolled_count" in courses[0]

def test_course_search_and_filter(client, db_session):
    from app.models.course import Course
    c1 = Course(code="PHYS101", name="Physics Mechanics", description="Mechanics and motion", department="Physics", credits=4, max_capacity=20)
    c2 = Course(code="HIST200", name="Modern History", description="World history", department="Humanities", credits=3, max_capacity=25)
    db_session.add_all([c1, c2])
    db_session.commit()

    # Search by code
    res = client.get("/api/courses?search=PHYS")
    assert res.status_code == 200
    assert any(c["code"] == "PHYS101" for c in res.json())
    assert not any(c["code"] == "HIST200" for c in res.json())

    # Filter by department
    res_dept = client.get("/api/courses?department=Humanities")
    assert res_dept.status_code == 200
    assert len(res_dept.json()) == 1
    assert res_dept.json()[0]["department"] == "Humanities"

def test_get_course_by_id(client, sample_course):
    response = client.get(f"/api/courses/{sample_course.id}")
    assert response.status_code == 200
    assert response.json()["id"] == sample_course.id
    assert response.json()["code"] == sample_course.code

def test_get_course_invalid_id(client):
    response = client.get("/api/courses/999999")
    assert response.status_code == 404
    assert "was not found" in response.json()["detail"]

def test_admin_create_course_success(client, admin_headers):
    response = client.post("/api/courses", headers=admin_headers, json={
        "code": "CS202",
        "name": "Advanced Algorithms",
        "description": "Complex graph algorithms and dynamic programming.",
        "department": "Computer Science",
        "credits": 4,
        "prerequisites": "CS101",
        "max_capacity": 25
    })
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "CS202"
    assert data["max_capacity"] == 25
    assert data["available_seats"] == 25

def test_duplicate_course_code_rejected(client, admin_headers, sample_course):
    response = client.post("/api/courses", headers=admin_headers, json={
        "code": sample_course.code,
        "name": "Another Course with duplicate code",
        "description": "Some description here.",
        "department": "Computer Science",
        "credits": 3,
        "max_capacity": 30
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_student_cannot_create_course(client, student_headers):
    response = client.post("/api/courses", headers=student_headers, json={
        "code": "CS999",
        "name": "Student Hack",
        "description": "Unauthorized attempt",
        "department": "Hacking",
        "credits": 3,
        "max_capacity": 10
    })
    assert response.status_code == 403
    assert "Administrator access required" in response.json()["detail"]

def test_admin_update_course(client, admin_headers, sample_course):
    response = client.put(f"/api/courses/{sample_course.id}", headers=admin_headers, json={
        "name": "Updated Intro to Computer Science",
        "max_capacity": 50
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Intro to Computer Science"
    assert data["max_capacity"] == 50

def test_delete_course_with_active_enrolments_rejected(client, admin_headers, student_headers, sample_course):
    # Enrol student
    reg_res = client.post("/api/registrations", headers=student_headers, json={"course_id": sample_course.id})
    assert reg_res.status_code == 201

    # Attempt to delete course
    del_res = client.delete(f"/api/courses/{sample_course.id}", headers=admin_headers)
    assert del_res.status_code == 400
    assert "active student enrolments" in del_res.json()["detail"]

def test_delete_course_success_when_empty(client, admin_headers, sample_course):
    response = client.delete(f"/api/courses/{sample_course.id}", headers=admin_headers)
    assert response.status_code == 200
    assert "successfully deleted" in response.json()["message"]
