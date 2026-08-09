import React from 'react';

export interface ProductGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function ProductGrid({ className, children }: ProductGridProps) {
  return <div className={className}>{children}</div>;
}

export default ProductGrid;
