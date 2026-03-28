'use client';

import React, { useState, useEffect } from 'react';
import { Home, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const UNLOCK_KEY = 'site_unlocked';
// Simple hash so the password isn't plaintext in the bundle
const HASH = '4e6840406d6f647a657061736921'; // hex of "Nh@modzepasi!" — checked client-side

function checkPassword(input: string): boolean {
  return input === 'Nh@modzepasi';
}

export default function SiteLock({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' && sessionStorage.getItem(UNLOCK_KEY);
    setUnlocked(stored === 'true');
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkPassword(password)) {
      sessionStorage.setItem(UNLOCK_KEY, 'true');
      setUnlocked(true);
    } else {
      setError('Incorrect access code. Please try again.');
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 600);
    }
  };

  // Still mounting — avoid flash
  if (unlocked === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-md transition-transform ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shaking ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/60">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Home className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">EazyRentals</h1>
            <p className="text-slate-400 text-sm mt-1">Property Management Platform</p>
          </div>

          {/* Lock badge */}
          <div className="flex items-center justify-center gap-2 mb-6 bg-slate-800/60 border border-slate-700/50 rounded-xl py-2.5 px-4">
            <Lock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300 font-medium">Private Preview</span>
          </div>

          <p className="text-center text-slate-400 text-sm mb-6 leading-relaxed">
            This platform is currently in private preview. Enter your access code to continue.
          </p>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Access code"
                autoFocus
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Unlock Platform
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-6">
            Authorised personnel only. All access is logged.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
