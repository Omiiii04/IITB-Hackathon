import React from 'react';

export interface CartDrawerProps {
  className?: string;
  children?: React.ReactNode;
}

export function CartDrawer({ className, children }: CartDrawerProps) {
  return <div className={className}>{children}</div>;
}

export default CartDrawer;
