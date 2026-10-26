from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.user import User
from ..models.course import Course
from ..models.registration import Registration
from ..schemas.user import UserResponse
from ..schemas.registration import RegistrationResponse
from ..schemas.admin import AdminStatsResponse, CourseEnrolmentStat, DepartmentStat
from ..core.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/students", response_model=list[UserResponse])
def get_all_students(
    search: str | None = Query(None, description="Search by student name, email, or student number"),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """List all registered students in the system. Administrator only."""
    query = db.query(User).filter(User.role == "student")
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (User.full_name.ilike(search_term)) |
            (User.email.ilike(search_term)) |
            (User.student_number.ilike(search_term))
        )
    return query.order_by(User.full_name.asc()).all()

@router.get("/registrations", response_model=list[RegistrationResponse])
def get_all_registrations(
    status: str | None = Query(None, description="Filter by registration status"),
    course_id: int | None = Query(None, description="Filter by course ID"),
    student_id: int | None = Query(None, description="Filter by student ID"),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """List all registrations across the entire institution. Administrator only."""
    query = db.query(Registration)
    if status:
        query = query.filter(Registration.status == status.lower())
    if course_id:
        query = query.filter(Registration.course_id == course_id)
    if student_id:
        query = query.filter(Registration.student_id == student_id)
    return query.order_by(Registration.registered_at.desc()).all()

@router.get("/statistics", response_model=AdminStatsResponse)
def get_admin_statistics(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Retrieve institution-wide course registration metrics and statistics."""
    total_students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    total_courses = db.query(func.count(Course.id)).scalar() or 0
    total_registrations = db.query(func.count(Registration.id)).scalar() or 0
    active_enrolments = db.query(func.count(Registration.id)).filter(Registration.status == "enrolled").scalar() or 0

    courses = db.query(Course).all()
    course_stats: list[CourseEnrolmentStat] = []
    courses_at_capacity = 0

    # Group by department
    dept_map: dict[str, dict[str, int]] = {}

    for c in courses:
        enrolled = db.query(func.count(Registration.id)).filter(
            Registration.course_id == c.id,
            Registration.status == "enrolled"
        ).scalar() or 0

        fill_rate = round((enrolled / c.max_capacity) * 100, 1) if c.max_capacity > 0 else 0.0
        if enrolled >= c.max_capacity:
            courses_at_capacity += 1

        course_stats.append(CourseEnrolmentStat(
            course_id=c.id,
            code=c.code,
            name=c.name,
            department=c.department,
            enrolled_count=enrolled,
            max_capacity=c.max_capacity,
            fill_rate_percent=fill_rate
        ))

        # Department accumulation
        if c.department not in dept_map:
            dept_map[c.department] = {"course_count": 0, "total_enrolled": 0}
        dept_map[c.department]["course_count"] += 1
        dept_map[c.department]["total_enrolled"] += enrolled

    department_stats = [
        DepartmentStat(
            department=dept,
            course_count=stats["course_count"],
            total_enrolled=stats["total_enrolled"]
        )
        for dept, stats in sorted(dept_map.items())
    ]

    return AdminStatsResponse(
        total_students=total_students,
        total_courses=total_courses,
        total_registrations=total_registrations,
        active_enrolments=active_enrolments,
        courses_at_capacity=courses_at_capacity,
        course_stats=course_stats,
        department_stats=department_stats
    )
