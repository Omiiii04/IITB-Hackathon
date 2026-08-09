import React from 'react';

export interface TableProps {
  className?: string;
  children?: React.ReactNode;
}

export function Table({ className, children }: TableProps) {
  return <div className={className}>{children}</div>;
}

export default Table;
