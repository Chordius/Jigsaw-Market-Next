'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

interface User {
  id: string;
  central_user_id: string;
  username: string;
  email: string;
  balance?: number;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshBalance: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const { data } = await apiClient.get('/auth/session');
      if (data.success && data.payload?.user) {
        const userProfileRes = await apiClient.get(`/users/${data.payload.user.id}`);
        if (userProfileRes.data.success) {
          setUser({ ...data.payload.user, ...userProfileRes.data.payload });
        } else {
          setUser(data.payload.user);
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    try {
      const userProfileRes = await apiClient.get(`/users/${userData.id}`);
      if (userProfileRes.data.success) {
        setUser({ ...userData, ...userProfileRes.data.payload });
      }
    } catch (e) {
      console.error("Failed to fetch balance on login", e);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  const refreshBalance = async () => {
    if (!user) return;
    try {
      const userProfileRes = await apiClient.get(`/users/${user.id}`);
      if (userProfileRes.data.success) {
        setUser((prev) => prev ? { ...prev, balance: userProfileRes.data.payload.balance } : null);
      }
    } catch (e) {
      console.error("Failed to refresh balance", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
