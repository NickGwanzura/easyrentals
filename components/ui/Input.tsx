'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

// Input props interface - use a different name for size to avoid conflict
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // Legacy size prop
  size?: 'sm' | 'md' | 'lg';
}

/**
 * IBM Carbon Design System Input Component
 * 
 * Features:
 * - Label support (visible or hidden)
 * - Helper text
 * - Error state
 * - Disabled state
 * - Icon support (left/right)
 * - Three sizes: sm (32px), md (40px), lg (48px)
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      isInvalid = false,
      isDisabled = false,
      inputSize,
      size,
      hideLabel = false,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = isInvalid || !!error;
    
    // Support both inputSize and legacy size prop
    const finalSize = inputSize ?? size ?? 'md';

    // Carbon input sizes (height-based)
    const sizes = {
      sm: 'h-8 px-3 text-body-compact-01',
      md: 'h-10 px-4 text-body-01',
      lg: 'h-12 px-4 text-body-01',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && !hideLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-heading-compact-01 text-cds-text-primary mb-1',
              isDisabled && 'text-cds-text-disabled'
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 text-cds-icon-secondary pl-4',
              iconSizes[finalSize]
            )}>
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            disabled={isDisabled}
            className={cn(
              // Base styles
              'w-full bg-cds-layer-01 text-cds-text-primary',
              'border-0 border-b-2',
              'transition-all duration-fast-01',
              'focus:outline-none focus-visible:ring-0',
              'placeholder:text-cds-text-placeholder',
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Size styles
              sizes[finalSize],
              // State styles
              hasError
                ? 'border-cds-support-error focus:border-cds-support-error'
                : 'border-cds-border-strong-01 focus:border-cds-border-interactive',
              isDisabled && 'bg-cds-background text-cds-text-disabled cursor-not-allowed border-b-0',
              // Hover state (only when not disabled/error)
              !isDisabled && !hasError && 'hover:border-cds-border-strong-01'
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 text-cds-icon-secondary pr-4',
              iconSizes[finalSize]
            )}>
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <div
            className={cn(
              'mt-2 text-legal-01',
              hasError ? 'text-cds-support-error' : 'text-cds-text-helper'
            )}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

// TextArea component
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  hideLabel?: boolean;
  rows?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      error,
      isInvalid = false,
      isDisabled = false,
      hideLabel = false,
      rows = 4,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = isInvalid || !!error;

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && !hideLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-heading-compact-01 text-cds-text-primary mb-1',
              isDisabled && 'text-cds-text-disabled'
            )}
          >
            {label}
          </label>
        )}

        {/* TextArea Field */}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={isDisabled}
          className={cn(
            // Base styles
            'w-full min-h-[4rem] p-4 bg-cds-layer-01 text-cds-text-primary',
            'border-0 border-b-2',
            'resize-y transition-all duration-fast-01',
            'focus:outline-none focus-visible:ring-0',
            'placeholder:text-cds-text-placeholder',
            // State styles
            hasError
              ? 'border-cds-support-error focus:border-cds-support-error'
              : 'border-cds-border-strong-01 focus:border-cds-border-interactive',
            isDisabled && 'bg-cds-background text-cds-text-disabled cursor-not-allowed border-b-0',
            // Hover state
            !isDisabled && !hasError && 'hover:border-cds-border-strong-01'
          )}
          {...props}
        />

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <div
            className={cn(
              'mt-2 text-legal-01',
              hasError ? 'text-cds-support-error' : 'text-cds-text-helper'
            )}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
