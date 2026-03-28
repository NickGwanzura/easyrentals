'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Support both old and new variant names for backward compatibility
type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'ghost' 
  | 'danger' 
  | 'danger-secondary'
  // Legacy variants mapped to Carbon
  | 'outline'
  | 'success';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isIconOnly?: boolean;
}

/**
 * IBM Carbon Design System Button Component
 * 
 * Variants:
 * - primary: Blue background, white text (default)
 * - secondary: Gray background, white text
 * - tertiary: Transparent with blue border and text
 * - ghost: Transparent with blue text
 * - danger: Red background, white text
 * - danger-secondary: Transparent with red border and text
 * - outline: (Legacy) Maps to tertiary
 * - success: (Legacy) Maps to primary with green styling
 * 
 * Sizes:
 * - xs: 24px height (icon only)
 * - sm: 32px height
 * - md: 40px height (default)
 * - lg: 48px height
 * - xl: 64px height
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      isIconOnly = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Map legacy variants to Carbon variants
    const mappedVariant: Exclude<ButtonVariant, 'outline' | 'success'> = 
      variant === 'outline' ? 'tertiary' :
      variant === 'success' ? 'primary' :
      variant;

    // IBM Carbon button base styles
    const baseStyles = `
      inline-flex items-center justify-center
      font-carbon font-semibold text-sm tracking-wide
      border-0 transition-all duration-fast-02
      focus:outline-none focus-visible:ring-2 focus-visible:ring-focus
      disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-cds-button-disabled disabled:text-cds-text-disabled
      active:scale-[0.98]
    `;

    // Carbon button variants (with legacy color support)
    const variants = {
      primary: `
        bg-cds-button-primary text-white
        hover:bg-cds-button-primary-hover
        active:bg-carbon-blue-80
      `,
      secondary: `
        bg-cds-button-secondary text-white
        hover:bg-cds-button-secondary-hover
        active:bg-carbon-gray-60
      `,
      tertiary: `
        bg-transparent text-cds-button-tertiary
        border border-cds-button-tertiary
        hover:bg-carbon-blue-10 hover:border-cds-button-primary-hover
        active:bg-carbon-blue-20
      `,
      ghost: `
        bg-transparent text-cds-link-primary
        hover:bg-cds-background-hover
        active:bg-cds-background-active
      `,
      danger: `
        bg-cds-button-danger text-white
        hover:bg-cds-button-danger-hover
        active:bg-carbon-red-80
      `,
      'danger-secondary': `
        bg-transparent text-cds-button-danger
        border border-cds-button-danger
        hover:bg-carbon-red-10 hover:border-cds-button-danger-hover
        active:bg-carbon-red-20
      `,
    };

    // Carbon button sizes (following Carbon's scale)
    const sizes = {
      xs: isIconOnly ? 'w-6 h-6' : 'h-6 px-3 text-xs',
      sm: isIconOnly ? 'w-8 h-8' : 'h-8 px-4',
      md: isIconOnly ? 'w-10 h-10' : 'h-10 px-4',
      lg: isIconOnly ? 'w-12 h-12' : 'h-12 px-4',
      xl: isIconOnly ? 'w-16 h-16' : 'h-16 px-4 text-base',
    };

    // Gap between icon and text
    const iconGap = isIconOnly ? '' : 'gap-2';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[mappedVariant],
          sizes[size],
          iconGap,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-cds-rotate" />}
        {!isLoading && leftIcon}
        {!isIconOnly && children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
