import React from 'react';

export interface BadgeProps {
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, children }: BadgeProps) {
  return <div className={className}>{children}</div>;
}

export default Badge;
