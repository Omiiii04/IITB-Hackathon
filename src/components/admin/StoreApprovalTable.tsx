import React from 'react';

export interface StoreApprovalTableProps {
  className?: string;
  children?: React.ReactNode;
}

export function StoreApprovalTable({ className, children }: StoreApprovalTableProps) {
  return <div className={className}>{children}</div>;
}

export default StoreApprovalTable;
