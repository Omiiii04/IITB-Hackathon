import React from 'react';

export interface TopProductsChartProps {
  className?: string;
  children?: React.ReactNode;
}

export function TopProductsChart({ className, children }: TopProductsChartProps) {
  return <div className={className}>{children}</div>;
}

export default TopProductsChart;
