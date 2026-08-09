import React from 'react';

export interface ErrorBoundaryProps {
  className?: string;
  children?: React.ReactNode;
}

export function ErrorBoundary({ className, children }: ErrorBoundaryProps) {
  return <div className={className}>{children}</div>;
}

export default ErrorBoundary;
