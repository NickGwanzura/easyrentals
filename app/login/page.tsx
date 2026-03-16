'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useBranding } from '@/lib/branding/context';
import { Eye, EyeOff, Home, ArrowRight, User, Building2, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/context';
import { resetPassword } from '@/lib/supabase/auth';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';
const DEMO_MODE_ENABLED = true;

const demoAccounts = [
  { role: 'admin', email: 'demo@admin.com', icon: Building2, label: 'Admin' },
  { role: 'agent', email: 'demo@agent.com', icon: User, label: 'Agent' },
  { role: 'tenant', email: 'demo@tenant.com', icon: Users, label: 'Tenant' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter the email address tied to your account to receive a reset link.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email.trim());
      setResetSent(true);
      showToast('Password reset instructions sent.', 'success');
    } catch (err: any) {
      setError(err.message || 'Unable to send reset instructions right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const openReset = () => {
    setError('');
    setResetSent(false);
    setShowReset(true);
  };

  const backToLogin = () => {
    setError('');
    setShowReset(false);
    setResetSent(false);
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

            {showDemo ? (
              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account.role as UserRole)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                    style={{
                      borderColor: selectedDemo === account.role ? colors.primary : `${colors.secondary}20`,
                      backgroundColor: selectedDemo === account.role ? `${colors.primary}10` : 'white',
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <account.icon className="w-6 h-6" style={{ color: colors.primary }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold" style={{ color: colors.text }}>{account.label} View</p>
                      <p className="text-sm" style={{ color: colors.textMuted }}>{account.email}</p>
                    </div>
                    <ArrowRight 
                      className="w-5 h-5 transition-transform" 
                      style={{ 
                        color: colors.textMuted,
                        transform: selectedDemo === account.role ? 'translateX(4px)' : 'none'
                      }} 
                    />
                  </button>
                ))}
                
                <div className="mt-6 pt-6 border-t" style={{ borderColor: `${colors.secondary}15` }}>
                  <p className="text-sm text-center mb-4" style={{ color: colors.textMuted }}>
                    All demo accounts use password: <span className="font-mono font-medium" style={{ color: colors.text }}>demo123</span>
                  </p>
                  <Link
                    href="/login"
                    className="block w-full text-center py-2.5 rounded-lg font-medium border transition-colors"
                    style={{ 
                      borderColor: `${colors.secondary}30`,
                      color: colors.text,
                    }}
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : showReset ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  helperText={resetSent ? 'If an account exists for this email, the recovery link is on its way.' : 'Use the email address you normally sign in with.'}
                  leftIcon={<User className="w-5 h-5" />}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  style={{ backgroundColor: colors.primary }}
                >
                  {resetSent ? 'Send another reset link' : 'Send reset link'}
                </Button>

                <button
                  type="button"
                  onClick={backToLogin}
                  className="w-full text-center py-2.5 rounded-lg font-medium border transition-colors"
                  style={{
                    borderColor: `${colors.secondary}30`,
                    color: colors.text,
                  }}
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  leftIcon={<User className="w-5 h-5" />}
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        style={{ color: colors.textMuted }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300"
                      style={{ accentColor: colors.primary }}
                    />
                    <span className="text-sm" style={{ color: colors.textMuted }}>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={openReset}
                    className="text-sm font-medium hover:underline"
                    style={{ color: colors.primary }}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  style={{ backgroundColor: colors.primary }}
                >
                  Sign in
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: `${colors.secondary}20` }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white" style={{ color: colors.textMuted }}>Or</span>
                  </div>
                </div>

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
                        <p className="text-xs truncate font-mono" style={{ color: colors.textMuted }}>{account.email} · demo123</p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.textMuted }} />
                    </button>
                  ))}
                </div>
              </form>
            )}
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
