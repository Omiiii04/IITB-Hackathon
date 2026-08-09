import React from 'react';

export interface GMVChartProps {
  className?: string;
  children?: React.ReactNode;
}

export function GMVChart({ className, children }: GMVChartProps) {
  return <div className={className}>{children}</div>;
}

export default GMVChart;
