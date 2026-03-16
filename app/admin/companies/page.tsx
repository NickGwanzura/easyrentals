'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Home,
  Check,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useBranding } from '@/lib/branding/context';
import { useRequireAuth } from '@/lib/auth/context';
import { getAllCompanies, deleteCompany, type UpdateCompanyInput } from '@/lib/whitelabel/company-service';
import type { Company } from '@/lib/whitelabel/server';

export default function AdminCompaniesPage() {
  const { user } = useRequireAuth(['admin']);
  const { branding } = useBranding();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    const data = await getAllCompanies();
    setCompanies(data);
    setIsLoading(false);
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      await deleteCompany(companyId);
      await loadCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert('Failed to delete company');
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { colors } = branding;

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout title="Company Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Companies</h1>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Manage all tenant companies on the platform
            </p>
          </div>
          <Button 
            leftIcon={<Plus className="w-4 h-4" />}
            style={{ backgroundColor: colors.primary }}
            onClick={() => window.location.href = '/signup/company'}
          >
            Add Company
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
                <Building2 className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>{companies.length}</p>
                <p className="text-sm" style={{ color: colors.textMuted }}>Total Companies</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {companies.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm" style={{ color: colors.textMuted }}>Active</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                <span className="text-xl">🚀</span>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {companies.filter(c => c.subscription_tier === 'enterprise').length}
                </p>
                <p className="text-sm" style={{ color: colors.textMuted }}>Enterprise</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: `${colors.secondary}30` }}
            />
          </div>
        </Card>

        {/* Companies Table */}
        <Card>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: colors.primary }} />
              <p style={{ color: colors.textMuted }}>Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <p style={{ color: colors.text }}>No companies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: `${colors.secondary}15` }}>
                    <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textMuted }}>Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textMuted }}>Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textMuted }}>Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: colors.textMuted }}>Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: colors.textMuted }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: `${colors.secondary}10` }}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${company.primary_color}15` }}
                          >
                            {company.logo_url ? (
                              <Image
                                src={company.logo_url}
                                alt={`${company.name} logo`}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <Building2 className="w-5 h-5" style={{ color: company.primary_color }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: colors.text }}>{company.name}</p>
                            <p className="text-sm" style={{ color: colors.textMuted }}>{company.slug}.eazyrentals.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ 
                            backgroundColor: company.status === 'active' ? '#dcfce7' : '#fee2e2',
                            color: company.status === 'active' ? '#166534' : '#991b1b'
                          }}
                        >
                          {company.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                          style={{ 
                            backgroundColor: company.subscription_tier === 'enterprise' ? '#fef3c7' : 
                                            company.subscription_tier === 'pro' ? '#dbeafe' : '#f3f4f6',
                            color: company.subscription_tier === 'enterprise' ? '#92400e' :
                                   company.subscription_tier === 'pro' ? '#1e40af' : '#374151'
                          }}
                        >
                          {company.subscription_tier}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm" style={{ color: colors.textMuted }}>
                        {new Date(company.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://${company.slug}.eazyrentals.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            style={{ color: colors.textMuted }}
                            title="Open site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowEditModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            style={{ color: colors.textMuted }}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
