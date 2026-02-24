'use client';

import React from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Payment } from '@/types';
import { demoData } from '@/lib/mockData';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RecentPaymentsProps {
  payments?: Payment[];
}

export default function RecentPayments({ payments }: RecentPaymentsProps) {
  const recentPayments = payments || demoData.payments.slice(0, 5);

  const getTenantName = (tenantId: string) => {
    const tenant = demoData.tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getPropertyName = (propertyId: string) => {
    const property = demoData.properties.find(p => p.id === propertyId);
    return property ? property.title : 'Unknown Property';
  };

  return (
    <Card>
      <CardHeader
        title="Recent Payments"
        action={
          <Link
            href="/payments"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
      
      <div className="space-y-4">
        {recentPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">
                  {getInitials(getTenantName(payment.tenantId), '')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {getTenantName(payment.tenantId)}
                </p>
                <p className="text-xs text-slate-500">
                  {getPropertyName(payment.propertyId)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {formatCurrency(payment.amount)}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={payment.status} size="sm" />
                <span className="text-xs text-slate-400">
                  {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.dueDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
