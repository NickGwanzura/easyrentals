'use client';

export const dynamic = 'force-dynamic';

/**
 * /signup — redirects immediately to Auth0 Universal Login (signup screen).
 * After signup Auth0 redirects to /auth/callback → /dashboard.
 * The user's role is set to 'tenant' by default and can be updated in settings.
 */
import { useEffect } from 'react';
import { Home } from 'lucide-react';

export default function SignupPage() {
  useEffect(() => {
    window.location.href = '/auth/login?screen_hint=signup';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Home className="w-7 h-7 text-white" />
        </div>
        <p className="text-slate-600">Redirecting to sign up…</p>
      </div>
    </div>
  );
}
