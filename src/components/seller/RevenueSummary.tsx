import React from 'react';

export interface RevenueSummaryProps {
  className?: string;
  children?: React.ReactNode;
}

export function RevenueSummary({ className, children }: RevenueSummaryProps) {
  return <div className={className}>{children}</div>;
}

export default RevenueSummary;
