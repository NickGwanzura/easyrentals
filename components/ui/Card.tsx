'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  layer?: '01' | '02' | '03';
  border?: boolean;
  hover?: boolean;
}

/**
 * IBM Carbon Design System Card Component
 * 
 * Uses Carbon's layering system for proper hierarchy:
 * - layer-01: Base layer (white theme: gray-10)
 * - layer-02: Second layer (white theme: white)
 * - layer-03: Third layer (white theme: gray-10)
 * 
 * Padding follows Carbon spacing scale
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, className, padding = 'md', layer = '01', border = false, hover = false, ...props },
    ref
  ) => {
    // Carbon spacing scale
    const paddings = {
      none: '',
      sm: 'p-3',   // spacing-05 (16px)
      md: 'p-4',   // spacing-06 (24px)
      lg: 'p-5',   // spacing-07 (32px)
    };

    // Carbon layer backgrounds
    const layers = {
      '01': 'bg-cds-layer-01',
      '02': 'bg-cds-layer-02',
      '03': 'bg-cds-layer-03',
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Carbon card styles
          layers[layer],
          paddings[padding],
          border && 'border border-cds-border-subtle',
          hover && 'transition-all duration-moderate-01 hover:shadow-cds-sm',
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
          <h3 className="text-heading-02 text-cds-text-primary">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-body-01 text-cds-text-secondary mt-1">{subtitle}</p>
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
    className={cn('flex items-center justify-between mt-6 pt-4 border-t border-cds-border-subtle', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
