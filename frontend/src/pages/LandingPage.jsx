import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Layers, 
  Lock, 
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function LandingPage({ setActivePage, isAuthenticated, isAdmin, isStudent }) {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles className="w-4 h-4 text-indigo-500 mr-2" />
            Full-Stack RESTful Academic Registration Engine
          </div>

          <h1 className="hero-title">
            Modern, Secure & Real-Time <br />
            <span className="text-gradient">Course Registration System</span>
          </h1>

          <p className="hero-description">
            A complete academic course management solution engineered for institutional reliability.
            Featuring transactional seat allocation, automated conflict prevention, student self-service,
            and an administrative governance dashboard.
          </p>

          <div className="hero-cta-group">
            <button 
              onClick={() => setActivePage('catalogue')} 
              className="btn-hero-primary"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Course Catalogue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            {!isAuthenticated ? (
              <button 
                onClick={() => setActivePage('login')} 
                className="btn-hero-secondary"
              >
                Sign In to Portal
              </button>
            ) : isStudent ? (
              <button 
                onClick={() => setActivePage('student-dashboard')} 
                className="btn-hero-secondary"
              >
                Go to My Dashboard
              </button>
            ) : (
              <button 
                onClick={() => setActivePage('admin-dashboard')} 
                className="btn-hero-secondary"
              >
                Open Admin Portal
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Architected for Academic Excellence</h2>
          <p className="section-subtitle">
            Engineered with strict data integrity, role-based security, and zero over-enrolment guarantees.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-indigo-50 text-indigo-600">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="feature-title">Transactional Concurrency</h3>
            <p className="feature-desc">
              Course capacity limits are enforced at the database level with ACID transaction checks,
              preventing over-subscription even under simultaneous registration requests.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="feature-title">Zero Duplicate Registrations</h3>
            <p className="feature-desc">
              Multi-tiered validation checks ensure students cannot duplicate registrations, while maintaining
              full audit logs if registrations are cancelled or modified.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-blue-50 text-blue-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="feature-title">Role-Based Access Control</h3>
            <p className="feature-desc">
              Stateless JWT authentication combined with salted bcrypt password hashing guarantees secure
              isolation between students and administrative operations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-purple-50 text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="feature-title">Real-Time Administrative Analytics</h3>
            <p className="feature-desc">
              Institutional administrators can inspect live fill rates, monitor student enrolments across departments,
              and adjust capacities with automated guardrails.
            </p>
          </div>
        </div>
      </section>

      {/* User Portals Section */}
      <section className="portals-section">
        <div className="portal-card student-portal-card">
          <div className="portal-content">
            <div className="portal-badge">Student Portal</div>
            <h3 className="portal-title">Students & Learners</h3>
            <ul className="portal-feature-list">
              <li>Search and filter courses by code, name, and department</li>
              <li>Live available seat count with instant validation</li>
              <li>One-click course registration and seat confirmation</li>
              <li>Manage registrations and cancel when plans change</li>
            </ul>
            <button 
              onClick={() => setActivePage(isAuthenticated ? 'student-dashboard' : 'register')}
              className="btn-portal-student"
            >
              {isAuthenticated ? 'View Dashboard' : 'Create Student Account'}
            </button>
          </div>
        </div>

        <div className="portal-card admin-portal-card">
          <div className="portal-content">
            <div className="portal-badge admin-badge">Administration</div>
            <h3 className="portal-title">Academic Registrars</h3>
            <ul className="portal-feature-list">
              <li>Create, edit, view, and retire course offerings</li>
              <li>Inspect complete student roster and enrolment logs</li>
              <li>Update registration status (approve, reject, cancel)</li>
              <li>Live department breakdowns and capacity metrics</li>
            </ul>
            <button 
              onClick={() => setActivePage(isAuthenticated && isAdmin ? 'admin-dashboard' : 'login')}
              className="btn-portal-admin"
            >
              {isAuthenticated && isAdmin ? 'Go to Admin Dashboard' : 'Admin Login'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
