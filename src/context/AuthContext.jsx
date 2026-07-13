import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('skyxing_token');
    if (token) {
      console.log('[Auth] Token found, verifying...');
      api.setToken(token);
      api.getMe()
        .then(data => {
          console.log('[Auth] User verified:', data.user?.displayName);
          setUser(data.user);
        })
        .catch((err) => {
          console.warn('[Auth] Token verification failed:', err.message);
          api.setToken(null);
          setUser(null);
        })
        .finally(() => {
          console.log('[Auth] Auth check completed');
          setLoading(false);
        });
    } else {
      console.log('[Auth] No token, user is guest');
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.login({ username, password });
    api.setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await api.register(userData);
    api.setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return;
    const data = await api.updateUser(user.id, updates);
    setUser(data.user);
    return data;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContext');
  }
  return context;
}
