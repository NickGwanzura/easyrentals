'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBranding } from '@/lib/branding/context';
import { Eye, EyeOff, Home, ArrowRight, User, Building2, Users, Landmark } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';
const DEMO_MODE_ENABLED = true;

const demoAccounts = [
  { role: 'admin',    email: 'demo@admin.com',    icon: Building2, label: 'Admin',    desc: 'Full platform access' },
  { role: 'landlord', email: 'demo@landlord.com', icon: Landmark,  label: 'Landlord', desc: 'Portfolio & finance view' },
  { role: 'agent',    email: 'demo@agent.com',    icon: User,      label: 'Agent',    desc: 'Properties & leads' },
  { role: 'tenant',   email: 'demo@tenant.com',   icon: Users,     label: 'Tenant',   desc: 'Payments & requests' },
];

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<UserRole | null>(null);
  
  const { login, enterDemoMode, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { branding } = useBranding();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const showDemo = DEMO_MODE_ENABLED && searchParams.get('demo') === 'true';
  
  const { colors, agencyName, agencyTagline, logoUrl } = branding;

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      showToast('Password updated. Sign in with your new password.', 'success');
      router.replace('/login');
    }
  }, [router, searchParams, showToast]);

  /** Demo-only inline login — real users redirect to Auth0 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Login failed');
    setIsLoading(false);
  };

  /** Real-user login via Auth0 Universal Login */
  const handleAuth0Login = () => {
    window.location.href = '/auth/login';
  };

  /** Real-user signup via Auth0 Universal Login */
  const handleAuth0Signup = () => {
    window.location.href = '/auth/login?screen_hint=signup';
  };

  const handleDemoLogin = async (role: UserRole) => {
    setSelectedDemo(role);
    setIsLoading(true);
    setError('');
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    try {
      const result = await enterDemoMode(role);
      
      if (!result.success) {
        setError(result.error || 'Demo login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.background }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            {logoUrl ? (
              <Image src={logoUrl} alt={agencyName} width={160} height={48} className="h-12 w-auto object-contain" />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Home className="w-7 h-7 text-white" />
              </div>
            )}
          </div>
          
          <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border" style={{ borderColor: `${colors.secondary}20` }}>
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: colors.text }}>
              {showDemo ? 'Try Demo Mode' : showReset ? 'Reset your password' : 'Welcome back'}
            </h2>
            <p className="text-center mb-8" style={{ color: colors.textMuted }}>
              {showDemo 
                ? 'Select a role to experience the platform' 
                : showReset
                  ? 'We will email you a secure link so you can choose a new password.'
                  : `Sign in to manage your properties with ${agencyName}`}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* ── Real-user Auth0 login ── */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                className="w-full"
                onClick={handleAuth0Login}
                style={{ backgroundColor: colors.primary }}
              >
                Sign in
              </Button>
              <button
                type="button"
                onClick={handleAuth0Signup}
                className="w-full text-center py-2.5 rounded-lg font-medium border transition-colors hover:bg-slate-50"
                style={{ borderColor: `${colors.secondary}30`, color: colors.text }}
              >
                Create account
              </button>
            </div>

            {/* ── Demo divider ── */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: `${colors.secondary}20` }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white" style={{ color: colors.textMuted }}>Or try demo</span>
              </div>
            </div>

            {/* ── Demo quick-fill ── */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="rounded-xl border-2 border-dashed p-4 space-y-2" style={{ borderColor: `${colors.secondary}25`, backgroundColor: `${colors.primary}04` }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-center mb-3" style={{ color: colors.textMuted }}>Quick Demo Access</p>
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => { setEmail(account.email); setPassword('demo123'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all hover:shadow-sm text-left"
                    style={{ borderColor: `${colors.secondary}20`, backgroundColor: 'white' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}15` }}>
                      <account.icon className="w-4 h-4" style={{ color: colors.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>{account.label}</p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>{account.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.textMuted }} />
                  </button>
                ))}
              </div>
              {(email || password) && (
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  style={{ backgroundColor: colors.secondary }}
                >
                  Enter as demo user
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.primary} 50%, ${colors.secondary} 100%)`
          }}
        >
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay'
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h2 className="text-4xl font-bold mb-4">{agencyName}</h2>
            {agencyTagline && (
              <p className="text-xl mb-8 opacity-90">{agencyTagline}</p>
            )}
            <p className="text-lg font-medium leading-relaxed mb-8 opacity-90">
              Keep properties, tenants, payments, and inspections moving in one shared workspace designed for busy rental teams.
            </p>
            <div className="space-y-4 text-sm text-white/90">
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                Role-based views for landlords, agents, and tenants
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                Branded portals and settings that match your company
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                Clear dashboards for payments, occupancy, and follow-up work
              </div>
            </div>
            <div className="mt-8 text-sm text-white/75">
              Access your account securely and pick up where your team left off.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Home className="w-7 h-7 text-white" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
