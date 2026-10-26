from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.registration import Registration
from ..schemas.user import StudentRegister, UserResponse
from ..schemas.registration import RegistrationResponse
from ..core.security import get_password_hash
from ..core.dependencies import get_current_user, get_current_student

router = APIRouter(prefix="/students", tags=["Students"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_student(payload: StudentRegister, db: Session = Depends(get_db)):
    """Create a new student record (public or onboarding registration)."""
    existing_email = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    existing_num = db.query(User).filter(User.student_number == payload.student_number).first()
    if existing_num:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this student number already exists."
        )

    user = User(
        email=payload.email.lower().strip(),
        full_name=payload.full_name.strip(),
        student_number=payload.student_number.strip().upper(),
        password_hash=get_password_hash(payload.password),
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the authenticated user's profile details."""
    return current_user

@router.get("/me/registrations", response_model=list[RegistrationResponse])
def get_my_student_registrations(
    current_student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Retrieve all course registrations for the currently authenticated student."""
    registrations = db.query(Registration).filter(Registration.student_id == current_student.id).all()
    return registrations
