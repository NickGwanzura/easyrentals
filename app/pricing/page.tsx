'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Building2, Sparkles, HelpCircle, ArrowRight, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useBranding } from '@/lib/branding/context';

// Fallback plans data (used if database fails)
const FALLBACK_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for individual landlords',
    monthlyPrice: 110,
    annualPrice: 88,
    maxProperties: 5,
    maxTenants: 20,
    maxUsers: 2,
    features: ['basic_branding', 'property_management'],
  },
  {
    id: 'growth',
    name: 'Growth',
    slug: 'growth',
    description: 'Ideal for small property management companies',
    monthlyPrice: 440,
    annualPrice: 352,
    maxProperties: 20,
    maxTenants: 100,
    maxUsers: 5,
    features: ['custom_domain', 'remove_badge', 'api_access'],
  },
  {
    id: 'pro',
    name: 'Professional',
    slug: 'professional',
    description: 'For medium-sized agencies',
    monthlyPrice: 440,
    annualPrice: 352,
    maxProperties: 20,
    maxTenants: 200,
    maxUsers: 20,
    features: ['owner_portal', 'dedicated_manager', 'automated_workflows'],
  },
];

const FAQS = [
  { q: 'Can I change plans later?', a: 'Yes, upgrade or downgrade anytime. Prorated differences apply.' },
  { q: 'What happens if I exceed my property limit?', a: 'Pay $22 per additional property per month or upgrade your plan.' },
  { q: 'Is there a setup fee?', a: 'No setup fees for any plan.' },
  { q: 'Do you offer refunds?', a: '30-day money-back guarantee on all plans.' },
];

export default function PricingPage() {
  const { branding } = useBranding();
  const [isAnnual, setIsAnnual] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const plans = FALLBACK_PLANS;
  const starterPlan = plans[0];
  const growthPlan = plans[1];
  const proPlan = plans[2];

  // Default colors
  const colors = {
    primary: branding?.colors?.primary || '#2563eb',
    secondary: branding?.colors?.secondary || '#64748b',
    background: branding?.colors?.background || '#f8fafc',
    surface: branding?.colors?.surface || '#ffffff',
    text: branding?.colors?.text || '#0f172a',
    textMuted: branding?.colors?.textMuted || '#64748b',
  };
  const agencyName = branding?.agencyName || 'EazyRentals';

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="py-6 px-4 border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">{agencyName}</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium bg-blue-50 text-blue-600">
            <Sparkles className="w-4 h-4" />
            Simple per-property pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Property Management<br />Made Affordable
          </h1>
          <p className="text-lg mb-2 text-slate-500">
            Start free, scale as you grow. No hidden fees.
          </p>
          <p className="text-2xl font-bold mb-8 text-blue-600">
            $22 per property / month
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-full border bg-white border-slate-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isAnnual ? 'bg-blue-600 text-white' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-blue-600 text-white' : 'text-slate-500'
              }`}
            >
              Annual
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center mb-8 text-sm text-slate-500">
            All plans include: Property management, tenant tracking, payments, and maintenance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="flex flex-col bg-white rounded-2xl border-2 border-slate-100 shadow-card">
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{starterPlan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{starterPlan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(isAnnual ? starterPlan.annualPrice : starterPlan.monthlyPrice)}
                    </span>
                    <span className="text-slate-500">/{isAnnual ? 'year' : 'mo'}</span>
                  </div>
                  <p className="text-sm mt-1 text-slate-500">{starterPlan.maxProperties} properties included</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{starterPlan.maxProperties}</strong> properties</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{starterPlan.maxTenants}</strong> tenants</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{starterPlan.maxUsers}</strong> team members</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-400">
                    <X className="w-5 h-5" />
                    <span>Custom domain</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0">
                <Link href={`/signup/company?plan=${starterPlan.slug}`}>
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>

            {/* Growth - Popular */}
            <div className="flex flex-col relative bg-white rounded-2xl border-2 shadow-card" style={{ borderColor: colors.primary }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full text-sm font-semibold text-white flex items-center gap-1.5 shadow-lg" style={{ backgroundColor: colors.primary }}>
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              </div>

              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{growthPlan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{growthPlan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(isAnnual ? growthPlan.annualPrice : growthPlan.monthlyPrice)}
                    </span>
                    <span className="text-slate-500">/{isAnnual ? 'year' : 'mo'}</span>
                  </div>
                  <p className="text-sm mt-1 text-slate-500">{growthPlan.maxProperties} properties included</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{growthPlan.maxProperties}</strong> properties</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{growthPlan.maxTenants}</strong> tenants</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{growthPlan.maxUsers}</strong> team members</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span>Custom domain</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span>Remove branding</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0">
                <Link href={`/signup/company?plan=${growthPlan.slug}`}>
                  <Button className="w-full" style={{ backgroundColor: colors.primary }}>Get Started</Button>
                </Link>
              </div>
            </div>

            {/* Professional */}
            <div className="flex flex-col bg-white rounded-2xl border-2 border-slate-100 shadow-card">
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-4">{proPlan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{proPlan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {formatPrice(isAnnual ? proPlan.annualPrice : proPlan.monthlyPrice)}
                    </span>
                    <span className="text-slate-500">/{isAnnual ? 'year' : 'mo'}</span>
                  </div>
                  <p className="text-sm mt-1 text-slate-500">{proPlan.maxProperties} properties included</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{proPlan.maxProperties}</strong> properties</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{proPlan.maxTenants}</strong> tenants</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span><strong>{proPlan.maxUsers}</strong> team members</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span>Everything in Growth</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span>Owner portal</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-900">
                    <Check className="w-5 h-5 text-blue-600" />
                    <span>Dedicated manager</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0">
                <Link href={`/signup/company?plan=${proPlan.slug}`}>
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Extra properties note */}
          <div className="mt-8 text-center p-4 rounded-xl bg-blue-50/50">
            <p className="text-sm text-slate-900">
              <strong>Need more properties?</strong> Additional properties at $22/month each.
              <Link href="/contact" className="ml-2 text-blue-600 underline">Contact us for Enterprise</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <h3 className="font-semibold mb-2 text-slate-900">{faq.q}</h3>
                <p className="text-slate-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of property managers already using {agencyName}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup/company">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm mt-4 opacity-75">No credit card required • 30-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 text-center bg-white border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">{agencyName}</span>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {agencyName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
