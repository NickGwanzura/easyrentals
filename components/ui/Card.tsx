'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, className, padding = 'md', shadow = 'md', hover = false, ...props },
    ref
  ) => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-card',
      lg: 'shadow-elevated',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl border border-slate-100',
          paddings[padding],
          shadows[shadow],
          hover && 'card-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

// CardHeader Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between mb-4', className)}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-lg font-semibold text-slate-900 truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// CardContent Component
export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

// CardFooter Component
export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between mt-6 pt-4 border-t border-slate-100', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
