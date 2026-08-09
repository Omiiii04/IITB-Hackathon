import React from 'react';

export interface BulkUploadResultTableProps {
  className?: string;
  children?: React.ReactNode;
}

export function BulkUploadResultTable({ className, children }: BulkUploadResultTableProps) {
  return <div className={className}>{children}</div>;
}

export default BulkUploadResultTable;
