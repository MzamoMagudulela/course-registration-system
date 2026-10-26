import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  ShieldCheck, 
  BookOpen, 
  Users, 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BarChart2, 
  CheckCircle, 
  AlertCircle,
  Award,
  Layers,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses'); // courses, students, registrations, stats
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Search & Filter
  const [courseSearch, setCourseSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('');

  // Course Form Modal (Add / Edit)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    code: '',
    name: '',
    description: '',
    department: '',
    credits: 3,
    prerequisites: '',
    max_capacity: 30,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Course Delete Modal
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, coursesData, studentsData, regsData] = await Promise.all([
        api.getAdminStatistics(),
        api.getCourses(),
        api.getAdminStudents(),
        api.getAdminRegistrations(),
      ]);
      setStats(statsData);
      setCourses(coursesData);
      setStudents(studentsData);
      setRegistrations(regsData);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch admin data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Open Create Course Modal
  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setCourseFormData({
      code: '',
      name: '',
      description: '',
      department: '',
      credits: 3,
      prerequisites: '',
      max_capacity: 30,
    });
    setIsCourseModalOpen(true);
  };

  // Open Edit Course Modal
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setCourseFormData({
      code: course.code,
      name: course.name,
      description: course.description,
      department: course.department,
      credits: course.credits,
      prerequisites: course.prerequisites || '',
      max_capacity: course.max_capacity,
    });
    setIsCourseModalOpen(true);
  };

  // Submit Course (Create or Update)
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setAlert(null);

    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, {
          code: courseFormData.code,
          name: courseFormData.name,
          description: courseFormData.description,
          department: courseFormData.department,
          credits: Number(courseFormData.credits),
          prerequisites: courseFormData.prerequisites,
          max_capacity: Number(courseFormData.max_capacity),
        });
        setAlert({ type: 'success', message: `Course ${courseFormData.code} updated successfully!` });
      } else {
        await api.createCourse({
          code: courseFormData.code,
          name: courseFormData.name,
          description: courseFormData.description,
          department: courseFormData.department,
          credits: Number(courseFormData.credits),
          prerequisites: courseFormData.prerequisites,
          max_capacity: Number(courseFormData.max_capacity),
        });
        setAlert({ type: 'success', message: `Course ${courseFormData.code} created successfully!` });
      }
      setIsCourseModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to save course' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Course
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeletingCourse(true);
    setAlert(null);

    try {
      await api.deleteCourse(courseToDelete.id);
      setAlert({ type: 'success', message: `Course ${courseToDelete.code} deleted successfully.` });
      setCourseToDelete(null);
      await loadAdminData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to delete course' });
    } finally {
      setDeletingCourse(false);
    }
  };

  // Update Registration Status
  const handleStatusChange = async (regId, newStatus) => {
    try {
      await api.updateRegistrationStatus(regId, newStatus);
      setAlert({ type: 'success', message: `Registration status updated to "${newStatus}".` });
      await loadAdminData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update registration status' });
    }
  };

  // Filtered lists
  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.department.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.student_number && s.student_number.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const filteredRegistrations = registrations.filter(r => {
    if (!regStatusFilter) return true;
    return r.status === regStatusFilter;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <div className="admin-badge-top">
            <ShieldCheck className="w-4 h-4 mr-1 text-indigo-600" />
            Institutional Administration Panel
          </div>
          <h1 className="admin-title">Academic Governance & Course Operations</h1>
          <p className="admin-subtitle">
            Manage course catalogues, student rosters, registrations, and capacity distribution.
          </p>
        </div>
        <div className="admin-header-actions">
          <button onClick={loadAdminData} className="btn-secondary" title="Refresh all datasets">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary">
            <Plus className="w-4 h-4 mr-1.5" /> Add New Course
          </button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Metrics Banner */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box bg-blue-50 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="metric-data">
              <span className="metric-number">{stats.total_students}</span>
              <span className="metric-label">Registered Students</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box bg-indigo-50 text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="metric-data">
              <span className="metric-number">{stats.total_courses}</span>
              <span className="metric-label">Active Courses</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="metric-data">
              <span className="metric-number">{stats.active_enrolments}</span>
              <span className="metric-label">Active Enrolments</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box bg-amber-50 text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="metric-data">
              <span className="metric-number">{stats.courses_at_capacity}</span>
              <span className="metric-label">Full Courses</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav">
        <button 
          className={`admin-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen className="w-4 h-4 mr-1.5" />
          Courses ({courses.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users className="w-4 h-4 mr-1.5" />
          Students ({students.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <ClipboardList className="w-4 h-4 mr-1.5" />
          Registrations ({registrations.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart2 className="w-4 h-4 mr-1.5" />
          Statistics & Capacity
        </button>
      </div>

      {/* TAB 1: Courses Management */}
      {activeTab === 'courses' && (
        <div className="admin-content-box">
          <div className="box-filter-bar">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search courses by code, title, or department..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={handleOpenCreateModal} className="btn-primary">
              <Plus className="w-4 h-4 mr-1" /> Add Course
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Capacity</th>
                  <th>Enrolled</th>
                  <th>Fill %</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => {
                  const fillPct = Math.round((c.enrolled_count / c.max_capacity) * 100);
                  return (
                    <tr key={c.id}>
                      <td><span className="code-pill">{c.code}</span></td>
                      <td className="font-semibold text-slate-800">{c.name}</td>
                      <td>{c.department}</td>
                      <td>{c.credits}</td>
                      <td>{c.max_capacity}</td>
                      <td>
                        <span className={c.is_full ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {c.enrolled_count}
                        </span>
                      </td>
                      <td>
                        <div className="fill-bar-wrapper">
                          <div className="fill-bar-track">
                            <div 
                              className={`fill-bar-value ${fillPct >= 100 ? 'bg-rose-500' : fillPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, fillPct)}%` }} 
                            />
                          </div>
                          <span className="fill-bar-text">{fillPct}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons-inline">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="btn-action-edit"
                            title="Edit Course Details"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => setCourseToDelete(c)}
                            className="btn-action-cancel"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Students Roster */}
      {activeTab === 'students' && (
        <div className="admin-content-box">
          <div className="box-filter-bar">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search students by name, email, or student ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td><span className="code-pill">{s.student_number || 'N/A'}</span></td>
                    <td className="font-semibold text-slate-800">{s.full_name}</td>
                    <td>{s.email}</td>
                    <td><span className="status-pill status-enrolled">{s.role}</span></td>
                    <td className="text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Registrations Management */}
      {activeTab === 'registrations' && (
        <div className="admin-content-box">
          <div className="box-filter-bar">
            <div className="select-wrapper">
              <Filter className="select-icon" />
              <select
                value={regStatusFilter}
                onChange={(e) => setRegStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="enrolled">Enrolled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <div>
                        <strong>{r.student?.full_name}</strong>
                        <div className="text-xs text-slate-500">{r.student?.student_number} &bull; {r.student?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="course-table-cell">
                        <span className="code-pill">{r.course?.code}</span>
                        <span>{r.course?.name}</span>
                      </div>
                    </td>
                    <td>{r.course?.department}</td>
                    <td className="text-slate-500">{new Date(r.registered_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill status-${r.status}`}>{r.status}</span>
                    </td>
                    <td>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className="status-dropdown"
                      >
                        <option value="enrolled">Enrolled</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Statistics & Analytics */}
      {activeTab === 'stats' && stats && (
        <div className="admin-content-box">
          <h3 className="card-heading mb-3">Department Enrolment Breakdown</h3>
          <div className="table-responsive mb-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Courses Offered</th>
                  <th>Total Active Enrolments</th>
                </tr>
              </thead>
              <tbody>
                {stats.department_stats.map((dept) => (
                  <tr key={dept.department}>
                    <td className="font-semibold text-slate-800">{dept.department}</td>
                    <td>{dept.course_count} courses</td>
                    <td>
                      <span className="text-indigo-600 font-bold">{dept.total_enrolled}</span> students
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="card-heading mb-3">Course Capacity Utilisation</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Enrolled / Capacity</th>
                  <th>Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.course_stats.map((cs) => (
                  <tr key={cs.course_id}>
                    <td><span className="code-pill">{cs.code}</span></td>
                    <td>{cs.name}</td>
                    <td>{cs.department}</td>
                    <td>{cs.enrolled_count} / {cs.max_capacity}</td>
                    <td>
                      <div className="fill-bar-wrapper">
                        <div className="fill-bar-track">
                          <div 
                            className={`fill-bar-value ${cs.fill_rate_percent >= 100 ? 'bg-rose-500' : cs.fill_rate_percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, cs.fill_rate_percent)}%` }} 
                          />
                        </div>
                        <span className="fill-bar-text">{cs.fill_rate_percent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingCourse ? `Edit Course ${editingCourse.code}` : 'Add New Academic Course'}
        maxWidth="600px"
      >
        <form onSubmit={handleCourseSubmit} className="course-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="code">Course Code</label>
              <input
                id="code"
                type="text"
                required
                value={courseFormData.code}
                onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                placeholder="e.g. CS101"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Course Title</label>
              <input
                id="name"
                type="text"
                required
                value={courseFormData.name}
                onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                placeholder="e.g. Introduction to Programming"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                required
                value={courseFormData.department}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                placeholder="e.g. Computer Science"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="credits">Academic Credits</label>
              <input
                id="credits"
                type="number"
                min="1"
                max="12"
                required
                value={courseFormData.credits}
                onChange={(e) => setCourseFormData({ ...courseFormData, credits: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="max_capacity">Maximum Student Capacity</label>
            <input
              id="max_capacity"
              type="number"
              min="1"
              max="500"
              required
              value={courseFormData.max_capacity}
              onChange={(e) => setCourseFormData({ ...courseFormData, max_capacity: e.target.value })}
              className="form-input"
            />
            {editingCourse && (
              <p className="text-xs text-slate-500 mt-1">
                Currently enrolled: {editingCourse.enrolled_count} students. Capacity cannot be reduced below this number.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prerequisites">Prerequisites</label>
            <input
              id="prerequisites"
              type="text"
              value={courseFormData.prerequisites}
              onChange={(e) => setCourseFormData({ ...courseFormData, prerequisites: e.target.value })}
              placeholder="e.g. None or CS101, MATH101"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Course Description</label>
            <textarea
              id="description"
              rows="4"
              required
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              placeholder="Provide a comprehensive summary of syllabus topics, learning objectives, and scope..."
              className="form-textarea"
            />
          </div>

          <div className="modal-actions-row">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="btn-secondary"
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? 'Saving Course...' : editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        title="Confirm Course Deletion"
        maxWidth="480px"
      >
        {courseToDelete && (
          <div className="cancel-modal-content">
            <div className="warning-dialog-header">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <div>
                <h4 className="warning-dialog-title">Delete {courseToDelete.code}?</h4>
                <p className="warning-dialog-desc">
                  Are you sure you want to permanently delete <strong>{courseToDelete.name}</strong>?
                </p>
              </div>
            </div>

            {courseToDelete.enrolled_count > 0 ? (
              <div className="alert-box alert-error mt-3">
                <AlertCircle className="w-4 h-4 mr-1 text-rose-600" />
                <span>
                  <strong>Deletion Blocked:</strong> This course has {courseToDelete.enrolled_count} active student enrolments.
                  You must cancel or reassign all enrolments before removing this course.
                </span>
              </div>
            ) : (
              <p className="cancel-note">
                This course currently has 0 active enrolments and can safely be deleted.
              </p>
            )}

            <div className="modal-actions-row">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="btn-secondary"
                disabled={deletingCourse}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-danger"
                disabled={deletingCourse || courseToDelete.enrolled_count > 0}
              >
                {deletingCourse ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
