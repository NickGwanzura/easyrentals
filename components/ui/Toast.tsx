'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * IBM Carbon Design System Toast/Notification Component
 * 
 * Types:
 * - success: Green, checkmark icon
 * - error: Red, error icon
 * - warning: Yellow, warning icon
 * - info: Blue, info icon
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Array<Toast & { type: ToastType }>>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideToast(id);
    }, 5000);
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Container
interface ToastContainerProps {
  toasts: Array<Toast & { type: ToastType }>;
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-cds-toast flex flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
};

// Individual Toast Item
interface ToastItemProps {
  toast: Toast & { type: ToastType };
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  // Carbon toast styles by type
  const typeStyles: Record<ToastType, { icon: React.ReactNode; border: string; iconColor: string }> = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      border: 'border-l-carbon-green-50',
      iconColor: 'text-carbon-green-60',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      border: 'border-l-carbon-red-50',
      iconColor: 'text-carbon-red-60',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      border: 'border-l-carbon-yellow-40',
      iconColor: 'text-carbon-yellow-50',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      border: 'border-l-carbon-blue-50',
      iconColor: 'text-carbon-blue-60',
    },
  };

  const styles = typeStyles[toast.type];

  return (
    <div
      className={cn(
        // Carbon toast notification styles
        'w-full max-w-sm',
        'bg-cds-layer-02',
        'border-l-4 shadow-cds-md',
        'flex items-start gap-3',
        'p-4',
        'animate-cds-slide-in',
        styles.border
      )}
      role="alert"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', styles.iconColor)}>
        {styles.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-heading-compact-01 text-cds-text-primary">
          {toast.title}
        </h3>
        {toast.message && (
          <p className="text-body-01 text-cds-text-secondary mt-1">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 text-cds-icon-secondary hover:text-cds-icon-primary hover:bg-cds-background-hover transition-colors duration-fast-01"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastProvider;
