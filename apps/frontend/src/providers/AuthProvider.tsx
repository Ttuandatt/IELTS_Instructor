'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import apiClient from '@/lib/api-client';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: 'learner' | 'instructor' | 'admin';
  language: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<AuthUser, 'display_name' | 'language' | 'theme'>>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const saveTokens = (access_token: string, refresh_token: string) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
  };

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Fetch current user profile
  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await apiClient.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    saveTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, display_name: string) => {
      const { data } = await apiClient.post('/auth/register', {
        email,
        password,
        display_name,
      });
      saveTokens(data.access_token, data.refresh_token);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    globalThis.location.href = '/login';
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<AuthUser, 'display_name' | 'language' | 'theme'>>) => {
      const { data } = await apiClient.patch('/auth/me', updates);
      setUser(data);
    },
    [],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, refreshUser }),
    [user, loading, login, register, logout, updateProfile, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
