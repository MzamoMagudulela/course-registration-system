# Course Registration System (Full-Stack RESTful Application)

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57.svg)](https://www.sqlalchemy.org/)
[![Pytest](https://img.shields.io/badge/Tests-30%20Passed-brightgreen.svg)](https://docs.pytest.org/)

A full-stack academic Course Registration System engineered for student self-service and administrative governance. Built with **FastAPI**, **SQLAlchemy**, **SQLite**, and **React (Vite)**, this application guarantees ACID-compliant transactional seat allocation, zero duplicate registrations, salted bcrypt authentication, and real-time administrative analytics.

---

## Table of Contents
- [Architecture & Design](#architecture--design)
- [System Features](#system-features)
  - [Student Features](#student-features)
  - [Administrator Features](#administrator-features)
  - [Business Rules & Guardrails](#business-rules--guardrails)
- [Technology Stack](#technology-stack)
- [Project Directory Structure](#project-directory-structure)
- [Windows Installation & Setup Guide](#windows-installation--setup-guide)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Database Initialization & Seeding](#3-database-initialization--seeding)
  - [4. Frontend Setup](#4-frontend-setup)
- [Running the Application](#running-the-application)
- [Automated Testing Suite (pytest)](#automated-testing-suite-pytest)
- [REST API Reference & Endpoints](#rest-api-reference--endpoints)
- [Swagger UI & Interactive API Documentation](#swagger-ui--interactive-api-documentation)
- [Deployment Recommendations](#deployment-recommendations)
- [Git & GitHub Upload Instructions](#git--github-upload-instructions)

---

## Architecture & Design

```
                     ┌────────────────────────────────────────┐
                     │          React + Vite Frontend         │
                     │  (State, JWT Storage, Modular Views)   │
                     └───────────────────┬────────────────────┘
                                         │ JSON / REST API (HTTP)
                                         ▼
                     ┌────────────────────────────────────────┐
                     │           FastAPI REST Engine          │
                     │  - OAuth2 Password Bearer / JWT Auth   │
                     │  - Role-Based Access Control (RBAC)    │
                     │  - Pydantic v2 Schema Validation       │
                     └───────────────────┬────────────────────┘
                                         │ ORM Queries / ACID
                                         ▼
                     ┌────────────────────────────────────────┐
                     │        SQLAlchemy 2.0 ORM Core         │
                     │  - Foreign Keys & Cascading Deletions  │
                     │  - Unique Constraints (Student+Course) │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │            SQLite Database             │
                     │   (users, courses, registrations)      │
                     └────────────────────────────────────────┘
```

---

## System Features

### Student Features
1. **Student Registration**: Onboarding with Full Name, Email, Student Number, and Password.
2. **Secure Login**: Authentication with salted bcrypt password hashing and 24-hour JWT tokens.
3. **Course Catalogue**: Search courses by code, title, or department with instant open-seat filters.
4. **Course Details**: Inspect prerequisites, credit ratings, department info, and live remaining seats.
5. **Atomic Registration**: Instant seat reservation with transactional concurrency protection.
6. **Duplicate Prevention**: Prevents students from registering for the same course more than once.
7. **Registration Management**: View all enrolled and past courses with timestamps and status indicators.
8. **Self-Service Cancellation**: Students can drop or cancel active enrolments, instantly releasing their seat to other students.

### Administrator Features
1. **Administrative Dashboard**: Real-time institution-wide metrics (total students, total courses, active enrolments, courses at full capacity).
2. **Course Management (CRUD)**: Create, edit, inspect, and delete courses.
3. **Capacity Guardrails**: Course maximum capacity cannot be lowered below the number of currently enrolled students.
4. **Safe Course Deletion**: Courses with active student enrolments cannot be deleted without first resolving registrations.
5. **Student Roster**: Searchable table of registered students with student IDs and registration dates.
6. **Registration Governance**: Update registration statuses (`enrolled`, `cancelled`, `completed`, `rejected`) across all departments.
7. **Department & Fill Rate Analytics**: Visual progress indicators for course capacity utilization.

### Business Rules & Guardrails
- **Unique Student Credentials**: Duplicate email addresses and student numbers are rejected with 400 Bad Request.
- **Unique Course Codes**: Course codes are automatically normalized to uppercase and enforced unique.
- **Seat Capacity Limits**: Course capacity is checked transactionally. Registrations for full courses are rejected.
- **Role Isolation**: Only administrators can add/edit/delete courses or view administrative rosters.
- **Audit Preservation**: Registrations preserve history rather than silently disappearing.

---

## Technology Stack

- **Backend**:
  - Python 3.11+ / 3.14
  - FastAPI (REST API Framework)
  - SQLAlchemy 2.0 (ORM)
  - SQLite (Relational Database)
  - Pydantic v2 (Input & Response Validation)
  - PyJWT & Bcrypt (Security, Hashing, Token Generation)
  - pytest & HTTPX (Automated Test Suite)
- **Frontend**:
  - React 19
  - Vite 8
  - Lucide React (Icons)
  - Vanilla CSS (Modern, responsive, custom design system)

---

## Project Directory Structure

```
Course API/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py             # App settings and environment loading
│   │   ├── database.py           # Engine and SessionLocal configuration
│   │   ├── main.py               # FastAPI initialization and middleware
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py           # Student & Admin authentication
│   │   │   ├── students.py       # Student profile & private registrations
│   │   │   ├── courses.py        # Public browsing & Admin course CRUD
│   │   │   ├── registrations.py  # Course registration & cancellation
│   │   │   └── admin.py          # Administrative rosters & statistics
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py       # Bcrypt password hashing & JWT handling
│   │   │   └── dependencies.py   # RBAC dependencies (get_current_user, etc.)
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py           # User model (student, admin)
│   │   │   ├── course.py         # Course model with capacity fields
│   │   │   └── registration.py   # Registration model with unique constraint
│   │   └── schemas/
│   │       ├── __init__.py
│   │       ├── user.py           # User & Auth schemas
│   │       ├── course.py         # Course schemas
│   │       ├── registration.py   # Registration schemas
│   │       └── admin.py          # Admin statistics schemas
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py           # In-memory SQLite fixtures & mock tokens
│   │   ├── test_auth.py          # Auth & validation tests
│   │   ├── test_courses.py       # Course CRUD & capacity tests
│   │   ├── test_registrations.py # Enrolment & duplicate prevention tests
│   │   └── test_admin.py         # Admin access & statistics tests
│   ├── seed.py                   # Secure database seeder
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React DOM entry
│   │   ├── App.jsx               # Application routing and view switcher
│   │   ├── index.css             # Cohesive modern styling
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth provider, token & session state
│   │   ├── services/
│   │   │   └── api.js            # Centralized API HTTP client
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with user avatar
│   │   │   ├── Footer.jsx        # Footer with links & architecture notes
│   │   │   ├── Alert.jsx         # Accessible alert component
│   │   │   ├── Modal.jsx         # Accessible modal dialog
│   │   │   └── CourseCard.jsx    # Card with real-time capacity progress
│   │   └── pages/
│   │       ├── LandingPage.jsx   # Marketing & system introduction
│   │       ├── LoginPage.jsx     # Login with quick demo buttons
│   │       ├── RegisterPage.jsx  # Student self-registration
│   │       ├── StudentDashboard.jsx # Student overview & enrolled credits
│   │       ├── CourseCatalogue.jsx  # Search, filter & course enrolment
│   │       ├── MyRegistrations.jsx  # Enrolment management & cancellation
│   │       └── AdminDashboard.jsx   # Administrative governance panel
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── .gitignore
├── pytest.ini
└── README.md
```

---

## Windows Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on Windows:
- **Python 3.11 or higher** (`python --version`)
- **Node.js 18+ and npm** (`node --version` and `npm --version`)
- **PowerShell** or **Command Prompt**

### 2. Backend Setup
Open PowerShell and navigate to the project root:
```powershell
cd "c:\Users\sandi\OneDrive\Desktop\Course API"

# 1. Create a Python virtual environment inside backend/
python -m venv backend\venv

# 2. Activate the virtual environment
backend\venv\Scripts\Activate.ps1

# 3. Upgrade pip and install all backend requirements
pip install -r backend\requirements.txt
```

### 3. Database Initialization & Seeding
Create your local environment file:
```powershell
Copy-Item backend\.env.example backend\.env
```

Run the database seeding script:
```powershell
backend\venv\Scripts\python backend\seed.py
```

This seeds:
- **Default Administrator**:
  - Email: `admin@university.edu`
  - Password: `AdminPass123!`
- **Sample Courses**: 10 courses across Computer Science, Mathematics, Data Science, Engineering, Software Engineering, and Cybersecurity.
- **Sample Students**:
  - `alex.chen@university.edu` (Password: `StudentPass123!`, ID: `STU2024001`)
  - `sarah.johnson@university.edu` (Password: `StudentPass123!`, ID: `STU2024002`)
  - `michael.brown@university.edu` (Password: `StudentPass123!`, ID: `STU2024003`)

### 4. Frontend Setup
In a separate terminal or the same terminal:
```powershell
cd frontend
npm install
Copy-Item .env.example .env
cd ..
```

---

## Running the Application

### Option A: Running Backend and Frontend on Windows

**Terminal 1 (Backend REST API):**
```powershell
cd "c:\Users\sandi\OneDrive\Desktop\Course API"
backend\venv\Scripts\uvicorn app.main:app --app-dir backend --reload --port 8000
```
*Backend API will run at:* `http://127.0.0.1:8000`  
*Interactive Swagger UI at:* `http://127.0.0.1:8000/docs`

**Terminal 2 (Frontend React App):**
```powershell
cd "c:\Users\sandi\OneDrive\Desktop\Course API\frontend"
npm run dev
```
*Frontend will run at:* `http://localhost:5173`

Open `http://localhost:5173` in your browser. You can click the **Demo Student** or **Demo Administrator** buttons on the Login page to immediately test both roles.

---

## Automated Testing Suite (pytest)

The test suite runs against an **isolated in-memory SQLite database** using `StaticPool`, guaranteeing zero pollution of development or production databases.

Run all tests:
```powershell
backend\venv\Scripts\pytest -v
```

### Test Coverage Highlights (30 Tests)
| Test Module | Coverage | Status |
| :--- | :--- | :--- |
| `test_auth.py` | Registration, duplicate email check, duplicate student number check, password validation, login, wrong password rejection, token generation | **8 Passed** |
| `test_courses.py` | Public catalogue browsing, search by keyword, filter by department, course detail by ID, 404 for invalid IDs, admin course creation, duplicate code rejection, non-admin forbidden check, course update, deletion constraints | **10 Passed** |
| `test_registrations.py` | Successful enrolment, seat deduction, duplicate enrolment rejection, full course rejection (capacity reached), self-service cancellation, seat release, unauthorized access rejection | **7 Passed** |
| `test_admin.py` | Admin student roster, admin registrations view, institutional statistics, capacity reduction constraint (cannot lower below enrolled count) | **5 Passed** |

---

## REST API Reference & Endpoints

### Authentication
- `POST /api/auth/register` - Register a new student account (returns JWT).
- `POST /api/auth/login` - Authenticate student or administrator (returns JWT).

### Students
- `POST /api/students` - Public or administrative student onboarding.
- `GET /api/students/me` - Get profile of authenticated user.
- `GET /api/students/me/registrations` - List all course registrations for the current student.

### Courses
- `GET /api/courses` - Browse all courses (supports `search`, `department`, `has_seats`).
- `GET /api/courses/{course_id}` - Retrieve details of a specific course.
- `POST /api/courses` - Create a new course (*Admin only*).
- `PUT /api/courses/{course_id}` - Update a course (*Admin only*).
- `DELETE /api/courses/{course_id}` - Delete a course (*Admin only, blocked if active enrolments exist*).

### Registrations
- `POST /api/registrations` - Register current student for a course (*Transactional capacity check*).
- `GET /api/registrations/me` - Get current student's registrations.
- `GET /api/registrations/{id}` - Get a specific registration (*Student owns it or Admin*).
- `PATCH /api/registrations/{id}/status` - Update registration status (*Student can cancel; Admin can set any permitted status*).
- `DELETE /api/registrations/{id}` - Cancel or drop registration.

### Administration
- `GET /api/admin/students` - List all registered students (*Admin only*).
- `GET /api/admin/registrations` - List all registrations across the university (*Admin only*).
- `GET /api/admin/statistics` - University-wide analytics, department breakdowns, and fill rates (*Admin only*).

---

## Swagger UI & Interactive API Documentation

When the backend is running, open:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI Schema JSON**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## Deployment Recommendations

1. **Production Database**: Replace SQLite with PostgreSQL by updating `DATABASE_URL` in `.env`:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/course_registration
   ```
2. **Containerization**:
   - Backend Dockerfile using `python:3.11-slim` with `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
   - Frontend multi-stage Dockerfile building with `npm run build` and serving with `nginx:alpine`.
3. **Environment Security**:
   - Generate a cryptographically secure `SECRET_KEY` using `python -c "import secrets; print(secrets.token_hex(32))"`.
   - Restrict `ALLOWED_ORIGINS` to your production frontend domain.

---

## Git & GitHub Upload Instructions

The repository has been configured with a clean `.gitignore` that omits virtual environments, databases, node modules, and credentials.

To push this repository to GitHub:

```powershell
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all tracked files
git add .

# 3. Commit the project
git commit -m "feat: complete Course Registration System with REST API, React frontend, and automated tests"

# 4. Create your repository on GitHub (via GitHub web interface or GitHub CLI)
# 5. Link and push to your remote repository:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/course-registration-system.git
git push -u origin main
```

---

## Author & Portfolio Details
- **Project**: Course Registration System
- **Focus**: Full-Stack Development, REST API Architecture, Concurrency Management, RBAC Security
- **License**: MIT
