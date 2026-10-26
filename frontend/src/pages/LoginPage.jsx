import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { LogIn, Key, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        setActivePage('admin-dashboard');
      } else {
        setActivePage('student-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail('alex.chen@university.edu');
    setPassword('StudentPass123!');
    setError('');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@university.edu');
    setPassword('AdminPass123!');
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your course registration portal</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Key className="input-icon" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-submit"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Login Credentials */}
        <div className="demo-credentials-box">
          <div className="demo-header">
            <Sparkles className="w-4 h-4 text-indigo-500 mr-1" />
            <span>Quick Demo Credentials</span>
          </div>
          <p className="demo-hint">Click below to auto-fill seeded accounts:</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              onClick={fillDemoStudent} 
              className="btn-demo-student"
            >
              Demo Student (Alex Chen)
            </button>
            <button 
              type="button" 
              onClick={fillDemoAdmin} 
              className="btn-demo-admin"
            >
              Demo Administrator
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <button 
              onClick={() => setActivePage('register')} 
              className="auth-link"
            >
              Register as Student
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
