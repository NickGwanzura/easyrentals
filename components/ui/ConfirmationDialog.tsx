'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: 'danger' | 'warning';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  variant = 'warning',
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-warning-100">
          <AlertTriangle className="h-5 w-5 text-warning-700" />
        </div>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </Modal>
  );
}
