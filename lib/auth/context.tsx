'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signOut as baSignOut } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole, AuthState } from '@/types';
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

const PUBLIC_PATHS = ['/login', '/signup', '/api', '/'];

const DEMO_COMPANY: CompanyInfo = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Demo Company',
  slug: 'default',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [demoState, setDemoState] = useState<{ user: any | null; isDemoMode: boolean }>({
    user: null,
    isDemoMode: false,
  });
  const [neonCompanies, setNeonCompanies] = useState<CompanyInfo[]>([]);
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo | null>(null);

  // ── Bootstrap demo mode from localStorage ────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('demoUser');
      const isDemo = localStorage.getItem('isDemoMode') === 'true';
      if (stored && isDemo) {
        setDemoState({ user: JSON.parse(stored), isDemoMode: true });
        setCurrentCompany(DEMO_COMPANY);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Fetch company memberships after Better Auth session loads ─────────────
  useEffect(() => {
    if (!session?.user || demoState.isDemoMode) return;

    fetch('/api/auth/sync', { method: 'POST' })
      .then(r => r.json())
      .then(({ companies }) => {
        const mapped: CompanyInfo[] = (companies || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          role: c.user_role || 'member',
        }));
        setNeonCompanies(mapped);
        setCurrentCompany(prev => prev ?? mapped[0] ?? null);
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isDemo = demoState.isDemoMode;
  const isLoading = isPending && !isDemo;

  const baUser = session?.user as any;
  const user = isDemo
    ? demoState.user
    : baUser
    ? {
        id: baUser.id,
        email: baUser.email,
        firstName: baUser.firstName || baUser.name?.split(' ')[0] || '',
        lastName:  baUser.lastName  || baUser.name?.split(' ').slice(1).join(' ') || '',
        role: (baUser.role || 'tenant') as UserRole,
        avatar: baUser.image || undefined,
        phone: baUser.phone || undefined,
        createdAt: baUser.createdAt,
        updatedAt: baUser.updatedAt,
      }
    : null;

  const isAuthenticated = !!user;

  // ── Route protection ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || !pathname) return;

    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
    if (!isAuthenticated && !isPublic) router.push('/login');
    if (isAuthenticated && pathname === '/login') router.push('/dashboard');
  }, [isAuthenticated, isLoading, pathname, router]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    // Demo user fast-path (localStorage)
    const demoUser = validateDemoCredentials(email, password);
    if (demoUser) {
      const isDemo = Object.values(DEMO_CREDENTIALS).some(
        (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
      );
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      localStorage.setItem('isDemoMode', String(isDemo));
      setDemoState({ user: demoUser, isDemoMode: isDemo });
      setCurrentCompany(DEMO_COMPANY);
      return { success: true };
    }
    // Real users are handled by the login form calling authClient.signIn.email directly
    return { success: false, error: 'Invalid credentials.' };
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');
    setDemoState({ user: null, isDemoMode: false });
    setNeonCompanies([]);
    setCurrentCompany(null);

    if (session?.user) {
      await baSignOut();
    }
    router.push('/login');
  };

  const enterDemoMode = async (role: UserRole) => {
    const emailMap: Record<string, string> = {
      admin: 'demo@admin.com',
      landlord: 'demo@landlord.com',
      agent: 'demo@agent.com',
      tenant: 'demo@tenant.com',
    };
    return login(emailMap[role] ?? 'demo@admin.com', 'demo123');
  };

  const hasRole  = (roles: UserRole[]) => !!user && roles.includes(user.role);
  const canAccess = (allowedRoles: UserRole[]) => !!user && allowedRoles.includes(user.role);

  const switchCompany = async (companyId: string) => {
    const company = neonCompanies.find(c => c.id === companyId);
    if (company) setCurrentCompany(company);
  };

  const refreshCompanies = async () => {
    if (!session?.user || isDemo) return;
    const r = await fetch('/api/auth/sync', { method: 'POST' });
    const { companies } = await r.json();
    const mapped: CompanyInfo[] = (companies || []).map((c: any) => ({
      id: c.id, name: c.name, slug: c.slug, role: c.user_role || 'member',
    }));
    setNeonCompanies(mapped);
    if (!currentCompany || !mapped.find(c => c.id === currentCompany.id)) {
      setCurrentCompany(mapped[0] ?? null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isDemoMode: isDemo,
        isSupabaseAuth: false,
        login,
        logout,
        enterDemoMode,
        hasRole,
        canAccess,
        currentCompany,
        userCompanies: isDemo ? [DEMO_COMPANY] : neonCompanies,
        switchCompany,
        refreshCompanies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) router.push('/login');
    if (!auth.isLoading && auth.isAuthenticated && allowedRoles && !auth.canAccess(allowedRoles)) {
      router.push('/dashboard');
    }
  }, [auth.isLoading, auth.isAuthenticated, allowedRoles, auth, router]);

  return auth;
}

export { useDashboardData, useProperties, useTenants, usePayments } from './hooks';
