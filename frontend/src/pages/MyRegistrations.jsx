import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  ClipboardList, 
  BookOpen, 
  Calendar, 
  Award, 
  Trash2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function MyRegistrations({ setActivePage }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Cancel modal state
  const [regToCancel, setRegToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch registrations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirmCancel = async () => {
    if (!regToCancel) return;
    setCancelling(true);
    setAlert(null);

    try {
      await api.cancelRegistration(regToCancel.id);
      setAlert({
        type: 'success',
        message: `Successfully cancelled registration for ${regToCancel.course?.code}. The seat has been released.`,
      });
      setRegToCancel(null);
      await fetchRegistrations();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to cancel registration',
      });
    } finally {
      setCancelling(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeFilter === 'all') return true;
    return reg.status === activeFilter;
  });

  return (
    <div className="registrations-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Course Registrations</h1>
          <p className="page-subtitle">
            Review your academic schedule, verify your enrolment statuses, and drop courses when needed.
          </p>
        </div>
        <button 
          onClick={() => setActivePage('catalogue')} 
          className="btn-primary"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Register for More Courses
        </button>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* Status Filter Tabs */}
      <div className="filter-tabs-row">
        <button 
          className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Records ({registrations.length})
        </button>
        <button 
          className={`tab-btn ${activeFilter === 'enrolled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('enrolled')}
        >
          Active Enrolments ({registrations.filter(r => r.status === 'enrolled').length})
        </button>
        <button 
          className={`tab-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          Cancelled ({registrations.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your registration records...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="empty-state-box">
          <ClipboardList className="empty-icon" />
          <h4>No registration records found</h4>
          <p>You have no registrations matching the selected status filter.</p>
          <button 
            onClick={() => setActivePage('catalogue')} 
            className="btn-outline-primary mt-3"
          >
            Explore Course Catalogue <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      ) : (
        <div className="registrations-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div className="course-table-cell">
                        <span className="code-pill">{reg.course?.code}</span>
                        <span className="course-name-cell">{reg.course?.name}</span>
                      </div>
                    </td>
                    <td>{reg.course?.department}</td>
                    <td>
                      <span className="credits-text">
                        <Award className="w-3.5 h-3.5 inline mr-1 text-indigo-500" />
                        {reg.course?.credits} Credits
                      </span>
                    </td>
                    <td className="text-slate-500">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`status-pill status-${reg.status}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td>
                      {reg.status === 'enrolled' ? (
                        <button
                          onClick={() => setRegToCancel(reg)}
                          className="btn-action-cancel"
                          title="Drop or cancel registration"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={!!regToCancel}
        onClose={() => setRegToCancel(null)}
        title="Confirm Course Cancellation"
        maxWidth="480px"
      >
        {regToCancel && (
          <div className="cancel-modal-content">
            <div className="warning-dialog-header">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div>
                <h4 className="warning-dialog-title">
                  Drop {regToCancel.course?.code}?
                </h4>
                <p className="warning-dialog-desc">
                  Are you sure you want to cancel your enrolment in{' '}
                  <strong>{regToCancel.course?.name}</strong>?
                </p>
              </div>
            </div>

            <p className="cancel-note">
              This action will release your reserved seat to other students. You can re-register later only if seats remain available.
            </p>

            <div className="modal-actions-row">
              <button
                onClick={() => setRegToCancel(null)}
                className="btn-secondary"
                disabled={cancelling}
              >
                Keep Enrolment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="btn-danger"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Drop Course'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
