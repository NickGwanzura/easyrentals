'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  Globe, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Palette,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useBranding } from '@/lib/branding/context';
import { useAuth } from '@/lib/auth/context';
import { createCompany, isSlugAvailable } from '@/lib/whitelabel/company-service';

const steps = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'admin', label: 'Admin', icon: User },
  { id: 'complete', label: 'Complete', icon: Check },
];

export default function CompanySignupPage() {
  const router = useRouter();
  const { branding } = useBranding();
  const { user, isAuthenticated, isDemoMode, refreshCompanies } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    slug: '',
    customDomain: '',
    primaryColor: '#2563eb',
    logoUrl: '',
    adminName: '',
    adminEmail: '',
  });
  
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | null>(null);

  useEffect(() => {
    if (!user) return;

    setFormData(prev => ({
      ...prev,
      adminName: prev.adminName || `${user.firstName} ${user.lastName}`.trim(),
      adminEmail: prev.adminEmail || user.email,
    }));
  }, [user]);

  const handleSlugChange = async (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, slug: cleanSlug }));
    
    if (cleanSlug.length >= 3) {
      setSlugStatus('checking');
      const available = await isSlugAvailable(cleanSlug);
      setSlugStatus(available ? 'available' : 'taken');
    } else {
      setSlugStatus(null);
    }
  };

  const handleNext = () => {
    setError('');
    
    // Validate current step
    if (currentStep === 0) {
      if (!formData.companyName || formData.companyName.length < 2) {
        setError('Company name is required');
        return;
      }
      if (!formData.slug || formData.slug.length < 3) {
        setError('Subdomain is required (min 3 characters)');
        return;
      }
      if (slugStatus !== 'available') {
        setError('Please choose an available subdomain');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.adminName || !formData.adminEmail) {
        setError('Your signed-in admin account details are required');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!isAuthenticated || !user || isDemoMode) {
        throw new Error('Sign in with a real account before creating a company.');
      }

      // Create company
      const company = await createCompany({
        name: formData.companyName,
        slug: formData.slug,
        custom_domain: formData.customDomain || undefined,
        primary_color: formData.primaryColor,
        logo_url: formData.logoUrl || undefined,
        owner_id: user.id,
      });
      
      if (!company) {
        throw new Error('Failed to create company');
      }
      
      // Success - redirect to login
      await refreshCompanies();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create company');
      setIsLoading(false);
    }
  };

  const { colors } = branding;

  if (!isAuthenticated || !user || isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.background }}>
        <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-lg" style={{ borderColor: `${colors.secondary}15` }}>
          <h1 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
            Create your admin account first
          </h1>
          <p className="mb-6" style={{ color: colors.textMuted }}>
            Company creation is now limited to signed-in, non-demo accounts so ownership and tenant access can be assigned safely.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="flex-1">
              <Button className="w-full" style={{ backgroundColor: colors.primary }}>
                Create Account
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.background }}>
      {/* Left Side - Progress */}
      <div className="hidden lg:flex lg:w-80 flex-col border-r" style={{ backgroundColor: colors.surface, borderColor: `${colors.secondary}15` }}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: colors.text }}>
              {branding.agencyName}
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-6 py-8">
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={step.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: isActive ? `${colors.primary}10` : 'transparent',
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: isCompleted ? colors.primary : isActive ? `${colors.primary}20` : `${colors.secondary}15`,
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <step.icon 
                        className="w-4 h-4"
                        style={{ color: isActive ? colors.primary : colors.textMuted }}
                      />
                    )}
                  </div>
                  <span 
                    className="font-medium"
                    style={{ 
                      color: isActive ? colors.primary : isCompleted ? colors.text : colors.textMuted 
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </nav>
        
        <div className="p-6 border-t" style={{ borderColor: `${colors.secondary}15` }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: colors.primary }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.primary }}
              >
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                Create Your Company
              </h1>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-lg border p-8" style={{ borderColor: `${colors.secondary}15` }}>
              {error && (
                <div className="mb-6 p-4 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#fef2f2' }}>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                      Company Information
                    </h2>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Tell us about your property management company
                    </p>
                  </div>

                  <Input
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Acme Property Management"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      Subdomain
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="acme"
                        className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: `${colors.secondary}30` }}
                      />
                      <div 
                        className="px-3 py-2 border border-l-0 rounded-r-lg text-sm"
                        style={{ backgroundColor: colors.background, borderColor: `${colors.secondary}30`, color: colors.textMuted }}
                      >
                        .{branding.agencyName.toLowerCase().replace(/\s/g, '')}.com
                      </div>
                    </div>
                    {slugStatus === 'checking' && (
                      <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Checking availability...</p>
                    )}
                    {slugStatus === 'available' && (
                      <p className="text-sm mt-1 text-green-600">✓ Available</p>
                    )}
                    {slugStatus === 'taken' && (
                      <p className="text-sm mt-1 text-red-600">✗ Already taken</p>
                    )}
                  </div>

                  <Input
                    label="Custom Domain (Optional)"
                    value={formData.customDomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                    placeholder="properties.acme.com"
                    leftIcon={<Globe className="w-5 h-5" />}
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                      Branding
                    </h2>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Customize your company&apos;s look and feel
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-12 rounded-lg cursor-pointer border"
                        style={{ borderColor: `${colors.secondary}30` }}
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  <Input
                    label="Logo URL (Optional)"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://your-cdn.com/logo.png"
                  />

                  {/* Preview */}
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: colors.background, borderColor: `${colors.secondary}15` }}
                  >
                    <p className="text-sm font-medium mb-3" style={{ color: colors.textMuted }}>Preview</p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        {formData.logoUrl ? (
                          <Image
                            src={formData.logoUrl}
                            alt={`${formData.companyName || 'Company'} logo preview`}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="font-semibold" style={{ color: colors.text }}>
                        {formData.companyName || 'Your Company'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                      Admin Account
                    </h2>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      The signed-in account below will own and administer this company.
                    </p>
                  </div>

                  <Input
                    label="Full Name"
                    value={formData.adminName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    placeholder="John Doe"
                    leftIcon={<User className="w-5 h-5" />}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="admin@company.com"
                    leftIcon={<Mail className="w-5 h-5" />}
                    required
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-8">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${colors.primary}15` }}
                  >
                    <Check className="w-8 h-8" style={{ color: colors.primary }} />
                  </div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                    Ready to Launch!
                  </h2>
                  <p className="mb-6" style={{ color: colors.textMuted }}>
                    Your company <strong>{formData.companyName}</strong> is ready to go.
                  </p>
                  <div className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
                    <p>• Subdomain: <strong>{formData.slug}</strong></p>
                    <p>• Primary Color: <strong>{formData.primaryColor}</strong></p>
                    <p>• Admin: <strong>{formData.adminEmail}</strong></p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: `${colors.secondary}15` }}>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    style={{ backgroundColor: colors.primary }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    rightIcon={<Check className="w-4 h-4" />}
                    style={{ backgroundColor: colors.primary }}
                  >
                    Create Company
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
