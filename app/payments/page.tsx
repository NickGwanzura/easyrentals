'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRequireAuth, usePayments } from '@/lib/auth/context';
import { usePermission } from '@/lib/auth/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Payment, PaymentStatus, PaymentType } from '@/types';
import { demoData } from '@/lib/mockData';

export default function PaymentsPage() {
  const { user } = useRequireAuth(['admin', 'landlord', 'tenant']);
  const { canRecordPayments } = usePermission();
  const payments = usePayments();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'all'>('all');

  if (!user) return null;

  const filteredPayments = payments.filter(payment => {
    const tenant = demoData.tenants.find(t => t.id === payment.tenantId);
    const matchesSearch = tenant ? 
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) :
      false;
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOutstanding = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const getTenantName = (tenantId: string) => {
    const tenant = demoData.tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getPropertyName = (propertyId: string) => {
    const property = demoData.properties.find(p => p.id === propertyId);
    return property ? property.title : 'Unknown Property';
  };

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
            <p className="text-slate-500 mt-1">Track rent payments and financials</p>
          </div>
          {canRecordPayments && (
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Record Payment
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={CreditCard}
            label="Total Payments"
            value={payments.length}
            color="bg-primary-100 text-primary-600"
          />
          <StatCard 
            icon={CheckCircle2}
            label="Total Collected"
            value={formatCurrency(totalPaid)}
            color="bg-success-100 text-success-600"
          />
          <StatCard 
            icon={AlertCircle}
            label="Outstanding"
            value={formatCurrency(totalOutstanding)}
            color="bg-danger-100 text-danger-600"
          />
          <StatCard 
            icon={Clock}
            label="Pending"
            value={payments.filter(p => p.status === 'pending').length}
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
                placeholder="Search by tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PaymentType | 'all')}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="rent">Rent</option>
                <option value="deposit">Deposit</option>
                <option value="late_fee">Late Fee</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Period</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-900">{getTenantName(payment.tenantId)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600">{getPropertyName(payment.propertyId)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600 capitalize">
                        {payment.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600">
                        {new Date(payment.paymentForYear, payment.paymentForMonth - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-slate-600">{formatDate(payment.dueDate)}</p>
                      {payment.paidDate && (
                        <p className="text-xs text-success-600">Paid {formatDate(payment.paidDate)}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No payments found</h3>
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
  value: string | number;
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
