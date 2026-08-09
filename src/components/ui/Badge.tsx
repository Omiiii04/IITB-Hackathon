import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-primary-50 text-primary-900',
  success: 'bg-success-500/10 text-success-500',
  warning: 'bg-warning-500/10 text-warning-500',
  danger: 'bg-danger-500/10 text-danger-500',
};

export function Badge({ variant = 'primary', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;