'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole, AuthState } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { validateDemoCredentials, DEMO_CREDENTIALS } from '@/lib/mockData';

interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterDemoMode: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  isSupabaseAuth: boolean;
  currentCompany: CompanyInfo | null;
  userCompanies: CompanyInfo[];
  switchCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/auth/callback', '/signup', '/signup/company', '/'];

const DEMO_COMPANY: CompanyInfo = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Demo Company',
  slug: 'default',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState & { isSupabaseAuth: boolean }>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isDemoMode: false,
    isSupabaseAuth: false,
  });

  const [currentCompany, setCurrentCompany] = useState<CompanyInfo | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyInfo[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const storedDemoUser = localStorage.getItem('demoUser');
      const isDemo = localStorage.getItem('isDemoMode') === 'true';

      if (storedDemoUser && isDemo) {
        const user = JSON.parse(storedDemoUser);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: true,
          isSupabaseAuth: false,
        });
        setCurrentCompany(DEMO_COMPANY);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Route protection
  useEffect(() => {
    if (state.isLoading) return;
    if (pathname === '/') return;

    const isPublicPath = PUBLIC_PATHS.some(
      path => pathname === path || pathname?.startsWith(path + '/')
    );

    if (!state.isAuthenticated && !isPublicPath) {
      router.push('/login');
    }

    if (state.isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const demoUser = validateDemoCredentials(email, password);

    if (demoUser) {
      const isDemo = Object.values(DEMO_CREDENTIALS).some(
        (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
      );

      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('isDemoMode', String(isDemo));

      setState({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: isDemo,
        isSupabaseAuth: false,
      });
      setCurrentCompany(DEMO_COMPANY);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password. Use the demo accounts to access the platform.' };
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isDemoMode: false,
      isSupabaseAuth: false,
    });
    setCurrentCompany(null);
    setUserCompanies([]);

    router.push('/login');
  };

  const enterDemoMode = async (role: UserRole): Promise<{ success: boolean; error?: string }> => {
    const emailMap: Record<string, string> = {
      admin: 'demo@admin.com',
      landlord: 'demo@landlord.com',
      agent: 'demo@agent.com',
      tenant: 'demo@tenant.com',
    };
    return await login(emailMap[role] ?? 'demo@admin.com', 'demo123');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  const canAccess = (allowedRoles: UserRole[]): boolean => {
    if (!state.user) return false;
    return allowedRoles.includes(state.user.role);
  };

  const switchCompany = async (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company) setCurrentCompany(company);
  };

  const refreshCompanies = async () => {};

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        enterDemoMode,
        hasRole,
        canAccess,
        currentCompany,
        userCompanies,
        switchCompany,
        refreshCompanies,
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

export { useDashboardData, useProperties, useTenants, usePayments } from './hooks';
