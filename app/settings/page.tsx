'use client';

import React, { useState, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  CreditCard,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Upload,
  Image as ImageIcon,
  RefreshCcw,
  FileText,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useBranding } from '@/lib/branding/context';
import { extractColorsFromImage, generateBrandColors } from '@/lib/branding/colorExtractor';
import { BrandColors } from '@/types/branding';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  const { user } = useRequireAuth();
  const { canManageSettings } = usePermission();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) return null;

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon 
                      className={`w-5 h-5 ${
                        activeTab === tab.id ? 'text-[var(--brand-primary)]' : 'text-slate-400'
                      }`} 
                    />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'company' && canManageSettings && <CompanySettings />}
            {activeTab === 'branding' && canManageSettings && <BrandingSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'billing' && canManageSettings && <BillingSettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// BRANDING SETTINGS COMPONENT
// ============================================================================

function BrandingSettings() {
  const { branding, updateBranding, updateLogo, applyColors, resetToDefaults } = useBranding();
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewColors, setPreviewColors] = useState<BrandColors | null>(null);
  const [activeSection, setActiveSection] = useState<'logo' | 'colors' | 'pdf'>('logo');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const base64Logo = await updateLogo(file);
      
      // Update branding with new logo
      await updateBranding({ logoUrl: base64Logo });

      // Auto-extract colors
      setIsExtracting(true);
      const extracted = await extractColorsFromImage(base64Logo);
      const brandColors = generateBrandColors(extracted);
      
      await updateBranding({ colors: brandColors });
      setPreviewColors(brandColors);
      setIsExtracting(false);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [updateBranding, updateLogo]);

  const handleColorChange = (colorKey: keyof BrandColors, value: string) => {
    const newColors = { ...branding.colors, [colorKey]: value };
    applyColors(newColors);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all branding to defaults?')) {
      resetToDefaults();
      setPreviewColors(null);
    }
  };

  const colors = previewColors || branding.colors;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card>
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: 'logo', label: 'Logo & Colors', icon: ImageIcon },
            { id: 'colors', label: 'Customize Colors', icon: Palette },
            { id: 'pdf', label: 'PDF Settings', icon: FileText },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeSection === 'logo' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Agency Logo</h3>
                <p className="text-sm text-slate-500">
                  Upload your logo. Colors will be automatically extracted and applied to your theme.
                </p>
              </div>

              {/* Logo Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--brand-primary)] hover:bg-slate-50 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                
                {branding.logoUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={branding.logoUrl} 
                      alt="Agency Logo" 
                      className="max-h-32 mx-auto object-contain"
                    />
                    <p className="text-sm text-slate-500">
                      Click to replace logo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Click to upload logo</p>
                      <p className="text-sm text-slate-500">PNG, JPG or SVG up to 5MB</p>
                    </div>
                  </div>
                )}

                {(isUploading || isExtracting) && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="w-5 h-5 animate-spin text-[var(--brand-primary)]" />
                      <span className="text-sm font-medium text-slate-700">
                        {isUploading ? 'Uploading...' : 'Extracting colors...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Agency Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Agency Name
                  </label>
                  <Input 
                    value={branding.agencyName}
                    onChange={(e) => updateBranding({ agencyName: e.target.value })}
                    placeholder="Your Agency Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tagline (Optional)
                  </label>
                  <Input 
                    value={branding.agencyTagline || ''}
                    onChange={(e) => updateBranding({ agencyTagline: e.target.value })}
                    placeholder="Your tagline"
                  />
                </div>
              </div>

              {/* Extracted Colors Preview */}
              {branding.logoUrl && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Extracted Colors</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(colors).slice(0, 5).map(([key, color]) => (
                      <div key={key} className="text-center">
                        <div 
                          className="w-full h-12 rounded-lg shadow-sm border border-slate-200 mb-1"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-xs font-mono text-slate-400">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Live Preview</h4>
                <div 
                  className="p-6 rounded-xl border"
                  style={{ backgroundColor: colors.background }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {branding.logoUrl && (
                      <img src={branding.logoUrl} alt="" className="h-10 object-contain" />
                    )}
                    <div>
                      <h5 style={{ color: colors.text }} className="font-bold">
                        {branding.agencyName}
                      </h5>
                      {branding.agencyTagline && (
                        <p style={{ color: colors.textMuted }} className="text-sm">
                          {branding.agencyTagline}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg font-medium text-sm border"
                      style={{ 
                        backgroundColor: colors.surface, 
                        color: colors.text,
                        borderColor: colors.secondary
                      }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={handleReset} leftIcon={<RefreshCcw className="w-4 h-4" />}>
                  Reset to Defaults
                </Button>
                <Button leftIcon={<Check className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'colors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Customize Colors</h3>
                <p className="text-sm text-slate-500">
                  Fine-tune your brand colors or enter custom hex codes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(branding.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof BrandColors, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                    />
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof BrandColors, e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded px-2 py-1 mt-1 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button leftIcon={<Save className="w-4 h-4" />}>
                  Save Colors
                </Button>
              </div>
            </div>
          )}

          {activeSection === 'pdf' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">PDF Branding</h3>
                <p className="text-sm text-slate-500">
                  Customize how your PDFs look when exported.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Show Logo on PDFs</p>
                    <p className="text-sm text-slate-500">Include your logo in exported PDFs</p>
                  </div>
                  <button
                    onClick={() => updateBranding({ showLogoOnPDFs: !branding.showLogoOnPDFs })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      branding.showLogoOnPDFs ? 'bg-[var(--brand-primary)]' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      branding.showLogoOnPDFs ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PDF Header Text (Optional)
                  </label>
                  <Input 
                    value={branding.pdfHeaderText || ''}
                    onChange={(e) => updateBranding({ pdfHeaderText: e.target.value })}
                    placeholder="e.g., Confidential - Property Management Report"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PDF Footer Text (Optional)
                  </label>
                  <Input 
                    value={branding.pdfFooterText || ''}
                    onChange={(e) => updateBranding({ pdfFooterText: e.target.value })}
                    placeholder="e.g., Generated by EazyRentals"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Sender Name
                  </label>
                  <Input 
                    value={branding.emailSenderName}
                    onChange={(e) => updateBranding({ emailSenderName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Sender Address
                  </label>
                  <Input 
                    type="email"
                    value={branding.emailSenderEmail}
                    onChange={(e) => updateBranding({ emailSenderEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button leftIcon={<Save className="w-4 h-4" />}>
                  Save PDF Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
// OTHER SETTINGS COMPONENTS (kept from original)
// ============================================================================

function ProfileSettings({ user }: { user: any }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader title="Profile Information" subtitle="Update your personal details" />
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--brand-primary)' + '20' }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span 
                className="text-2xl font-bold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <Button variant="outline" size="sm">Change Avatar</Button>
            <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="First Name" defaultValue={user.firstName} />
          <Input label="Last Name" defaultValue={user.lastName} />
          <Input label="Email" type="email" defaultValue={user.email} leftIcon={<Mail className="w-5 h-5" />} />
          <Input label="Phone" type="tel" defaultValue={user.phone || ''} leftIcon={<Phone className="w-5 h-5" />} />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CompanySettings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader title="Company Information" subtitle="Manage your company details" />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Company Name" defaultValue="EazyRentals LLC" />
          <Input label="Website" type="url" defaultValue="https://eazyrentals.com" leftIcon={<Globe className="w-5 h-5" />} />
          <Input label="Email" type="email" defaultValue="contact@eazyrentals.com" leftIcon={<Mail className="w-5 h-5" />} />
          <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" leftIcon={<Phone className="w-5 h-5" />} />
          <div className="md:col-span-2">
            <Input label="Address" defaultValue="123 Business Street" leftIcon={<MapPin className="w-5 h-5" />} />
          </div>
          <Input label="City" defaultValue="New York" />
          <Input label="State" defaultValue="NY" />
          <Input label="ZIP Code" defaultValue="10001" />
          <Input label="Country" defaultValue="United States" />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader title="Notification Preferences" subtitle="Choose how you want to be notified" />
      <div className="space-y-4">
        {[
          { id: 'email', label: 'Email Notifications', desc: 'Receive updates via email', checked: true },
          { id: 'sms', label: 'SMS Notifications', desc: 'Receive updates via text message', checked: false },
          { id: 'payments', label: 'Payment Alerts', desc: 'Get notified about payments', checked: true },
          { id: 'maintenance', label: 'Maintenance Requests', desc: 'Get notified about maintenance', checked: true },
          { id: 'leases', label: 'Lease Updates', desc: 'Get notified about lease changes', checked: true },
        ].map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id={item.id}
              defaultChecked={item.checked}
              className="w-5 h-5 rounded border-slate-300 mt-0.5"
              style={{ accentColor: 'var(--brand-primary)' }}
            />
            <div className="flex-1">
              <label htmlFor={item.id} className="font-medium text-slate-900 cursor-pointer">
                {item.label}
              </label>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button leftIcon={<Save className="w-4 h-4" />}>
            Save Preferences
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Change Password" subtitle="Update your password regularly for security" />
        <div className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <div className="flex justify-end">
            <Button>Update Password</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security" />
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">Enable 2FA</p>
            <p className="text-sm text-slate-500">Secure your account with two-factor authentication</p>
          </div>
          <button 
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </button>
        </div>
      </Card>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Subscription Plan" subtitle="Manage your subscription" />
        <div 
          className="p-4 border rounded-lg"
          style={{ backgroundColor: 'var(--brand-primary)' + '10', borderColor: 'var(--brand-primary)' + '30' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold" style={{ color: 'var(--brand-primary)' }}>Professional Plan</p>
              <p className="text-sm" style={{ color: 'var(--brand-primary)', opacity: 0.8 }}>$49/month - Billed monthly</p>
            </div>
            <Button variant="outline" size="sm">Change Plan</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Payment Method" subtitle="Manage your payment methods" />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-slate-800 rounded" />
              <div>
                <p className="font-medium text-slate-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-slate-500">Expires 12/25</p>
              </div>
            </div>
            <span 
              className="px-2 py-1 text-xs font-medium rounded"
              style={{ backgroundColor: 'var(--brand-primary)' + '20', color: 'var(--brand-primary)' }}
            >
              Default
            </span>
          </div>
          <Button variant="outline" size="sm">Add Payment Method</Button>
        </div>
      </Card>
    </div>
  );
}
