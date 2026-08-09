import React from 'react';

export interface PriceFilterProps {
  className?: string;
  children?: React.ReactNode;
}

export function PriceFilter({ className, children }: PriceFilterProps) {
  return <div className={className}>{children}</div>;
}

export default PriceFilter;
