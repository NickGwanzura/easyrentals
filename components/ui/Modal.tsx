'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  preventCloseOnOverlayClick?: boolean;
  className?: string;
  showCloseButton?: boolean;
  danger?: boolean;
}

/**
 * IBM Carbon Design System Modal Component
 * 
 * Sizes:
 * - xs: 320px
 * - sm: 400px
 * - md: 544px (default)
 * - lg: 768px
 * - xl: 960px (legacy support)
 * 
 * Features:
 * - Focus trap
 * - Escape key close
 * - Portal rendering
 * - Accessible (ARIA)
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  preventCloseOnOverlayClick = false,
  className,
  showCloseButton = true,
  danger = false,
}) => {
  // Handle escape key
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventCloseOnOverlayClick) {
        onClose();
      }
    },
    [onClose, preventCloseOnOverlayClick]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventCloseOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Carbon modal sizes (with legacy xl support)
  const sizeStyles = {
    xs: 'max-w-[320px]',
    sm: 'max-w-[400px]',
    md: 'max-w-[544px]',
    lg: 'max-w-[768px]',
    xl: 'max-w-[960px]',
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-cds-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop / Overlay */}
      <div
        className="absolute inset-0 bg-cds-overlay transition-opacity duration-moderate-01"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className={cn(
          // Carbon modal container
          'relative w-full mx-4',
          'bg-cds-layer-01',
          'shadow-cds-lg',
          'animate-cds-fade-in',
          // Size
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div
            className={cn(
              'flex items-start justify-between px-4 pt-4 pb-3',
              danger && 'border-l-4 border-cds-support-error'
            )}
          >
            <h2
              id="modal-title"
              className="text-heading-03 text-cds-text-primary pr-8"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-cds-icon-secondary hover:text-cds-icon-primary hover:bg-cds-background-hover transition-colors duration-fast-01"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={cn(
            'px-4 pb-4',
            !title && 'pt-4',
            'text-body-01 text-cds-text-primary'
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-4 py-4 bg-cds-layer-01 border-t border-cds-border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render at document root
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default Modal;

// Pre-built footer actions for common use cases
interface ModalFooterProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  danger?: boolean;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Save',
  isLoading = false,
  danger = false,
}) => {
  return (
    <>
      {onCancel && (
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      )}
    </>
  );
};
