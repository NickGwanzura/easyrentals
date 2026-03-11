'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
import { validateDemoCredentials, getDemoUserById, demoData } from '@/lib/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enterDemoMode: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (allowedRoles: UserRole[]) => boolean;
  isSupabaseAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/landing', '/login', '/auth/callback', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState & { isSupabaseAuth: boolean }>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isDemoMode: false,
    isSupabaseAuth: false,
  });
  
  const router = useRouter();
  const pathname = usePathname();

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for demo mode
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
          return;
        }

        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get full user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            firstName: profile?.first_name || session.user.user_metadata.first_name || '',
            lastName: profile?.last_name || session.user.user_metadata.last_name || '',
            role: (profile?.role || session.user.user_metadata.role || 'tenant') as UserRole,
            avatar: profile?.avatar_url || session.user.user_metadata.avatar_url || undefined,
            phone: profile?.phone || session.user.user_metadata.phone || undefined,
            createdAt: profile?.created_at || session.user.created_at,
            updatedAt: profile?.updated_at,
          };

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            isSupabaseAuth: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const subscription = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          firstName: profile?.first_name || session.user.user_metadata.first_name || '',
          lastName: profile?.last_name || session.user.user_metadata.last_name || '',
          role: (profile?.role || session.user.user_metadata.role || 'tenant') as UserRole,
          avatar: profile?.avatar_url || session.user.user_metadata.avatar_url || undefined,
          phone: profile?.phone || session.user.user_metadata.phone || undefined,
          createdAt: profile?.created_at || session.user.created_at,
          updatedAt: profile?.updated_at,
        };

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: false,
          isSupabaseAuth: true,
        });
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isDemoMode: false,
          isSupabaseAuth: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
    try {
      // First try demo credentials
      const demoUser = validateDemoCredentials(email, password);
      
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
        
        return { success: true };
      }

      // Try Supabase auth
      await supabaseSignIn({ email, password });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  };

  const logout = async () => {
    // Clear demo mode
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');
    
    // Sign out from Supabase if using Supabase auth
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
    
    router.push('/login');
  };

  const enterDemoMode = async (role: UserRole): Promise<{ success: boolean; error?: string }> => {
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

// Re-export hooks from hooks.ts for convenience
export { useDashboardData, useProperties, useTenants, usePayments } from './hooks';
