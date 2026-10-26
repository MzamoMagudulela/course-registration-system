import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Alert from '../components/Alert';
import { 
  BookOpen, 
  Award, 
  ClipboardCheck, 
  ArrowRight, 
  Calendar, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function StudentDashboard({ setActivePage }) {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const regs = await api.getMyRegistrations();
        setRegistrations(regs);
      } catch (err) {
        setError(err.message || 'Failed to load your course registrations');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeRegistrations = registrations.filter(r => r.status === 'enrolled');
  const totalCredits = activeRegistrations.reduce((sum, r) => sum + (r.course?.credits || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Student Profile Banner */}
      <div className="dashboard-banner">
        <div className="banner-details">
          <div className="banner-greeting">
            <span className="badge-academic">Enrolled Student</span>
            <h1 className="banner-title">Welcome back, {user?.full_name}!</h1>
            <p className="banner-subtitle">
              Student ID: <strong>{user?.student_number}</strong> &bull; {user?.email}
            </p>
          </div>
        </div>

        <div className="banner-actions">
          <button 
            onClick={() => setActivePage('catalogue')} 
            className="btn-banner-action"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Explore Courses
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="metric-data">
            <span className="metric-number">{activeRegistrations.length}</span>
            <span className="metric-label">Active Courses</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div className="metric-data">
            <span className="metric-number">{totalCredits}</span>
            <span className="metric-label">Enrolled Credits</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue-50 text-blue-600">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div className="metric-data">
            <span className="metric-number">{registrations.length}</span>
            <span className="metric-label">Lifetime Registrations</span>
          </div>
        </div>
      </div>

      {/* Current Registrations Overview */}
      <div className="dashboard-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-heading">My Current Courses</h3>
            <p className="card-subheading">Courses you are currently registered for this academic term</p>
          </div>
          <button 
            onClick={() => setActivePage('my-registrations')} 
            className="btn-text-link"
          >
            Manage All Registrations <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading your registrations...</div>
        ) : activeRegistrations.length === 0 ? (
          <div className="empty-state-box">
            <BookOpen className="empty-icon" />
            <h4>No courses registered yet</h4>
            <p>You haven't enrolled in any courses for this term. Browse the available courses to get started.</p>
            <button 
              onClick={() => setActivePage('catalogue')} 
              className="btn-primary mt-3"
            >
              Browse Course Catalogue
            </button>
          </div>
        ) : (
          <div className="registrations-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Registered On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <span className="code-pill">{reg.course?.code}</span>
                    </td>
                    <td className="font-semibold text-slate-800">{reg.course?.name}</td>
                    <td>{reg.course?.department}</td>
                    <td>{reg.course?.credits} Credits</td>
                    <td className="text-slate-500">
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-pill status-${reg.status}`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
