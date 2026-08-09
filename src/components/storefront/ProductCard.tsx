import React from 'react';

export interface ProductCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function ProductCard({ className, children }: ProductCardProps) {
  return <div className={className}>{children}</div>;
}

export default ProductCard;
