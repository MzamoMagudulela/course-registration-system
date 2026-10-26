import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { UserPlus, User, Mail, Hash, Key, CheckCircle } from 'lucide-react';

export default function RegisterPage({ setActivePage }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        student_number: studentNumber.trim().toUpperCase(),
        password,
      });
      setActivePage('student-dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please review your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="auth-title">Student Registration</h2>
          <p className="auth-subtitle">Create your academic account to enrol in university courses</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regEmail">University Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                id="regEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena.rostova@university.edu"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="studentNumber">Student ID / Number</label>
            <div className="input-with-icon">
              <Hash className="input-icon" />
              <input
                id="studentNumber"
                type="text"
                required
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="e.g. STU2024099"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="regPassword">Password</label>
              <div className="input-with-icon">
                <Key className="input-icon" />
                <input
                  id="regPassword"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <Key className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-submit"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              onClick={() => setActivePage('login')} 
              className="auth-link"
            >
              Sign In here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
