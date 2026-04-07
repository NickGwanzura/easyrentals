'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBranding } from '@/lib/branding/context';
import { Home, ArrowRight, User, Building2, Users, Landmark, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/context';
import { signIn as baSignIn } from '@/lib/auth-client';
import { UserRole } from '@/types';

const demoAccounts = [
  { role: 'admin',    email: 'demo@admin.com',    icon: Building2, label: 'Admin',    desc: 'Full platform access' },
  { role: 'landlord', email: 'demo@landlord.com', icon: Landmark,  label: 'Landlord', desc: 'Portfolio & finance view' },
  { role: 'agent',    email: 'demo@agent.com',    icon: User,      label: 'Agent',    desc: 'Properties & leads' },
  { role: 'tenant',   email: 'demo@tenant.com',   icon: Users,     label: 'Tenant',   desc: 'Payments & requests' },
];

function LoginContent() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<UserRole | null>(null);

  const { enterDemoMode, isAuthenticated } = useAuth();
  const { showToast }  = useToast();
  const { branding }   = useBranding();
  const searchParams   = useSearchParams();
  const router         = useRouter();

  const callbackUrl    = searchParams.get('callbackUrl') || '/dashboard';
  const { colors, agencyName, agencyTagline, logoUrl } = branding;

  useEffect(() => {
    if (isAuthenticated) router.push(callbackUrl);
  }, [isAuthenticated, router, callbackUrl]);

  // ── Real user sign-in via Better Auth ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: err } = await baSignIn.email({
        email: email.trim(),
        password,
        callbackURL: callbackUrl,
        fetchOptions: {
          onSuccess: () => router.push(callbackUrl),
        },
      });
      if (err) setError(err.message || 'Invalid email or password.');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Demo fast-fill ─────────────────────────────────────────────────────────
  const handleDemoLogin = async (role: UserRole) => {
    setSelectedDemo(role);
    setIsLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));
    const result = await enterDemoMode(role);
    if (!result.success) {
      setError(result.error || 'Demo login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.background }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {logoUrl ? (
              <Image src={logoUrl} alt={agencyName} width={160} height={48} className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                <Home className="w-7 h-7 text-white" />
              </div>
            )}
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border" style={{ borderColor: `${colors.secondary}20` }}>
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: colors.text }}>Welcome back</h2>
            <p className="text-center mb-8 text-sm" style={{ color: colors.textMuted }}>
              Sign in to manage your properties with {agencyName}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* ── Real-user form ── */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:opacity-70 transition-opacity" style={{ color: colors.textMuted }}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <Button type="submit" className="w-full" isLoading={isLoading} style={{ backgroundColor: colors.primary }}>
                Sign in
              </Button>
            </form>

            <p className="text-center text-sm mb-6" style={{ color: colors.textMuted }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium hover:underline" style={{ color: colors.primary }}>
                Create account
              </Link>
            </p>

            {/* ── Demo divider ── */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: `${colors.secondary}20` }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white" style={{ color: colors.textMuted }}>Or try demo</span>
              </div>
            </div>

            {/* ── Demo panel ── */}
            <div className="rounded-xl border-2 border-dashed p-4 space-y-2" style={{ borderColor: `${colors.secondary}25`, backgroundColor: `${colors.primary}04` }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-center mb-3" style={{ color: colors.textMuted }}>Quick Demo Access</p>
              {demoAccounts.map(account => (
                <button
                  key={account.role}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoLogin(account.role as UserRole)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all hover:shadow-sm text-left"
                  style={{
                    borderColor: selectedDemo === account.role ? colors.primary : `${colors.secondary}20`,
                    backgroundColor: selectedDemo === account.role ? `${colors.primary}08` : 'white',
                  }}
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
          </div>
        </div>
      </div>

      {/* Right — Branding */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.primary} 50%, ${colors.secondary} 100%)` }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h2 className="text-4xl font-bold mb-4">{agencyName}</h2>
            {agencyTagline && <p className="text-xl mb-8 opacity-90">{agencyTagline}</p>}
            <p className="text-lg font-medium leading-relaxed mb-8 opacity-90">
              Keep properties, tenants, payments, and inspections moving in one shared workspace.
            </p>
            <div className="space-y-3 text-sm text-white/90">
              {['Role-based views for landlords, agents, and tenants', 'Branded portals that match your company', 'Clear dashboards for payments, occupancy, and follow-ups'].map(t => (
                <div key={t} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
