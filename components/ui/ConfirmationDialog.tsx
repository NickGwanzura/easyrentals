'use client';

import React from 'react';
import Modal, { ModalFooter } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  description?: string; // Legacy prop
  confirmText?: string;
  confirmLabel?: string; // Legacy prop
  cancelText?: string;
  cancelLabel?: string; // Legacy prop
  isLoading?: boolean;
  isDanger?: boolean;
  danger?: boolean; // Legacy prop
  variant?: 'default' | 'danger' | 'warning'; // Legacy prop
}

/**
 * IBM Carbon Design System Confirmation Dialog
 * 
 * A specialized modal for confirmation actions.
 * Uses danger styling for destructive actions.
 * 
 * Supports both new props (message, confirmText, cancelText, isDanger)
 * and legacy props (description, confirmLabel, cancelLabel, danger, variant)
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description, // Legacy fallback
  confirmText,
  confirmLabel, // Legacy fallback
  cancelText,
  cancelLabel, // Legacy fallback
  isLoading = false,
  isDanger = false,
  danger, // Legacy fallback
  variant, // Legacy fallback
}) => {
  // Handle legacy props
  const displayMessage = message ?? description ?? '';
  const displayConfirmText = confirmText ?? confirmLabel ?? 'Confirm';
  const displayCancelText = cancelText ?? cancelLabel ?? 'Cancel';
  const isDangerAction = isDanger || danger || variant === 'danger';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      danger={isDangerAction}
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={onConfirm}
          cancelText={displayCancelText}
          confirmText={displayConfirmText}
          isLoading={isLoading}
          danger={isDangerAction}
        />
      }
    >
      <div className="flex items-start gap-4">
        {isDangerAction && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-carbon-red-20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-cds-support-error" />
          </div>
        )}
        <p className="text-body-01 text-cds-text-secondary">{displayMessage}</p>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
