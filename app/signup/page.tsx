'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Eye, EyeOff, Home, User, ArrowRight, Building2, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
const signUp = async (_args: any) => { throw new Error('Sign up is not available in demo mode. Please use the demo accounts on the login page.'); };
import { UserRole } from '@/types';

const roles = [
  { value: 'landlord', label: 'Landlord', icon: Building2, desc: 'I own rental properties' },
  { value: 'agent', label: 'Property Agent', icon: User, desc: 'I manage properties for landlords' },
  { value: 'tenant', label: 'Tenant', icon: Users, desc: 'I rent a property' },
];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phone: formData.phone,
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-card text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-slate-500 mb-6">
            Please check your email to confirm your account before signing in.
          </p>
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">EazyRentals</span>
          </Link>
          
          <div className="bg-white py-8 px-6 shadow-card rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Create Account
            </h2>
            <p className="text-slate-500 text-center mb-8">
              Join thousands managing properties with ease
            </p>

            {error && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value as UserRole })}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        formData.role === role.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.role === role.value ? 'bg-primary-200' : 'bg-slate-100'
                      }`}>
                        <role.icon className={`w-5 h-5 ${
                          formData.role === role.value ? 'text-primary-700' : 'text-slate-500'
                        }`} />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          formData.role === role.value ? 'text-primary-900' : 'text-slate-900'
                        }`}>{role.label}</p>
                        <p className="text-xs text-slate-500">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder="Doe"
                />
              </div>

              <Input
                label="Email address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
              />

              <Input
                label="Phone (optional)"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="••••••••"
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">
                  Sign in
                </Link>
              </p>
            </form>
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
            <h3 className="text-3xl font-bold mb-4">Start Managing Smarter</h3>
            <p className="text-lg text-primary-100 mb-8">
              Join thousands of landlords, agents, and tenants using EazyRentals to streamline their rental operations.
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-sm text-primary-200">Properties</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">5k+</p>
                <p className="text-sm text-primary-200">Landlords</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold">50k+</p>
                <p className="text-sm text-primary-200">Tenants</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
