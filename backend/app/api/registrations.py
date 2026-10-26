from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.course import Course
from ..models.registration import Registration
from ..models.user import User
from ..schemas.registration import RegistrationCreate, RegistrationStatusUpdate, RegistrationResponse, PERMITTED_STATUSES
from ..core.dependencies import get_current_user, get_current_student

router = APIRouter(prefix="/registrations", tags=["Registrations"])

@router.post("", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_course(
    payload: RegistrationCreate,
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Register the authenticated student for an available course."""
    # Find course
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {payload.course_id} was not found."
        )

    # Check for existing registration record
    existing_reg = db.query(Registration).filter(
        Registration.student_id == current_student.id,
        Registration.course_id == course.id
    ).first()

    if existing_reg and existing_reg.status == "enrolled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already enrolled in this course."
        )

    # Transactional check of current active enrolments to prevent over-capacity
    active_count = db.query(func.count(Registration.id)).filter(
        Registration.course_id == course.id,
        Registration.status == "enrolled"
    ).scalar() or 0

    if active_count >= course.max_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course '{course.code}' has reached its maximum capacity of {course.max_capacity} students."
        )

    if existing_reg:
        # Re-enrolling previously cancelled or dropped registration
        existing_reg.status = "enrolled"
        db.commit()
        db.refresh(existing_reg)
        return existing_reg
    else:
        # Create fresh registration
        new_reg = Registration(
            student_id=current_student.id,
            course_id=course.id,
            status="enrolled"
        )
        db.add(new_reg)
        db.commit()
        db.refresh(new_reg)
        return new_reg

@router.get("/me", response_model=list[RegistrationResponse])
def get_my_registrations(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Retrieve all registrations for the currently authenticated student."""
    registrations = db.query(Registration).filter(
        Registration.student_id == current_student.id
    ).order_by(Registration.registered_at.desc()).all()
    return registrations

@router.get("/{registration_id}", response_model=RegistrationResponse)
def get_registration(
    registration_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a specific registration record by ID."""
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with ID {registration_id} was not found."
        )

    # Students can only view their own registrations
    if current_user.role != "admin" and reg.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this registration."
        )

    return reg

@router.patch("/{registration_id}/status", response_model=RegistrationResponse)
def update_registration_status(
    registration_id: int,
    payload: RegistrationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update registration status (Admin: any status; Student: cancel own registration)."""
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with ID {registration_id} was not found."
        )

    target_status = payload.status.lower()

    if current_user.role != "admin":
        # Students can only cancel their own registration
        if reg.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this registration."
            )
        if target_status != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Students are only permitted to cancel active registrations."
            )
        if reg.status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This registration is already cancelled."
            )
    else:
        # Admin changing status
        # If admin is setting status back to enrolled, verify capacity
        if target_status == "enrolled" and reg.status != "enrolled":
            active_count = db.query(func.count(Registration.id)).filter(
                Registration.course_id == reg.course_id,
                Registration.status == "enrolled"
            ).scalar() or 0
            if active_count >= reg.course.max_capacity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot re-enrol: Course has reached maximum capacity of {reg.course.max_capacity}."
                )

    reg.status = target_status
    db.commit()
    db.refresh(reg)
    return reg

@router.delete("/{registration_id}", status_code=status.HTTP_200_OK)
def cancel_registration(
    registration_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a registration (preserves audit history by setting status to cancelled)."""
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with ID {registration_id} was not found."
        )

    if current_user.role != "admin" and reg.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to cancel this registration."
        )

    reg.status = "cancelled"
    db.commit()
    return {"message": "Registration was successfully cancelled.", "registration_id": registration_id}
