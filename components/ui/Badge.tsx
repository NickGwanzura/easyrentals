'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'outline'
  | 'ghost';

type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  className,
  ...props
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border-danger-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    outline: 'bg-white text-slate-700 border-slate-200',
    ghost: 'bg-transparent text-slate-600',
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-slate-400',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-blue-500',
    outline: 'bg-slate-400',
    ghost: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            dotColor || dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;

// Status Badge for common status values
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const statusConfig: Record<string, BadgeVariant> = {
    // Property statuses
    vacant: 'default',
    occupied: 'success',
    maintenance: 'warning',
    inactive: 'ghost',
    
    // Tenant statuses
    active: 'success',
    pending: 'warning',
    inactive: 'default',
    evicted: 'danger',
    
    // Payment statuses
    paid: 'success',
    overdue: 'danger',
    partial: 'warning',
    failed: 'danger',
    
    // Lease statuses
    expired: 'default',
    terminated: 'danger',
    
    // Lead statuses
    new: 'info',
    contacted: 'primary',
    viewing_scheduled: 'warning',
    application_submitted: 'primary',
    approved: 'success',
    rejected: 'danger',
    converted: 'success',
    
    // Maintenance statuses
    reported: 'info',
    assigned: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger',
  };

  const variant = statusConfig[status.toLowerCase()] || 'default';
  
  return (
    <Badge variant={variant} {...props}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};
