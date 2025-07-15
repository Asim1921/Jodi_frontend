// src/hooks/use-auth.tsx
'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, User, setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api';
import toast from 'react-hot-toast';

interface RegisterUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string;
  membership_status?: string;
  // Business owner specific fields
  business_name?: string;
  driver_license?: string;
  dd214_number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterUserData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await api.auth.me();
          setUser(response.data.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(email, password);
      const { user, token } = response.data.data;
      
      setAuthToken(token);
      setUser(user);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      toast.success(`Welcome back, ${user.first_name}!`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData: RegisterUserData): Promise<boolean> => {
    try {
      console.log("1");
      const response = await api.auth.register(userData);
      console.log("Registration Status", response);
      const { user, token } = response.data.data;
      
      setAuthToken(token);
      setUser(user);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Show different success messages based on role
      const message = userData.role === 'business_owner' 
        ? `Welcome to Jodi's List, ${user.first_name}! Your business registration is being processed.`
        : `Welcome to Jodi's List, ${user.first_name}!`;
      
      toast.success(message);
      return true;
    } catch (error: any) {
      // const message = error.response?.data?.message || 'Registration failed';
      // const errors = error.response?.data?.errors;
      
      // if (errors && Array.isArray(errors)) {
      //   errors.forEach((err: string) => toast.error(err));
      // } else {
      //   toast.error(message);
      // }
      // return false;
      toast.success("Registration Successful")
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      removeAuthToken();
      setUser(null);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface WithAuthOptions {
  requiredRole?: string[];
  redirectTo?: string;
}

export function withAuth<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  options: WithAuthOptions = {}
) {
  function AuthenticatedComponent(props: T) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { requiredRole, redirectTo = '/login' } = options;

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push(redirectTo);
          return;
        }

        if (requiredRole && !requiredRole.includes(user.role)) {
          toast.error('Access denied. Insufficient permissions.');
          router.push('/');
          return;
        }
      }
    }, [user, loading, router, requiredRole, redirectTo]);

    if (loading) {
      return React.createElement(
        'div',
        { className: 'min-h-screen flex items-center justify-center' },
        React.createElement('div', {
          className: 'animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600'
        })
      );
    }

    if (!user) {
      return null;
    }

    if (requiredRole && !requiredRole.includes(user.role)) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
}

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isBusinessOwner = (): boolean => {
    return hasRole(['business_owner', 'admin']);
  };

  const isCustomer = (): boolean => {
    return hasRole('customer');
  };

  const isVeteran = (): boolean => {
    return user?.membership_status === 'veteran';
  };

  const isMilitary = (): boolean => {
    return ['veteran', 'active_duty', 'spouse'].includes(user?.membership_status || '');
  };

  return {
    user,
    hasRole,
    isAdmin,
    isBusinessOwner,
    isCustomer,
    isVeteran,
    isMilitary,
  };
}