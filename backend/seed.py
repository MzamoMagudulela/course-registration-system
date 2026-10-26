import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.course import Course
from app.models.registration import Registration
from app.core.security import get_password_hash

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Administrator
        admin_email = os.getenv("ADMIN_EMAIL", "admin@university.edu").lower().strip()
        admin_password = os.getenv("ADMIN_PASSWORD", "AdminPass123!")
        admin_name = os.getenv("ADMIN_NAME", "System Administrator")

        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                full_name=admin_name,
                student_number=None,
                password_hash=get_password_hash(admin_password),
                role="admin"
            )
            db.add(admin)
            print(f"[+] Administrator created: {admin_email} (Password: {admin_password})")
        else:
            print(f"[*] Administrator already exists: {admin_email}")

        # 2. Seed Sample Courses
        sample_courses = [
            {
                "code": "CS101",
                "name": "Introduction to Computer Science",
                "description": "Fundamental concepts of programming, algorithms, and computational problem solving using modern paradigms.",
                "department": "Computer Science",
                "credits": 4,
                "prerequisites": "None",
                "max_capacity": 35
            },
            {
                "code": "CS201",
                "name": "Data Structures & Algorithms",
                "description": "Comprehensive study of arrays, linked lists, trees, graphs, sorting, and algorithmic complexity analysis.",
                "department": "Computer Science",
                "credits": 4,
                "prerequisites": "CS101",
                "max_capacity": 30
            },
            {
                "code": "CS305",
                "name": "Database Systems & Architecture",
                "description": "Relational data modeling, SQL queries, transaction management, indexing, ACID guarantees, and NoSQL databases.",
                "department": "Computer Science",
                "credits": 3,
                "prerequisites": "CS201",
                "max_capacity": 25
            },
            {
                "code": "CS410",
                "name": "Cloud Computing & REST APIs",
                "description": "Architecting modern distributed microservices, RESTful API design, authentication, containerization, and serverless.",
                "department": "Computer Science",
                "credits": 4,
                "prerequisites": "CS305",
                "max_capacity": 20
            },
            {
                "code": "MATH101",
                "name": "Calculus for Computing",
                "description": "Differential and integral calculus with applications in computer science, machine learning, and simulations.",
                "department": "Mathematics",
                "credits": 4,
                "prerequisites": "High School Mathematics",
                "max_capacity": 40
            },
            {
                "code": "MATH220",
                "name": "Discrete Mathematics & Logic",
                "description": "Propositional logic, set theory, combinatorics, graph theory, induction, and formal proofs.",
                "department": "Mathematics",
                "credits": 3,
                "prerequisites": "MATH101",
                "max_capacity": 30
            },
            {
                "code": "DS201",
                "name": "Applied Data Science & Machine Learning",
                "description": "Exploratory data analysis, statistical regression, classification algorithms, feature engineering, and scikit-learn.",
                "department": "Data Science",
                "credits": 3,
                "prerequisites": "CS101, MATH101",
                "max_capacity": 25
            },
            {
                "code": "ENG105",
                "name": "Technical Communication for Engineers",
                "description": "Professional engineering documentation, report writing, presentation skills, and collaborative design ethics.",
                "department": "Engineering",
                "credits": 2,
                "prerequisites": "None",
                "max_capacity": 30
            },
            {
                "code": "SE320",
                "name": "Software Engineering Principles",
                "description": "Agile methodologies, testing frameworks, CI/CD pipelines, design patterns, and team-based development.",
                "department": "Software Engineering",
                "credits": 3,
                "prerequisites": "CS201",
                "max_capacity": 28
            },
            {
                "code": "SEC401",
                "name": "Cybersecurity Fundamentals",
                "description": "Network security, cryptography, vulnerability assessment, ethical hacking, and secure code practices.",
                "department": "Information Security",
                "credits": 3,
                "prerequisites": "CS201",
                "max_capacity": 22
            }
        ]

        created_courses = {}
        for c_data in sample_courses:
            existing_c = db.query(Course).filter(Course.code == c_data["code"]).first()
            if not existing_c:
                c = Course(**c_data)
                db.add(c)
                db.flush()
                created_courses[c.code] = c
                print(f"[+] Added course: {c.code} - {c.name}")
            else:
                created_courses[existing_c.code] = existing_c

        # 3. Seed Sample Students
        sample_students = [
            {
                "email": "alex.chen@university.edu",
                "full_name": "Alex Chen",
                "student_number": "STU2024001",
                "password": "StudentPass123!"
            },
            {
                "email": "sarah.johnson@university.edu",
                "full_name": "Sarah Johnson",
                "student_number": "STU2024002",
                "password": "StudentPass123!"
            },
            {
                "email": "michael.brown@university.edu",
                "full_name": "Michael Brown",
                "student_number": "STU2024003",
                "password": "StudentPass123!"
            }
        ]

        created_students = []
        for s_data in sample_students:
            s_exist = db.query(User).filter(User.email == s_data["email"]).first()
            if not s_exist:
                student = User(
                    email=s_data["email"],
                    full_name=s_data["full_name"],
                    student_number=s_data["student_number"],
                    password_hash=get_password_hash(s_data["password"]),
                    role="student"
                )
                db.add(student)
                db.flush()
                created_students.append(student)
                print(f"[+] Added student: {student.full_name} ({student.student_number})")
            else:
                created_students.append(s_exist)

        # 4. Seed initial registrations for demonstration
        if created_students and created_courses:
            sample_regs = [
                (created_students[0].id, created_courses["CS101"].id, "enrolled"),
                (created_students[0].id, created_courses["MATH101"].id, "enrolled"),
                (created_students[1].id, created_courses["CS101"].id, "enrolled"),
                (created_students[1].id, created_courses["ENG105"].id, "enrolled"),
                (created_students[2].id, created_courses["DS201"].id, "enrolled"),
            ]

            for s_id, c_id, status in sample_regs:
                existing_r = db.query(Registration).filter(
                    Registration.student_id == s_id,
                    Registration.course_id == c_id
                ).first()
                if not existing_r:
                    reg = Registration(student_id=s_id, course_id=c_id, status=status)
                    db.add(reg)

        db.commit()
        print("\n[SUCCESS] Database seeded successfully with administrator, courses, and sample students!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
