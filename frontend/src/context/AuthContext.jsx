import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get('/accounts/me/');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error("Session sync failed", err);
      // Don't logout immediately on me/ failure if it might be temporary
      // But if it's 401, the interceptor will handle it
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/accounts/login/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      await loadUser();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.detail || "Invalid credentials" 
      };
    }
  };

  const signup = async (username, password, extra = {}) => {
    try {
      await api.post('/accounts/signup/', { username, password, ...extra });
      return await login(username, password);
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.username?.[0] || "Registration failed" 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
