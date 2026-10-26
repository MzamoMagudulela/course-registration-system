from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String(100), nullable=False)
    credits = Column(Integer, nullable=False, default=3)
    prerequisites = Column(String(255), nullable=True, default="")
    max_capacity = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    registrations = relationship("Registration", back_populates="course", cascade="all, delete-orphan")
