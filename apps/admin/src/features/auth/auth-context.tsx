'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminUser, AdminRole } from '../../types';
import { authApiService } from '../../services/auth.service';

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: AdminRole | AdminRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Hydrate admin session from storage
    const initAuth = async () => {
      try {
        const storedAdmin = localStorage.getItem('admin_user');
        const token = localStorage.getItem('admin_access_token');

        if (storedAdmin && token) {
          setAdmin(JSON.parse(storedAdmin));
          // Verify session in background
          try {
            const profile = await authApiService.getProfile();
            setAdmin(profile);
            localStorage.setItem('admin_user', JSON.stringify(profile));
          } catch {
            // Interceptor handles refresh or redirection
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApiService.login(email, password);
      setAdmin(data.admin);
      localStorage.setItem('admin_access_token', data.tokens.accessToken);
      localStorage.setItem('admin_refresh_token', data.tokens.refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApiService.logout();
      setAdmin(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    if (admin.role === 'SUPER_ADMIN') return true;
    return admin.permissions?.includes(permission) || false;
  };

  const hasRole = (roles: AdminRole | AdminRole[]): boolean => {
    if (!admin) return false;
    if (admin.role === 'SUPER_ADMIN') return true;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(admin.role);
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
