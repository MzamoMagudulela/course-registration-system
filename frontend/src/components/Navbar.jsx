import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  LayoutDashboard, 
  ClipboardList, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div 
          className="navbar-brand"
          onClick={() => setActivePage('landing')}
          role="button"
          tabIndex={0}
        >
          <div className="brand-icon-wrapper">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Course Registration</span>
            <span className="brand-subtitle">Academic Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-links">
          <button 
            className={`nav-link ${activePage === 'landing' ? 'active' : ''}`}
            onClick={() => setActivePage('landing')}
          >
            Home
          </button>
          
          <button 
            className={`nav-link ${activePage === 'catalogue' ? 'active' : ''}`}
            onClick={() => setActivePage('catalogue')}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Courses
          </button>

          {isStudent && (
            <>
              <button 
                className={`nav-link ${activePage === 'student-dashboard' ? 'active' : ''}`}
                onClick={() => setActivePage('student-dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Dashboard
              </button>
              <button 
                className={`nav-link ${activePage === 'my-registrations' ? 'active' : ''}`}
                onClick={() => setActivePage('my-registrations')}
              >
                <ClipboardList className="w-4 h-4 mr-1.5" />
                My Registrations
              </button>
            </>
          )}

          {isAdmin && (
            <button 
              className={`nav-link admin-nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('admin-dashboard')}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* User / Auth Controls */}
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-info-chip">
                <div className="user-avatar">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">{user.full_name}</span>
                  <span className="user-role-badge">{user.role}</span>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="btn-logout"
                title="Log out of system"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <button 
                onClick={() => setActivePage('login')} 
                className={`btn-nav-login ${activePage === 'login' ? 'active' : ''}`}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </button>
              <button 
                onClick={() => setActivePage('register')} 
                className={`btn-nav-register ${activePage === 'register' ? 'active' : ''}`}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
