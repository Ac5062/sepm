import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getErrorMessage, type ApiUser } from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);

  // ── Restore session on page load ────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));

      // Silently verify token is still valid
      authApi.getMe()
        .then(freshUser => {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token expired or invalid — clear session
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        });
    }
  }, []);

  // ── Login ───────────────────────────────────────────────
  // Throws with the real API error message on failure so pages can display it
  const login = async (email: string, password: string): Promise<boolean> => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return true;
  };

  // ── Register ────────────────────────────────────────────
  // Throws with the real API error message on failure so pages can display it
  const register = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<boolean> => {
    const data = await authApi.register({ email, password, name, phone });
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return true;
  };

  // ── Logout ──────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
