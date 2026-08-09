import React from 'react';

export interface SalesChartProps {
  className?: string;
  children?: React.ReactNode;
}

export function SalesChart({ className, children }: SalesChartProps) {
  return <div className={className}>{children}</div>;
}

export default SalesChart;
