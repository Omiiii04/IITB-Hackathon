import React from 'react';

export interface CartItemRowProps {
  className?: string;
  children?: React.ReactNode;
}

export function CartItemRow({ className, children }: CartItemRowProps) {
  return <div className={className}>{children}</div>;
}

export default CartItemRow;
