'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { validateDemoCredentials, getDemoUserById, demoData } from '@/lib/mockData';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  enterDemoMode: (role: UserRole) => void;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/landing', '/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isDemoMode: false,
  });
  
  const router = useRouter();
  const pathname = usePathname();

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('demoUser');
    const isDemo = localStorage.getItem('isDemoMode') === 'true';
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: isDemo,
        });
      } catch {
        localStorage.removeItem('demoUser');
        localStorage.removeItem('isDemoMode');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Handle route protection
  useEffect(() => {
    if (state.isLoading) return;
    
    const isPublicPath = PUBLIC_PATHS.some(path => pathname?.startsWith(path));
    
    if (!state.isAuthenticated && !isPublicPath && pathname !== '/') {
      router.push('/login');
    }
    
    if (state.isAuthenticated && (pathname === '/login' || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = validateDemoCredentials(email, password);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    const isDemo = Object.values({
      admin: { email: 'demo@admin.com' },
      agent: { email: 'demo@agent.com' },
      tenant: { email: 'demo@tenant.com' },
    }).some(cred => cred.email.toLowerCase() === email.toLowerCase());
    
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      isDemoMode: isDemo,
    });
    
    localStorage.setItem('demoUser', JSON.stringify(user));
    localStorage.setItem('isDemoMode', String(isDemo));
    
    return { success: true };
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isDemoMode: false,
    });
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');
    router.push('/login');
  };

  const enterDemoMode = (role: UserRole) => {
    let email: string;
    switch (role) {
      case 'admin':
        email = 'demo@admin.com';
        break;
      case 'agent':
        email = 'demo@agent.com';
        break;
      case 'tenant':
        email = 'demo@tenant.com';
        break;
      default:
        email = 'demo@admin.com';
    }
    
    login(email, 'demo123');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    if (!state.user) return false;
    return allowedRoles.includes(state.user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        enterDemoMode,
        hasRole,
        canAccess,
      }}
    >
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

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const auth = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login');
    }
    
    if (!auth.isLoading && auth.isAuthenticated && allowedRoles && !auth.canAccess(allowedRoles)) {
      router.push('/dashboard');
    }
  }, [auth.isLoading, auth.isAuthenticated, allowedRoles, auth, router]);
  
  return auth;
}
