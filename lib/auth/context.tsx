'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser as useAuth0User } from '@auth0/nextjs-auth0/client';
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

const PUBLIC_PATHS = ['/login', '/auth', '/signup', '/'];

const DEMO_COMPANY: CompanyInfo = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Demo Company',
  slug: 'default',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useAuth0User();
  const router = useRouter();
  const pathname = usePathname();

  const [demoState, setDemoState] = useState<{
    user: any | null;
    isDemoMode: boolean;
  }>({ user: null, isDemoMode: false });

  const [neonProfile, setNeonProfile] = useState<any>(null);
  const [neonCompanies, setNeonCompanies] = useState<CompanyInfo[]>([]);
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo | null>(null);
  const [syncing, setSyncing] = useState(false);

  // ── Demo mode bootstrap (localStorage) ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('demoUser');
      const isDemo = localStorage.getItem('isDemoMode') === 'true';
      if (stored && isDemo) {
        setDemoState({ user: JSON.parse(stored), isDemoMode: true });
        setCurrentCompany(DEMO_COMPANY);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Sync Auth0 user to Neon on first login ───────────────────────────────
  useEffect(() => {
    if (!auth0User || demoState.isDemoMode || syncing) return;
    setSyncing(true);
    fetch('/api/auth/sync', { method: 'POST' })
      .then(r => r.json())
      .then(({ user, companies }) => {
        if (user) {
          setNeonProfile(user);
          const mapped: CompanyInfo[] = (companies || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            role: c.user_role || 'member',
          }));
          setNeonCompanies(mapped);
          setCurrentCompany(mapped[0] ?? null);
        }
      })
      .catch(console.error)
      .finally(() => setSyncing(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0User?.sub]);

  // ── Derived state ────────────────────────────────────────────────────────
  const isLoading = auth0Loading || (!demoState.user && !!auth0User && syncing);
  const isDemo = demoState.isDemoMode;

  const user = isDemo
    ? demoState.user
    : auth0User && neonProfile
    ? {
        id: neonProfile.id,
        email: neonProfile.email,
        firstName: neonProfile.first_name || '',
        lastName: neonProfile.last_name || '',
        role: (neonProfile.role || 'tenant') as UserRole,
        avatar: neonProfile.avatar_url || auth0User.picture || undefined,
        phone: neonProfile.phone || undefined,
        createdAt: neonProfile.created_at,
        updatedAt: neonProfile.updated_at,
      }
    : null;

  const isAuthenticated = !!user;

  // ── Route protection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (!pathname) return;

    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
    if (!isAuthenticated && !isPublic) {
      router.push('/auth/login');
    }
    if (isAuthenticated && (pathname === '/login' || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // ── Actions ──────────────────────────────────────────────────────────────

  /** For demo mode only — real users use /auth/login redirect */
  const login = async (email: string, password: string) => {
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
    // Real users: redirect to Auth0
    router.push('/auth/login');
    return { success: true };
  };

  const logout = async () => {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('isDemoMode');
    setDemoState({ user: null, isDemoMode: false });
    setNeonProfile(null);
    setNeonCompanies([]);
    setCurrentCompany(null);

    if (auth0User) {
      // Auth0 logout (clears session cookie, redirects to Auth0 then back)
      router.push('/auth/logout');
    } else {
      router.push('/login');
    }
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

  const hasRole = (roles: UserRole[]) => !!user && roles.includes(user.role);
  const canAccess = (allowedRoles: UserRole[]) => !!user && allowedRoles.includes(user.role);

  const switchCompany = async (companyId: string) => {
    const company = neonCompanies.find(c => c.id === companyId);
    if (company) setCurrentCompany(company);
  };

  const refreshCompanies = async () => {
    if (!auth0User || isDemo) return;
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
    if (!auth.isLoading && !auth.isAuthenticated) router.push('/auth/login');
    if (!auth.isLoading && auth.isAuthenticated && allowedRoles && !auth.canAccess(allowedRoles)) {
      router.push('/dashboard');
    }
  }, [auth.isLoading, auth.isAuthenticated, allowedRoles, auth, router]);

  return auth;
}

export { useDashboardData, useProperties, useTenants, usePayments } from './hooks';
