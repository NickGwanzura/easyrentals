'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Home, ArrowRight, User, Building2, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/types';

const demoAccounts = [
  { role: 'admin', email: 'demo@admin.com', icon: Building2, label: 'Admin', color: 'bg-primary-100 text-primary-700 border-primary-200' },
  { role: 'agent', email: 'demo@agent.com', icon: User, label: 'Agent', color: 'bg-success-100 text-success-700 border-success-200' },
  { role: 'tenant', email: 'demo@tenant.com', icon: Users, label: 'Tenant', color: 'bg-warning-100 text-warning-700 border-warning-200' },
];

// Component that uses useSearchParams wrapped in Suspense
function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<UserRole | null>(null);
  
  const { login, enterDemoMode, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const showDemo = searchParams.get('demo') === 'true';

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

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

  const handleDemoLogin = async (role: UserRole) => {
    setSelectedDemo(role);
    setIsLoading(true);
    
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    enterDemoMode(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/landing" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EazyRentals</span>
          </Link>
          
          <div className="bg-white py-8 px-6 shadow-card rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              {showDemo ? 'Try Demo Mode' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 text-center mb-8">
              {showDemo 
                ? 'Select a role to experience the platform' 
                : 'Sign in to manage your properties'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {showDemo ? (
              // Demo Mode Selection
              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    onClick={() => handleDemoLogin(account.role as UserRole)}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedDemo === account.role
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${account.color} flex items-center justify-center`}>
                      <account.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-900">{account.label} View</p>
                      <p className="text-sm text-slate-500">{account.email}</p>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-slate-400 transition-transform ${
                      selectedDemo === account.role ? 'translate-x-1' : ''
                    }`} />
                  </button>
                ))}
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500 text-center mb-4">
                    All demo accounts use password: <span className="font-mono font-medium text-slate-700">demo123</span>
                  </p>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              // Regular Login Form
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
                        className="text-slate-400 hover:text-slate-600"
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
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or</span>
                  </div>
                </div>

                <Link href="/login?demo=true">
                  <Button variant="outline" className="w-full">
                    Try Demo Mode
                  </Button>
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Image/Gradient */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <blockquote className="text-2xl font-medium leading-relaxed mb-6">
              &ldquo;EazyRentals has completely transformed how I manage my rental properties. 
              The dashboard is intuitive and saves me hours every week.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg font-semibold">JD</span>
              </div>
              <div>
                <p className="font-semibold">John Davidson</p>
                <p className="text-primary-200">Property Manager, 45+ units</p>
              </div>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Home className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
