import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalogue from './pages/CourseCatalogue';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { user, isAuthenticated, isAdmin, isStudent, loading } = useAuth();
  const [activePage, setActivePage] = useState('landing');

  // Scroll to top when activePage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Route protection
  useEffect(() => {
    if (!loading) {
      if ((activePage === 'student-dashboard' || activePage === 'my-registrations') && !isAuthenticated) {
        setActivePage('login');
      }
      if (activePage === 'admin-dashboard' && (!isAuthenticated || !isAdmin)) {
        setActivePage('login');
      }
      if ((activePage === 'login' || activePage === 'register') && isAuthenticated) {
        setActivePage(isAdmin ? 'admin-dashboard' : 'student-dashboard');
      }
    }
  }, [activePage, isAuthenticated, isAdmin, isStudent, loading]);

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner" />
        <p>Initializing Course Registration System...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        {activePage === 'landing' && (
          <LandingPage 
            setActivePage={setActivePage} 
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isStudent={isStudent}
          />
        )}
        {activePage === 'catalogue' && (
          <CourseCatalogue setActivePage={setActivePage} />
        )}
        {activePage === 'login' && (
          <LoginPage setActivePage={setActivePage} />
        )}
        {activePage === 'register' && (
          <RegisterPage setActivePage={setActivePage} />
        )}
        {activePage === 'student-dashboard' && isAuthenticated && isStudent && (
          <StudentDashboard setActivePage={setActivePage} />
        )}
        {activePage === 'my-registrations' && isAuthenticated && isStudent && (
          <MyRegistrations setActivePage={setActivePage} />
        )}
        {activePage === 'admin-dashboard' && isAuthenticated && isAdmin && (
          <AdminDashboard />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
