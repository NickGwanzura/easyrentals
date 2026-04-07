'use client';

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, User, Eye, EyeOff, Building2, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { signUp as baSignUp } from '@/lib/auth-client';
import { UserRole } from '@/types';

const roles = [
  { value: 'landlord', label: 'Landlord',       icon: Building2, desc: 'I own rental properties' },
  { value: 'agent',    label: 'Property Agent',  icon: User,      desc: 'I manage properties for landlords' },
  { value: 'tenant',   label: 'Tenant',          icon: Users,     desc: 'I rent a property' },
];

function SignupContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'tenant' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]   = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: err } = await baSignUp.email({
        email: form.email.trim(),
        password: form.password,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        // Additional fields go via the Better Auth user.additionalFields config
        callbackURL: '/dashboard',
        fetchOptions: {
          onSuccess: () => {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 1500);
          },
        },
      } as any);

      if (err) {
        setError(err.message || 'Sign up failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account created!</h2>
          <p className="text-slate-600">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Home className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-slate-100">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Create your account</h2>
          <p className="text-center text-sm text-slate-500 mb-8">Get started with EazyRentals</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a…</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: r.value as UserRole }))}
                    className="flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center"
                    style={{
                      borderColor: form.role === r.value ? '#2563eb' : '#e2e8f0',
                      backgroundColor: form.role === r.value ? '#eff6ff' : 'white',
                    }}
                  >
                    <r.icon className="w-5 h-5 mb-1" style={{ color: form.role === r.value ? '#2563eb' : '#64748b' }} />
                    <span className="text-xs font-medium" style={{ color: form.role === r.value ? '#2563eb' : '#475569' }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" type="text" value={form.firstName} onChange={set('firstName')} required placeholder="Jane" />
              <Input label="Last name"  type="text" value={form.lastName}  onChange={set('lastName')}  required placeholder="Smith" />
            </div>

            <Input label="Email address" type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" leftIcon={<User className="w-5 h-5" />} />

            <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
              placeholder="Min. 8 characters"
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:opacity-70 transition-opacity text-slate-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              required
              placeholder="Re-enter your password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading} style={{ backgroundColor: '#2563eb' }}>
              Create account
            </Button>
          </form>

          <p className="text-center text-sm mt-6 text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
