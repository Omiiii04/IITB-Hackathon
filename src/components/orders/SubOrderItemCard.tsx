import React from 'react';

export interface SubOrderItemCardProps {
  className?: string;
  children?: React.ReactNode;
}

export function SubOrderItemCard({ className, children }: SubOrderItemCardProps) {
  return <div className={className}>{children}</div>;
}

export default SubOrderItemCard;
