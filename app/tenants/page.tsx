'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth, useTenants } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  Home,
  CreditCard,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Tenant, TenantStatus } from '@/types';
import { demoData } from '@/lib/mockData';

export default function TenantsPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'agent']);
  const { canManageTenants } = usePermission();
  const tenants = useTenants();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');

  if (!user) return null;

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPropertyName = (propertyId?: string) => {
    if (!propertyId) return 'No property assigned';
    const property = demoData.properties.find(p => p.id === propertyId);
    return property ? property.title : 'Unknown Property';
  };

  return (
    <DashboardLayout title="Tenants">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tenants</h1>
            <p className="text-slate-500 mt-1">Manage your tenants and their leases</p>
          </div>
          {canManageTenants && (
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Tenant
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            icon={User}
            label="Total Tenants"
            value={tenants.length}
            color="bg-primary-100 text-primary-600"
          />
          <StatCard 
            icon={CheckCircle2}
            label="Active"
            value={tenants.filter(t => t.status === 'active').length}
            color="bg-success-100 text-success-600"
          />
          <StatCard 
            icon={AlertCircle}
            label="Pending"
            value={tenants.filter(t => t.status === 'pending').length}
            color="bg-warning-100 text-warning-600"
          />
        </div>

        {/* Filters */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TenantStatus | 'all')}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="evicted">Evicted</option>
            </select>
          </div>
        </Card>

        {/* Tenants Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lease Period</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-700">
                            {getInitials(tenant.firstName, tenant.lastName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{tenant.firstName} {tenant.lastName}</p>
                          <p className="text-sm text-slate-500">{tenant.employmentStatus || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {tenant.email}
                        </p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {tenant.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-900 flex items-center gap-1">
                        <Home className="w-4 h-4 text-slate-400" />
                        {getPropertyName(tenant.currentPropertyId)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {tenant.leaseStartDate ? (
                        <div className="text-sm text-slate-600">
                          <p>{formatDate(tenant.leaseStartDate)}</p>
                          <p className="text-slate-400">to {formatDate(tenant.leaseEndDate || '')}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No active lease</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTenants.length === 0 && (
            <div className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No tenants found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: number;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  );
}
