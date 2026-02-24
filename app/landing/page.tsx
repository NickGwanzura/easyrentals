'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle2,
  Home,
  Key,
  Wallet
} from 'lucide-react';
import Button from '@/components/ui/Button';

const features = [
  {
    icon: Building2,
    title: 'Property Management',
    description: 'Easily manage all your properties in one place. Track occupancy, maintenance, and more.',
  },
  {
    icon: Users,
    title: 'Tenant Portal',
    description: 'Give tenants access to their own dashboard for payments, maintenance requests, and lease info.',
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Accept rent payments online, track payment history, and manage outstanding balances.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Get insights into your portfolio performance with detailed reports and dashboards.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Bank-level security ensures your data and transactions are always protected.',
  },
  {
    icon: Clock,
    title: '24/7 Access',
    description: 'Access your dashboard anytime, anywhere from any device.',
  },
];

const demoFeatures = [
  { icon: Key, text: 'Try as Admin, Agent, or Tenant' },
  { icon: Shield, text: 'No signup required' },
  { icon: Clock, text: 'Data resets automatically' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">EazyRentals</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>
              <span className="text-sm font-medium text-primary-700">
                Now with Agent Portal
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              Rental Management{' '}
              <span className="gradient-text">Made Simple</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
              The complete property management solution for landlords, agents, and tenants. 
              Streamline your rentals, automate payments, and grow your portfolio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?demo=true">
                <Button size="lg" leftIcon={<Wallet className="w-5 h-5" />}>
                  Try Demo Mode
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Try It Risk-Free
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Experience all features with our interactive demo. No credit card required, 
                no signup needed. Data automatically resets when you refresh.
              </p>
              <ul className="space-y-4 mb-8">
                {demoFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-slate-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login?demo=true">
                <Button size="lg">Launch Demo</Button>
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-card">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Demo Credentials</h3>
              <div className="space-y-4">
                {[
                  { role: 'Admin', email: 'demo@admin.com', color: 'bg-primary-100 text-primary-700' },
                  { role: 'Agent', email: 'demo@agent.com', color: 'bg-success-100 text-success-700' },
                  { role: 'Tenant', email: 'demo@tenant.com', color: 'bg-warning-100 text-warning-700' },
                ].map((cred) => (
                  <div key={cred.role} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cred.color}`}>
                        {cred.role}
                      </span>
                      <span className="text-sm text-slate-600">{cred.email}</span>
                    </div>
                    <span className="text-sm text-slate-400">demo123</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                Password for all demo accounts: <span className="font-mono font-medium">demo123</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage your rental properties efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Simplify Your Rentals?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of property managers who trust EazyRentals to manage their portfolios.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?demo=true">
              <Button size="lg" variant="primary">
                Try Demo Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">EazyRentals</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 EazyRentals. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
