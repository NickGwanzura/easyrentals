'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2, CreditCard, FileText, BarChart2, ClipboardCheck, Users,
  Menu, X, Check, ChevronDown, ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Multi-Property Management',
    description: 'Manage unlimited properties and units from a single unified dashboard.',
  },
  {
    icon: CreditCard,
    title: 'Automated Rent Collection',
    description: 'Online payments, automatic reminders, and comprehensive financial tracking.',
  },
  {
    icon: FileText,
    title: 'Digital Lease Agreements',
    description: 'Create, sign, and manage leases with automated renewal reminders.',
  },
  {
    icon: BarChart2,
    title: 'Financial Analytics',
    description: 'Real-time insights on occupancy rates, revenue, and property performance.',
  },
  {
    icon: ClipboardCheck,
    title: 'Property Inspections',
    description: 'Conduct inspections with photo documentation and generate detailed reports.',
  },
  {
    icon: Users,
    title: 'Tenant Portal',
    description: 'Self-service portal for tenants to pay rent and submit maintenance requests.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$110',
    period: '/month',
    description: 'For small landlords starting out',
    properties: 'Up to 5 properties',
    features: [
      'Up to 5 properties',
      'Up to 20 tenants',
      '2 user accounts',
      'Rent collection',
      'Basic reporting',
      'Email support',
    ],
    cta: 'Get Started',
    ctaHref: '/signup',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$440',
    period: '/month',
    description: 'For growing property managers',
    properties: 'Up to 20 properties',
    features: [
      'Up to 20 properties',
      'Up to 200 tenants',
      '20 user accounts',
      'All Starter features',
      'Owner portal',
      'Advanced API access',
      'Budget tools',
      'Priority support',
    ],
    cta: 'Get Started',
    ctaHref: '/signup',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large property portfolios',
    properties: 'Unlimited properties',
    features: [
      'Unlimited properties',
      'Unlimited tenants',
      'Unlimited users',
      'All Professional features',
      'Custom integrations',
      'Dedicated account manager',
      'Phone support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@eazyrentals.com',
    popular: false,
  },
];

const useCases = [
  {
    title: 'For property managers',
    subtitle: 'Keep daily operations visible',
    content: 'Track vacancies, inspections, rent follow-up, and lease milestones from one shared workspace.',
  },
  {
    title: 'For landlords',
    subtitle: 'Stay close to portfolio performance',
    content: 'Review occupancy, payments, reports, and owner-facing finance views without chasing updates.',
  },
  {
    title: 'For tenants',
    subtitle: 'Make routine tasks easier',
    content: 'Give residents a clearer path for payments, maintenance requests, and everyday communication.',
  },
];

const faqs = [
  {
    question: 'How does pricing work?',
    answer: 'Pricing is $22 per property per month. Starter includes 5 properties ($110/mo), Professional includes 20 properties ($440/mo). Annual plans include a 20% discount.',
  },
  {
    question: 'Can I import my existing data?',
    answer: 'You can start fresh or move your portfolio over in stages. The best setup path depends on how your current data is structured.',
  },
  {
    question: 'Is my data secure?',
    answer: 'We use secure authentication and encrypted connections to help protect account access and day-to-day data handling.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, bank transfers, and can support invoicing for Enterprise plans.',
  },
  {
    question: 'Can I customize the tenant portal?',
    answer: 'Professional and Enterprise plans include white-labeling with custom colors, logos, and branding.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Contact us to arrange a guided demo and trial period. We want to make sure EazyRentals is the right fit before you commit.',
  },
];

