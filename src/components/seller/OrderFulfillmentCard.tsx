import React from 'react';

export interface OrderFulfillmentCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function OrderFulfillmentCard({ className, children }: OrderFulfillmentCardProps) {
  return <div className={className}>{children}</div>;
}

export default OrderFulfillmentCard;
