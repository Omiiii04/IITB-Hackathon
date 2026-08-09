import React from 'react';

export interface ToastProps {
  className?: string;
  children?: React.ReactNode;
}

export function Toast({ className, children }: ToastProps) {
  return <div className={className}>{children}</div>;
}

export default Toast;
