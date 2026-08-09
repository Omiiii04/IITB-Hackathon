import React from 'react';

export interface PlatformMetricsCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function PlatformMetricsCard({ className, children }: PlatformMetricsCardProps) {
  return <div className={className}>{children}</div>;
}

export default PlatformMetricsCard;
