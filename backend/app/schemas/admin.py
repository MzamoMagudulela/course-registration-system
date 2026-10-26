from pydantic import BaseModel

class CourseEnrolmentStat(BaseModel):
    course_id: int
    code: str
    name: str
    department: str
    enrolled_count: int
    max_capacity: int
    fill_rate_percent: float

class DepartmentStat(BaseModel):
    department: str
    course_count: int
    total_enrolled: int

class AdminStatsResponse(BaseModel):
    total_students: int
    total_courses: int
    total_registrations: int
    active_enrolments: int
    courses_at_capacity: int
    course_stats: list[CourseEnrolmentStat]
    department_stats: list[DepartmentStat]
