import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CourseCard from '../components/CourseCard';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Users, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CourseCatalogue({ setActivePage }) {
  const { user, isStudent, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch courses and student registrations
  const fetchCoursesData = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses({
        search: searchTerm,
        department: selectedDept,
        has_seats: onlyAvailable ? true : undefined,
      });
      setCourses(data);

      if (isStudent) {
        const regs = await api.getMyRegistrations();
        setMyRegistrations(regs);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesData();
  }, [searchTerm, selectedDept, onlyAvailable]);

  // Extract unique departments for dropdown filter
  const departments = Array.from(new Set(courses.map(c => c.department))).filter(Boolean).sort();

  // Check if a course is already registered by the student
  const isCourseEnrolled = (courseId) => {
    return myRegistrations.some(
      r => r.course_id === courseId && r.status === 'enrolled'
    );
  };

  const handleRegister = async (course) => {
    if (!isAuthenticated) {
      setActivePage('login');
      return;
    }

    if (!isStudent) {
      setAlert({
        type: 'warning',
        message: 'Only student accounts can enrol in courses. You are currently logged in with administrative privileges.',
      });
      return;
    }

    setRegistering(true);
    setAlert(null);

    try {
      await api.registerCourse(course.id);
      setAlert({
        type: 'success',
        message: `Successfully enrolled in ${course.code}: ${course.name}! Your seat is confirmed.`,
      });
      setSelectedCourse(null);
      // Refresh courses and registrations
      await fetchCoursesData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to register for course',
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="catalogue-container">
      {/* Catalogue Header */}
      <div className="catalogue-header">
        <div>
          <h1 className="catalogue-title">Academic Course Catalogue</h1>
          <p className="catalogue-subtitle">
            Explore university courses, review prerequisites and credit allocations, and reserve your seat.
          </p>
        </div>
        {isStudent && (
          <button 
            onClick={() => setActivePage('my-registrations')} 
            className="btn-outline-primary"
          >
            View My Registrations ({myRegistrations.filter(r => r.status === 'enrolled').length})
          </button>
        )}
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* Filter and Search Bar */}
      <div className="catalogue-filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course code, title, or department..."
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="select-wrapper">
            <Filter className="select-icon" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <label className="checkbox-toggle-label">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="checkbox-custom"
            />
            <span>Open Seats Only</span>
          </label>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading course catalogue...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state-box">
          <BookOpen className="empty-icon" />
          <h4>No courses matched your query</h4>
          <p>Try clearing your search filters or searching with a different keyword.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedDept(''); setOnlyAvailable(false); }}
            className="btn-outline-secondary mt-3"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={(c) => setSelectedCourse(c)}
              onRegister={handleRegister}
              isRegistered={isCourseEnrolled(course.id)}
              isStudent={isStudent}
            />
          ))}
        </div>
      )}

      {/* Course Detail Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse ? `${selectedCourse.code}: ${selectedCourse.name}` : ''}
        maxWidth="600px"
      >
        {selectedCourse && (
          <div className="course-modal-content">
            <div className="modal-badge-row">
              <span className="course-dept-badge">{selectedCourse.department}</span>
              <span className="course-credits-badge">
                <Award className="w-4 h-4 mr-1" />
                {selectedCourse.credits} Academic Credits
              </span>
            </div>

            <div className="modal-section">
              <h4 className="modal-section-title">Course Description</h4>
              <p className="modal-description-text">{selectedCourse.description}</p>
            </div>

            <div className="modal-section">
              <h4 className="modal-section-title">Academic Prerequisites</h4>
              <p className="modal-prereq-text">
                {selectedCourse.prerequisites || 'None (Open enrolment)'}
              </p>
            </div>

            <div className="modal-section">
              <h4 className="modal-section-title">Capacity & Enrolment</h4>
              <div className="modal-capacity-info">
                <div className="capacity-stat">
                  <span className="stat-label">Maximum Capacity</span>
                  <span className="stat-val">{selectedCourse.max_capacity} Students</span>
                </div>
                <div className="capacity-stat">
                  <span className="stat-label">Currently Enrolled</span>
                  <span className="stat-val">{selectedCourse.enrolled_count} Students</span>
                </div>
                <div className="capacity-stat">
                  <span className="stat-label">Available Seats</span>
                  <span className={`stat-val ${selectedCourse.is_full ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                    {selectedCourse.available_seats} remaining
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button 
                onClick={() => setSelectedCourse(null)} 
                className="btn-secondary"
              >
                Close
              </button>

              {isStudent && (
                isCourseEnrolled(selectedCourse.id) ? (
                  <button className="btn-enrolled" disabled>
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(selectedCourse)}
                    disabled={selectedCourse.is_full || registering}
                    className={`btn-primary ${selectedCourse.is_full ? 'btn-disabled' : ''}`}
                  >
                    {registering ? 'Processing...' : selectedCourse.is_full ? 'Course Full' : 'Confirm Registration'}
                  </button>
                )
              )}

              {!isAuthenticated && (
                <button 
                  onClick={() => setActivePage('login')} 
                  className="btn-primary"
                >
                  Sign In to Enrol
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
