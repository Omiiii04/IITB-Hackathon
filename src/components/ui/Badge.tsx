import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
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