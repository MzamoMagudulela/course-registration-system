import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('crs_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('crs_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const profile = await api.getMyProfile();
          setUser(profile);
          localStorage.setItem('crs_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.login({ email, password });
    localStorage.setItem('crs_token', response.access_token);
    localStorage.setItem('crs_user', JSON.stringify(response.user));
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  };

  const register = async (studentData) => {
    const response = await api.register(studentData);
    localStorage.setItem('crs_token', response.access_token);
    localStorage.setItem('crs_user', JSON.stringify(response.user));
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('crs_token');
    localStorage.removeItem('crs_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
