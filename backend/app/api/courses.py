from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from ..database import get_db
from ..models.course import Course
from ..models.registration import Registration
from ..schemas.course import CourseCreate, CourseUpdate, CourseResponse
from ..core.dependencies import get_current_admin

router = APIRouter(prefix="/courses", tags=["Courses"])

def build_course_response(course: Course, db: Session) -> CourseResponse:
    """Calculate enrolled count and available seats for a course."""
    enrolled_count = db.query(func.count(Registration.id)).filter(
        Registration.course_id == course.id,
        Registration.status == "enrolled"
    ).scalar() or 0

    available_seats = max(0, course.max_capacity - enrolled_count)
    is_full = available_seats == 0

    return CourseResponse(
        id=course.id,
        code=course.code,
        name=course.name,
        description=course.description,
        department=course.department,
        credits=course.credits,
        prerequisites=course.prerequisites,
        max_capacity=course.max_capacity,
        created_at=course.created_at,
        updated_at=course.updated_at,
        enrolled_count=enrolled_count,
        available_seats=available_seats,
        is_full=is_full
    )

@router.get("", response_model=list[CourseResponse])
def get_courses(
    search: str | None = Query(None, description="Search by course code, name, or department"),
    department: str | None = Query(None, description="Filter by department"),
    has_seats: bool | None = Query(None, description="Filter courses with available seats only"),
    db: Session = Depends(get_db)
):
    """Retrieve all available courses with optional search and filters."""
    query = db.query(Course)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Course.code.ilike(search_term),
                Course.name.ilike(search_term),
                Course.department.ilike(search_term)
            )
        )

    if department:
        query = query.filter(Course.department.ilike(department.strip()))

    courses = query.order_by(Course.code.asc()).all()

    # Build response with calculated seats
    results = [build_course_response(c, db) for c in courses]

    if has_seats is True:
        results = [r for r in results if not r.is_full]

    return results

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed information for a specific course by ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} was not found."
        )
    return build_course_response(course, db)

@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Create a new course. Administrator privileges required."""
    existing = db.query(Course).filter(Course.code == payload.code.upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A course with code '{payload.code.upper()}' already exists."
        )

    course = Course(
        code=payload.code.upper(),
        name=payload.name.strip(),
        description=payload.description.strip(),
        department=payload.department.strip(),
        credits=payload.credits,
        prerequisites=(payload.prerequisites or "").strip(),
        max_capacity=payload.max_capacity
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return build_course_response(course, db)

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Update an existing course. Administrator privileges required."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} was not found."
        )

    # Check for code collision
    if payload.code and payload.code.upper() != course.code:
        conflict = db.query(Course).filter(Course.code == payload.code.upper()).first()
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another course with code '{payload.code.upper()}' already exists."
            )
        course.code = payload.code.upper()

    # Rule: Capacity changes must not invalidate existing enrolments
    enrolled_count = db.query(func.count(Registration.id)).filter(
        Registration.course_id == course.id,
        Registration.status == "enrolled"
    ).scalar() or 0

    if payload.max_capacity is not None:
        if payload.max_capacity < enrolled_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reduce capacity to {payload.max_capacity}. Course currently has {enrolled_count} active enrolments."
            )
        course.max_capacity = payload.max_capacity

    if payload.name is not None:
        course.name = payload.name.strip()
    if payload.description is not None:
        course.description = payload.description.strip()
    if payload.department is not None:
        course.department = payload.department.strip()
    if payload.credits is not None:
        course.credits = payload.credits
    if payload.prerequisites is not None:
        course.prerequisites = payload.prerequisites.strip()

    db.commit()
    db.refresh(course)
    return build_course_response(course, db)

@router.delete("/{course_id}", status_code=status.HTTP_200_OK)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """Delete a course. Administrator privileges required."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} was not found."
        )

    enrolled_count = db.query(func.count(Registration.id)).filter(
        Registration.course_id == course.id,
        Registration.status == "enrolled"
    ).scalar() or 0

    if enrolled_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete course '{course.code}'. It currently has {enrolled_count} active student enrolments."
        )

    db.delete(course)
    db.commit()
    return {"message": f"Course '{course.code}' was successfully deleted."}
