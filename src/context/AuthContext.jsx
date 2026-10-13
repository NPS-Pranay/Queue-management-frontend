import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginApi, registerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('queue_app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('queue_app_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('queue_app_user');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginApi(credentials);
      if (response.status === 'SUCCESS') {
        const userData = {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        };
        setUser(userData);
        setLoading(false);
        return { success: true, user: userData };
      } else {
        setError(response.message || 'Login failed');
        setLoading(false);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error during login';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerApi(userData);
      if (response.status === 'SUCCESS') {
        const newUserData = {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        };
        setUser(newUserData);
        setLoading(false);
        return { success: true, user: newUserData };
      } else {
        setError(response.message || 'Registration failed');
        setLoading(false);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error during registration';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('queue_app_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
