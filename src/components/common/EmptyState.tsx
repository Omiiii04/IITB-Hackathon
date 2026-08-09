import React from 'react';

export interface EmptyStateProps {
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ className, children }: EmptyStateProps) {
  return <div className={className}>{children}</div>;
}

export default EmptyState;