const stats = [
  { value: '500+', label: 'Properties managed' },
  { value: '$2M+', label: 'Monthly rent tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '3 min', label: 'Average setup' },
];

const chartBars = [35, 55, 45, 70, 50, 80, 65, 85, 60, 90, 75, 95];
const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 via-primary-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
                <span className="text-white font-bold text-base leading-none">E</span>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">EazyRentals</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-xl shadow-md shadow-primary-500/20 transition-all hover:-translate-y-px"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile: Sign In + Hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <Link href="/login" className="text-sm font-semibold text-gray-700 px-2 py-1">
                Sign In
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`sm:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3">
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-sm py-3 rounded-xl"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-44 lg:min-h-screen lg:flex lg:items-center lg:pb-32">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1.5s' }}
            />
          </div>
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center rounded-full border border-gray-200/60 bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-md backdrop-blur-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2.5 animate-pulse" aria-hidden="true" />
                Built for modern property operations
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Property Management
                <span className="block mt-2 bg-gradient-to-r from-primary-600 via-primary-500 to-violet-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
                Collect rent, manage tenants, and grow your portfolio — all from one powerful dashboard built for property managers and landlords.
              </p>

              {/* CTAs */}
              <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-0.5 hover:shadow-primary-500/30 sm:px-10 sm:text-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-center text-base font-bold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-gray-300 sm:px-10 sm:text-lg"
                >
                  Sign In
                </Link>
              </div>

              {/* Trust bullets */}
              <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-500">
                {['No credit card required', 'Setup in minutes', 'Cancel anytime'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative mt-16 sm:mt-20 lg:mt-24">
              <div className="rounded-2xl bg-gray-900 shadow-2xl overflow-hidden border border-gray-800 ring-1 ring-white/5">
                {/* Browser chrome */}
                <div className="bg-gray-800/80 px-5 py-3.5 flex items-center gap-3 border-b border-gray-700/50">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="max-w-xs mx-auto bg-gray-700/50 rounded-md px-4 py-1.5 text-xs text-gray-400 text-center font-mono">
                      app.eazyrentals.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-4 sm:p-6 bg-gray-900" aria-hidden="true">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 mb-4">
                    {[
                      { label: 'Total Revenue', value: '$127,450', change: '↑ 12%', color: 'primary', neutral: false },
                      { label: 'Occupancy Rate', value: '94.2%', change: '↑ 3%', color: 'green', neutral: false },
                      { label: 'Pending Rent', value: '$8,200', change: '3 tenants', color: 'amber', neutral: true },
                      { label: 'Active Tenants', value: '156', change: '+5 this month', color: 'violet', neutral: true },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className={`rounded-xl border p-4 sm:p-5 ${
                          stat.color === 'primary' ? 'border-primary-500/20 bg-primary-500/10' :
                          stat.color === 'green' ? 'border-green-500/20 bg-green-500/10' :
                          stat.color === 'amber' ? 'border-amber-500/20 bg-amber-500/10' :
                          'border-violet-500/20 bg-violet-500/10'
                        }`}
                      >
                        <div className={`text-xs font-semibold mb-1.5 ${
                          stat.color === 'primary' ? 'text-primary-400' :
                          stat.color === 'green' ? 'text-green-400' :
                          stat.color === 'amber' ? 'text-amber-400' :
                          'text-violet-400'
                        }`}>{stat.label}</div>
                        <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                        <div className={`text-xs mt-1 ${stat.neutral ? 'text-gray-400' : 'text-green-400'}`}>{stat.change}</div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Bar chart */}
                    <div className="md:col-span-2 bg-gray-800/50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-400 mb-4">Monthly Revenue</div>
                      <div className="flex items-end gap-1 h-20">
                        {chartBars.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-primary-500/50"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2">
                        {chartMonths.map((m) => (
                          <span key={m} className="hidden sm:block text-xs text-gray-600">{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-gray-400 mb-3">Recent Activity</div>
                      <div className="space-y-3">
                        {[
                          { text: 'Rent received — Unit 4B', time: '2m ago', dot: 'bg-green-400' },
                          { text: 'Lease renewed — Johnson', time: '1h ago', dot: 'bg-primary-400' },
                          { text: 'Inspection due — Block C', time: '3h ago', dot: 'bg-amber-400' },
                          { text: 'New tenant onboarded', time: 'Today', dot: 'bg-green-400' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`} />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-300 truncate">{item.text}</p>
                              <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-gray-100 bg-gray-50 py-10 lg:py-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm font-medium text-gray-500 order-last">{stat.label}</dt>
                  <dd className="text-3xl font-bold text-gray-900 lg:text-4xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">Everything You Need</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Powerful tools designed to simplify every aspect of property management
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-xl"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white mb-5 shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="bg-gray-50 py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">Built for Every Role</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EazyRentals helps teams stay aligned from first inquiry to final report.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3 mb-10">
              {useCases.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-6" aria-hidden="true">
                    {index + 1}
                  </div>
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-primary-600">
                    {item.subtitle}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: 'One workspace', detail: 'Keep core rental work connected.', bg: 'from-primary-50 to-primary-100/40', text: 'text-primary-700' },
                { value: 'Clear ownership', detail: 'Give each role the right view and actions.', bg: 'from-green-50 to-green-100/40', text: 'text-green-700' },
                { value: 'Faster follow-up', detail: 'Stay on top of payments, issues, and renewals.', bg: 'from-amber-50 to-amber-100/40', text: 'text-amber-700' },
                { value: 'Branded experience', detail: 'Adapt the platform to your company identity.', bg: 'from-violet-50 to-violet-100/40', text: 'text-violet-700' },
              ].map((item) => (
                <div key={item.value} className={`rounded-2xl bg-gradient-to-br ${item.bg} p-7 text-center`}>
                  <div className={`mb-2 text-2xl font-bold lg:text-3xl ${item.text}`}>{item.value}</div>
                  <div className="text-sm font-medium text-gray-600">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-white py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">Simple, Transparent Pricing</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                $22 per property per month. Choose the plan that fits your portfolio.
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3 lg:gap-7 items-start">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl bg-white p-8 ${
                    plan.popular
                      ? 'z-10 shadow-2xl shadow-primary-500/10 ring-2 ring-primary-500/25 md:scale-105'
                      : 'border border-gray-200 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-primary-500/30 whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-7">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold text-gray-900 lg:text-5xl">{plan.price}</span>
                      {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
                    </div>
                    <p className="text-sm font-semibold text-primary-600">{plan.properties}</p>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.ctaHref}
                    className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg shadow-primary-500/20'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-gray-50 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="mb-14 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Everything you need to know about EazyRentals</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="pr-4 font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="mb-5 text-4xl font-bold text-white sm:text-5xl">
              Ready to Simplify Your Property Management?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-100">
              Bring your team, properties, tenants, and reporting into one clearer operating system.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-xl bg-white px-10 py-4 text-base font-bold text-primary-700 shadow-2xl transition-all hover:bg-gray-50 hover:-translate-y-0.5 sm:px-12 sm:text-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto rounded-xl border-2 border-white/30 bg-white/10 px-10 py-4 text-base font-bold text-white transition-all hover:bg-white/20 sm:px-12 sm:text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-14 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-4 mb-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-base">E</span>
                  </div>
                  <span className="text-lg font-bold">EazyRentals</span>
                </div>
                <p className="text-gray-400 max-w-xs text-sm leading-relaxed">
                  The modern property management platform that helps you save time, reduce costs, and grow your portfolio.
                </p>
              </div>

              <nav aria-label="Product links">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-300 mb-4">Product</h4>
                <ul className="space-y-2.5 text-gray-400 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </nav>

              <nav aria-label="Account links">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-300 mb-4">Account</h4>
                <ul className="space-y-2.5 text-gray-400 text-sm">
                  <li><Link href="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><a href="mailto:support@eazyrentals.com" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="mailto:sales@eazyrentals.com" className="hover:text-white transition-colors">Sales Enquiry</a></li>
                </ul>
              </nav>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <div>&copy; {new Date().getFullYear()} EazyRentals. All rights reserved.</div>
              <div className="flex items-center gap-5">
                <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                <Link href="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
