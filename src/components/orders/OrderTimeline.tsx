import React from 'react';

export interface OrderTimelineProps {
  className?: string;
  children?: React.ReactNode;
}

export function OrderTimeline({ className, children }: OrderTimelineProps) {
  return <div className={className}>{children}</div>;
}

export default OrderTimeline;
