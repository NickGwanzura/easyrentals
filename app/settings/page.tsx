'use client';

import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  const { user } = useRequireAuth();
  const { canManageSettings } = usePermission();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 animate-fade-in">
        <div>
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
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400'}`} />
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
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'billing' && canManageSettings && <BillingSettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

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
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.firstName} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary-700">
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
              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mt-0.5"
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
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors">
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
        <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary-900">Professional Plan</p>
              <p className="text-sm text-primary-700">$49/month - Billed monthly</p>
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
            <span className="px-2 py-1 bg-success-100 text-success-700 text-xs font-medium rounded">Default</span>
          </div>
          <Button variant="outline" size="sm">Add Payment Method</Button>
        </div>
      </Card>
    </div>
  );
}
