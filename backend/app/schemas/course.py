from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict

class CourseBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=20)
    name: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=5)
    department: str = Field(..., min_length=2, max_length=100)
    credits: int = Field(default=3, ge=1, le=12)
    prerequisites: str | None = Field(default="")
    max_capacity: int = Field(default=30, ge=1, le=500)

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("Course code cannot be empty")
        return cleaned

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    code: str | None = Field(None, min_length=2, max_length=20)
    name: str | None = Field(None, min_length=2, max_length=150)
    description: str | None = Field(None, min_length=5)
    department: str | None = Field(None, min_length=2, max_length=100)
    credits: int | None = Field(None, ge=1, le=12)
    prerequisites: str | None = None
    max_capacity: int | None = Field(None, ge=1, le=500)

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str | None) -> str | None:
        if v is not None:
            cleaned = v.strip().upper()
            if not cleaned:
                raise ValueError("Course code cannot be empty")
            return cleaned
        return v

class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enrolled_count: int = 0
    available_seats: int = 0
    is_full: bool = False

    model_config = ConfigDict(from_attributes=True)
