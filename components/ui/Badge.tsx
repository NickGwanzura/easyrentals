'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import type { StatusType } from './StatusBadge';
import { StatusIndicator, StatusWithLabel } from './StatusBadge';

// Re-export StatusBadge for backward compatibility
export { StatusBadge, StatusIndicator, StatusWithLabel };
export type { StatusType };

export type BadgeType = 
  | 'gray'
  | 'red'
  | 'magenta'
  | 'purple'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'cool-gray'
  | 'warm-gray'
  // Legacy variant support
  | 'default'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeType;
  variant?: BadgeType; // Legacy alias for type
  size?: BadgeSize;
  className?: string;
  title?: string;
}

/**
 * IBM Carbon Design System Tag/Badge Component
 * 
 * Types: gray, red, magenta, purple, blue, cyan, teal, green, cool-gray, warm-gray
 * Sizes: sm (18px), md (24px)
 * 
 * Uses Carbon's tag color tokens for consistent theming
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  type,
  variant,
  size = 'md',
  className,
  title,
}) => {
  // Support both type and variant props
  const badgeType = type ?? variant ?? 'gray';
  
  // Carbon tag colors with legacy mappings
  const typeStyles: Record<BadgeType, string> = {
    // Carbon types
    'gray': 'bg-carbon-gray-20 text-carbon-gray-100',
    'red': 'bg-carbon-red-20 text-carbon-red-100',
    'magenta': 'bg-carbon-magenta-20 text-carbon-magenta-100',
    'purple': 'bg-carbon-purple-20 text-carbon-purple-100',
    'blue': 'bg-carbon-blue-20 text-carbon-blue-100',
    'cyan': 'bg-carbon-cyan-20 text-carbon-cyan-100',
    'teal': 'bg-carbon-teal-20 text-carbon-teal-100',
    'green': 'bg-carbon-green-20 text-carbon-green-100',
    'cool-gray': 'bg-carbon-cool-gray-20 text-carbon-cool-gray-100',
    'warm-gray': 'bg-carbon-warm-gray-20 text-carbon-warm-gray-100',
    // Legacy type mappings
    'default': 'bg-carbon-gray-20 text-carbon-gray-100',
    'secondary': 'bg-carbon-cool-gray-20 text-carbon-cool-gray-100',
    'outline': 'bg-transparent border border-carbon-gray-50 text-carbon-gray-100',
    'danger': 'bg-carbon-red-20 text-carbon-red-100',
    'warning': 'bg-carbon-yellow-20 text-carbon-yellow-100',
    'success': 'bg-carbon-green-20 text-carbon-green-100',
    'info': 'bg-carbon-blue-20 text-carbon-blue-100',
  };

  // Carbon tag sizes
  const sizeStyles: Record<BadgeSize, string> = {
    'sm': 'min-h-[1.125rem] px-2 text-legal-01',
    'md': 'min-h-6 px-3 text-body-compact-01',
    'lg': 'min-h-8 px-4 text-body-01',
  };

  return (
    <span
      title={title}
      className={cn(
        // Base Carbon tag styles
        'inline-flex items-center',
        'font-carbon font-normal',
        'border-0',
        'transition-colors duration-fast-01',
        // Type and size
        typeStyles[badgeType],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

// Filter Tag variant for removable tags
interface FilterTagProps extends BadgeProps {
  onRemove?: () => void;
}

export const FilterTag: React.FC<FilterTagProps> = ({
  children,
  type = 'gray',
  variant,
  size = 'md',
  className,
  onRemove,
  ...props
}) => {
  const badgeType = type ?? variant ?? 'gray';
  
  const typeStyles: Record<BadgeType, string> = {
    'gray': 'bg-carbon-gray-20 text-carbon-gray-100 hover:bg-carbon-gray-30',
    'red': 'bg-carbon-red-20 text-carbon-red-100 hover:bg-carbon-red-30',
    'magenta': 'bg-carbon-magenta-20 text-carbon-magenta-100 hover:bg-carbon-magenta-30',
    'purple': 'bg-carbon-purple-20 text-carbon-purple-100 hover:bg-carbon-purple-30',
    'blue': 'bg-carbon-blue-20 text-carbon-blue-100 hover:bg-carbon-blue-30',
    'cyan': 'bg-carbon-cyan-20 text-carbon-cyan-100 hover:bg-carbon-cyan-30',
    'teal': 'bg-carbon-teal-20 text-carbon-teal-100 hover:bg-carbon-teal-30',
    'green': 'bg-carbon-green-20 text-carbon-green-100 hover:bg-carbon-green-30',
    'cool-gray': 'bg-carbon-cool-gray-20 text-carbon-cool-gray-100 hover:bg-carbon-cool-gray-30',
    'warm-gray': 'bg-carbon-warm-gray-20 text-carbon-warm-gray-100 hover:bg-carbon-warm-gray-30',
    // Legacy
    'default': 'bg-carbon-gray-20 text-carbon-gray-100 hover:bg-carbon-gray-30',
    'secondary': 'bg-carbon-cool-gray-20 text-carbon-cool-gray-100 hover:bg-carbon-cool-gray-30',
    'outline': 'bg-transparent border border-carbon-gray-50 text-carbon-gray-100 hover:bg-carbon-gray-10',
    'danger': 'bg-carbon-red-20 text-carbon-red-100 hover:bg-carbon-red-30',
    'warning': 'bg-carbon-yellow-20 text-carbon-yellow-100 hover:bg-carbon-yellow-30',
    'success': 'bg-carbon-green-20 text-carbon-green-100 hover:bg-carbon-green-30',
    'info': 'bg-carbon-blue-20 text-carbon-blue-100 hover:bg-carbon-blue-30',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    'sm': 'min-h-[1.125rem] pl-2 pr-1 text-legal-01 gap-1',
    'md': 'min-h-6 pl-3 pr-2 text-body-compact-01 gap-2',
    'lg': 'min-h-8 pl-4 pr-3 text-body-01 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'font-carbon font-normal',
        'border-0',
        'transition-colors duration-fast-01',
        typeStyles[badgeType],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-current hover:bg-opacity-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label="Remove"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L4 4M4 4L1 7M4 4L7 7M4 4L7 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
