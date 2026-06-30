import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  signOut as apiSignOut,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* On mount, try to restore the current user from the backend */
  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((u) => {
        if (!cancelled) {
          setUser(u || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    /* data includes user info from the backend */
    setUser(data ?? null);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    setUser(data ?? null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (fields) => {
    const updated = await apiUpdateProfile(fields);
    setUser(updated ?? null);
    return updated;
  }, []);

  const value = { user, loading, login, register, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
