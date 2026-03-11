'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  // Unit statuses
  occupied: { label: 'Occupied', bgColor: 'bg-success-100', textColor: 'text-success-700' },
  vacant: { label: 'Vacant', bgColor: 'bg-warning-100', textColor: 'text-warning-700' },
  owner_occupied: { label: 'Owner Occupied', bgColor: 'bg-primary-100', textColor: 'text-primary-700' },
  
  // Levy statuses
  paid: { label: 'Paid', bgColor: 'bg-success-100', textColor: 'text-success-700' },
  partial: { label: 'Partial', bgColor: 'bg-warning-100', textColor: 'text-warning-700' },
  unpaid: { label: 'Unpaid', bgColor: 'bg-danger-100', textColor: 'text-danger-700' },
  
  // Estate statuses
  active: { label: 'Active', bgColor: 'bg-success-100', textColor: 'text-success-700' },
  inactive: { label: 'Inactive', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
  
  // Generic statuses
  pending: { label: 'Pending', bgColor: 'bg-warning-100', textColor: 'text-warning-700' },
  completed: { label: 'Completed', bgColor: 'bg-success-100', textColor: 'text-success-700' },
  cancelled: { label: 'Cancelled', bgColor: 'bg-danger-100', textColor: 'text-danger-700' },
  
  // Payment statuses
  successful: { label: 'Successful', bgColor: 'bg-success-100', textColor: 'text-success-700' },
  failed: { label: 'Failed', bgColor: 'bg-danger-100', textColor: 'text-danger-700' },
  
  // Lead statuses
  new: { label: 'New', bgColor: 'bg-primary-100', textColor: 'text-primary-700' },
  contacted: { label: 'Contacted', bgColor: 'bg-info-100', textColor: 'text-info-700' },
  viewing_scheduled: { label: 'Viewing Scheduled', bgColor: 'bg-warning-100', textColor: 'text-warning-700' },
  converted: { label: 'Converted', bgColor: 'bg-success-100', textColor: 'text-success-700' },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}
