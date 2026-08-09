import React from 'react';

export interface ToastProps {
  variant?: 'success' | 'warning' | 'danger' | 'primary';
  message: string;
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<ToastProps['variant']>, string> = {
  primary: 'bg-primary-900 text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-white',
  danger: 'bg-danger-500 text-white',
};

export function Toast({ variant = 'primary', message, className = '' }: ToastProps) {
  return (
    <div
      role="status"
      className={`rounded px-4 py-2 text-sm shadow-md ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {message}
    </div>
  );
}

export default Toast;