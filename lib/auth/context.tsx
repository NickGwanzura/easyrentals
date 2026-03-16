'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, UserRole, AuthState } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { 
  signIn as supabaseSignIn, 
  signOut as supabaseSignOut, 
  getCurrentUser,
  onAuthStateChange,
  SignInCredentials 
} from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';
import { validateDemoCredentials } from '@/lib/mockData';
import type { Company } from '@/lib/whitelabel/server';
import {
  getAccountRecord,
  mapAccountToUser,
  syncAccountCompanyContext,
} from './account-records';

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
  // Company-related
  currentCompany: CompanyInfo | null;
  userCompanies: CompanyInfo[];
  switchCompany: (companyId: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/auth/callback', '/signup', '/signup/company', '/'];
const DEMO_MODE_ENABLED = true;

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

  // Load user's companies
  const loadUserCompanies = useCallback(async (userId: string, preferredCompanyId?: string | null) => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          company_id,
          role,
          companies:company_id (id, name, slug)
        `)
        .eq('user_id', userId)
        .eq('invitation_status', 'active');
      
      if (error) throw error;
      
      const companies = data?.map((item: any) => ({
        id: item.companies.id,
        name: item.companies.name,
        slug: item.companies.slug,
        role: item.role,
      })) || [];
      
      setUserCompanies(companies);
      
      setCurrentCompany(prev => {
        if (prev && companies.some(company => company.id === prev.id)) {
          return prev;
        }

        if (preferredCompanyId) {
          const preferredCompany = companies.find(company => company.id === preferredCompanyId);
          if (preferredCompany) {
            return preferredCompany;
          }
        }

        return companies[0] || null;
      });
    } catch (error) {
      console.error('Failed to load user companies:', error);
    }
  }, []);

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
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
          // Set default company for demo
          setCurrentCompany({
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Demo Company',
            slug: 'default',
            role: 'admin',
          });
          return;
        }

        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (session?.user) {
          const account = await getAccountRecord(session.user.id);
          const user = mapAccountToUser(session.user, account);

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            isSupabaseAuth: true,
          });
          
          // Load user's companies
          await loadUserCompanies(user.id, account?.current_company_id || null);
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();

    if (typeof window === 'undefined') return;

    const subscription = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const account = await getAccountRecord(session.user.id);
        const user = mapAccountToUser(session.user, account);

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: false,
          isSupabaseAuth: true,
        });
        
        await loadUserCompanies(user.id, account?.current_company_id || null);
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isDemoMode: false,
          isSupabaseAuth: false,
        });
        setCurrentCompany(null);
        setUserCompanies([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserCompanies]);

  // Handle route protection
  useEffect(() => {
    if (state.isLoading) return;
    
    // Root path is always public (landing page)
    if (pathname === '/') return;
    
    const isPublicPath = PUBLIC_PATHS.some(path => 
      pathname === path || pathname?.startsWith(path + '/')
    );
    
    if (!state.isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
    
    if (state.isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const demoUser = DEMO_MODE_ENABLED ? validateDemoCredentials(email, password) : null;
      
      if (demoUser) {
        const isDemo = ['demo@admin.com', 'demo@agent.com', 'demo@tenant.com'].includes(email.toLowerCase());
        
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        localStorage.setItem('isDemoMode', String(isDemo));
        
        setState({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: isDemo,
          isSupabaseAuth: false,
        });
        
        setCurrentCompany({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Demo Company',
          slug: 'default',
          role: 'admin',
        });
        
        return { success: true };
      }

      await supabaseSignIn({ email, password });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');
    
    if (state.isSupabaseAuth) {
      await supabaseSignOut();
    }
    
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
    if (!DEMO_MODE_ENABLED) {
      return { success: false, error: 'Demo mode is disabled in this environment.' };
    }

    let email: string;
    switch (role) {
      case 'admin':
        email = 'demo@admin.com';
        break;
      case 'landlord':
        email = 'demo@landlord.com';
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
    
    return await login(email, 'demo123');
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
    if (!state.user) return;
    
    try {
      await syncAccountCompanyContext(state.user.id, companyId);
      
      // Update local state
      const company = userCompanies.find(c => c.id === companyId);
      if (company) {
        setCurrentCompany(company);
      }
    } catch (error) {
      console.error('Failed to switch company:', error);
      throw error;
    }
  };

  const refreshCompanies = async () => {
    if (state.user) {
      await loadUserCompanies(state.user.id);
    }
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
