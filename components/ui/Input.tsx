'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, leftIcon, rightIcon, type = 'text', ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = errorId || helperId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              error
                ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-slate-200 hover:border-slate-300',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-danger-600">{error}</p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
