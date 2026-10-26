from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict
from .course import CourseResponse
from .user import UserResponse

PERMITTED_STATUSES = {"enrolled", "cancelled", "completed", "rejected"}

class RegistrationCreate(BaseModel):
    course_id: int

class RegistrationStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in PERMITTED_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(sorted(PERMITTED_STATUSES))}")
        return cleaned

class CourseSummary(BaseModel):
    id: int
    code: str
    name: str
    department: str
    credits: int
    max_capacity: int

    model_config = ConfigDict(from_attributes=True)

class StudentSummary(BaseModel):
    id: int
    full_name: str
    email: str
    student_number: str | None = None

    model_config = ConfigDict(from_attributes=True)

class RegistrationResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    status: str
    registered_at: datetime
    updated_at: datetime
    course: CourseSummary | None = None
    student: StudentSummary | None = None

    model_config = ConfigDict(from_attributes=True)
