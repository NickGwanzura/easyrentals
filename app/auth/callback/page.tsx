'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
const updatePassword = async (_pw: string) => { throw new Error('Not available in demo mode.'); };

function AuthCallbackContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isRecovery = searchParams.get('type') === 'recovery';

  useEffect(() => {
    if (!isRecovery) {
      const timeoutId = window.setTimeout(() => {
        router.replace('/dashboard');
      }, 1200);

      return () => window.clearTimeout(timeoutId);
    }
  }, [isRecovery, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      router.replace('/login?reset=success');
    } catch (err: any) {
      setError(err.message || 'Unable to update your password right now.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600">
            <Home className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">EazyRentals</span>
        </Link>

        {isRecovery ? (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Choose a new password</h1>
            <p className="mb-8 text-center text-slate-500">
              Set a fresh password for your account, then head back to sign in.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-5 w-5" />}
                helperText="Use at least 6 characters."
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                leftIcon={<Lock className="h-5 w-5" />}
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Update password
              </Button>
              <Link
                href="/login"
                className="block w-full rounded-lg border border-slate-200 py-2.5 text-center font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back to sign in
              </Link>
            </form>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">Signing you in</h1>
            <p className="text-center text-slate-500">
              We&apos;re finishing your authentication and will redirect you shortly.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
