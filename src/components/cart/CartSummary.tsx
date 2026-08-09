import React from 'react';

export interface CartSummaryProps {
  className?: string;
  children?: React.ReactNode;
}

export function CartSummary({ className, children }: CartSummaryProps) {
  return <div className={className}>{children}</div>;
}

export default CartSummary;
