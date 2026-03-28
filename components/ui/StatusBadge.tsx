'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Extended status types to support common application statuses
export type StatusType = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'neutral' 
  | 'in-progress'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'active'
  | 'inactive'
  | 'vacant'
  | 'occupied'
  | 'owner_occupied'
  | 'under_construction'
  | 'archived'
  | 'evicted'
  | 'maintenance'
  | 'paid'
  | 'unpaid'
  | 'partial'
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost'
  | string; // Allow any string for flexibility

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md'; // Legacy support
}

/**
 * IBM Carbon Design System Status Badge Component
 * 
 * Uses Carbon's status indicators and semantic colors
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
  showIcon = true,
  size,
}) => {
  // Extended Carbon status color mapping
  const statusStyles: Record<string, { bg: string; text: string; icon: string; dot: string }> = {
    'success': {
      bg: 'bg-carbon-green-20',
      text: 'text-carbon-green-100',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'warning': {
      bg: 'bg-carbon-yellow-20',
      text: 'text-carbon-yellow-100',
      icon: 'text-carbon-yellow-50',
      dot: 'bg-carbon-yellow-40',
    },
    'error': {
      bg: 'bg-carbon-red-20',
      text: 'text-carbon-red-100',
      icon: 'text-carbon-red-60',
      dot: 'bg-carbon-red-50',
    },
    'info': {
      bg: 'bg-carbon-blue-20',
      text: 'text-carbon-blue-100',
      icon: 'text-carbon-blue-60',
      dot: 'bg-carbon-blue-50',
    },
    'neutral': {
      bg: 'bg-carbon-gray-20',
      text: 'text-carbon-gray-100',
      icon: 'text-carbon-gray-60',
      dot: 'bg-carbon-gray-50',
    },
    'in-progress': {
      bg: 'bg-carbon-blue-10',
      text: 'text-carbon-blue-90',
      icon: 'text-carbon-blue-60',
      dot: 'bg-carbon-blue-60',
    },
    'pending': {
      bg: 'bg-carbon-yellow-10',
      text: 'text-carbon-yellow-90',
      icon: 'text-carbon-yellow-50',
      dot: 'bg-carbon-yellow-40',
    },
    'completed': {
      bg: 'bg-carbon-green-10',
      text: 'text-carbon-green-90',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'cancelled': {
      bg: 'bg-carbon-gray-10',
      text: 'text-carbon-gray-90',
      icon: 'text-carbon-gray-60',
      dot: 'bg-carbon-gray-50',
    },
    'active': {
      bg: 'bg-carbon-green-20',
      text: 'text-carbon-green-100',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'inactive': {
      bg: 'bg-carbon-gray-20',
      text: 'text-carbon-gray-100',
      icon: 'text-carbon-gray-60',
      dot: 'bg-carbon-gray-50',
    },
    'vacant': {
      bg: 'bg-carbon-blue-20',
      text: 'text-carbon-blue-100',
      icon: 'text-carbon-blue-60',
      dot: 'bg-carbon-blue-50',
    },
    'occupied': {
      bg: 'bg-carbon-green-20',
      text: 'text-carbon-green-100',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'owner_occupied': {
      bg: 'bg-carbon-purple-20',
      text: 'text-carbon-purple-100',
      icon: 'text-carbon-purple-60',
      dot: 'bg-carbon-purple-50',
    },
    'under_construction': {
      bg: 'bg-carbon-yellow-20',
      text: 'text-carbon-yellow-100',
      icon: 'text-carbon-yellow-50',
      dot: 'bg-carbon-yellow-40',
    },
    'archived': {
      bg: 'bg-carbon-gray-10',
      text: 'text-carbon-gray-90',
      icon: 'text-carbon-gray-60',
      dot: 'bg-carbon-gray-50',
    },
    'evicted': {
      bg: 'bg-carbon-red-20',
      text: 'text-carbon-red-100',
      icon: 'text-carbon-red-60',
      dot: 'bg-carbon-red-50',
    },
    'maintenance': {
      bg: 'bg-carbon-orange-20',
      text: 'text-carbon-orange-100',
      icon: 'text-carbon-orange-60',
      dot: 'bg-carbon-orange-50',
    },
    'paid': {
      bg: 'bg-carbon-green-20',
      text: 'text-carbon-green-100',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'unpaid': {
      bg: 'bg-carbon-red-20',
      text: 'text-carbon-red-100',
      icon: 'text-carbon-red-60',
      dot: 'bg-carbon-red-50',
    },
    'partial': {
      bg: 'bg-carbon-yellow-20',
      text: 'text-carbon-yellow-100',
      icon: 'text-carbon-yellow-50',
      dot: 'bg-carbon-yellow-40',
    },
    'new': {
      bg: 'bg-carbon-blue-20',
      text: 'text-carbon-blue-100',
      icon: 'text-carbon-blue-60',
      dot: 'bg-carbon-blue-50',
    },
    'contacted': {
      bg: 'bg-carbon-teal-20',
      text: 'text-carbon-teal-100',
      icon: 'text-carbon-teal-60',
      dot: 'bg-carbon-teal-50',
    },
    'qualified': {
      bg: 'bg-carbon-green-20',
      text: 'text-carbon-green-100',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'converted': {
      bg: 'bg-carbon-green-30',
      text: 'text-carbon-green-100',
      icon: 'text-carbon-green-60',
      dot: 'bg-carbon-green-50',
    },
    'lost': {
      bg: 'bg-carbon-gray-20',
      text: 'text-carbon-gray-100',
      icon: 'text-carbon-gray-60',
      dot: 'bg-carbon-gray-50',
    },
  };

  const styles = statusStyles[status] || statusStyles.neutral;

  const sizeStyles = size === 'sm' 
    ? 'min-h-[1.125rem] px-2 text-legal-01' 
    : 'min-h-6 px-3 py-1 text-body-compact-01';

  return (
    <span
      className={cn(
        // Carbon status badge styles
        'inline-flex items-center gap-2',
        'font-carbon',
        'border-0',
        // Status colors
        styles.bg,
        styles.text,
        sizeStyles,
        className
      )}
    >
      {showIcon && (
        <span
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            styles.dot
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{children || status}</span>
    </span>
  );
};

export default StatusBadge;

// Compact status indicator (dot only with tooltip)
interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className,
}) => {
  const statusColors: Record<string, string> = {
    'success': 'bg-carbon-green-50',
    'warning': 'bg-carbon-yellow-40',
    'error': 'bg-carbon-red-50',
    'info': 'bg-carbon-blue-50',
    'neutral': 'bg-carbon-gray-50',
    'in-progress': 'bg-carbon-blue-60',
    'pending': 'bg-carbon-yellow-40',
    'completed': 'bg-carbon-green-50',
    'cancelled': 'bg-carbon-gray-50',
    'active': 'bg-carbon-green-50',
    'inactive': 'bg-carbon-gray-50',
    'vacant': 'bg-carbon-blue-50',
    'occupied': 'bg-carbon-green-50',
    'owner_occupied': 'bg-carbon-purple-50',
    'under_construction': 'bg-carbon-yellow-40',
    'archived': 'bg-carbon-gray-50',
    'evicted': 'bg-carbon-red-50',
    'maintenance': 'bg-carbon-orange-50',
    'paid': 'bg-carbon-green-50',
    'unpaid': 'bg-carbon-red-50',
    'partial': 'bg-carbon-yellow-40',
    'new': 'bg-carbon-blue-50',
    'contacted': 'bg-carbon-teal-50',
    'qualified': 'bg-carbon-green-50',
    'converted': 'bg-carbon-green-50',
    'lost': 'bg-carbon-gray-50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-3 h-3 rounded-full',
        statusColors[status] || statusColors.neutral,
        className
      )}
      title={label}
      aria-label={label}
    />
  );
};

// Status with label for tables
interface StatusWithLabelProps {
  status: StatusType;
  label: string;
  className?: string;
}

export const StatusWithLabel: React.FC<StatusWithLabelProps> = ({
  status,
  label,
  className,
}) => {
  const statusColors: Record<string, { dot: string; text: string }> = {
    'success': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'warning': { dot: 'bg-carbon-yellow-40', text: 'text-carbon-yellow-90' },
    'error': { dot: 'bg-carbon-red-50', text: 'text-carbon-red-80' },
    'info': { dot: 'bg-carbon-blue-50', text: 'text-carbon-blue-80' },
    'neutral': { dot: 'bg-carbon-gray-50', text: 'text-carbon-gray-80' },
    'in-progress': { dot: 'bg-carbon-blue-60', text: 'text-carbon-blue-80' },
    'pending': { dot: 'bg-carbon-yellow-40', text: 'text-carbon-yellow-90' },
    'completed': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'cancelled': { dot: 'bg-carbon-gray-50', text: 'text-carbon-gray-80' },
    'active': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'inactive': { dot: 'bg-carbon-gray-50', text: 'text-carbon-gray-80' },
    'vacant': { dot: 'bg-carbon-blue-50', text: 'text-carbon-blue-80' },
    'occupied': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'owner_occupied': { dot: 'bg-carbon-purple-50', text: 'text-carbon-purple-80' },
    'under_construction': { dot: 'bg-carbon-yellow-40', text: 'text-carbon-yellow-90' },
    'archived': { dot: 'bg-carbon-gray-50', text: 'text-carbon-gray-80' },
    'evicted': { dot: 'bg-carbon-red-50', text: 'text-carbon-red-80' },
    'maintenance': { dot: 'bg-carbon-orange-50', text: 'text-carbon-orange-80' },
    'paid': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'unpaid': { dot: 'bg-carbon-red-50', text: 'text-carbon-red-80' },
    'partial': { dot: 'bg-carbon-yellow-40', text: 'text-carbon-yellow-90' },
    'new': { dot: 'bg-carbon-blue-50', text: 'text-carbon-blue-80' },
    'contacted': { dot: 'bg-carbon-teal-50', text: 'text-carbon-teal-80' },
    'qualified': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'converted': { dot: 'bg-carbon-green-50', text: 'text-carbon-green-80' },
    'lost': { dot: 'bg-carbon-gray-50', text: 'text-carbon-gray-80' },
  };

  const colors = statusColors[status] || statusColors.neutral;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
      <span className={cn('text-body-01', colors.text)}>{label}</span>
    </div>
  );
};
