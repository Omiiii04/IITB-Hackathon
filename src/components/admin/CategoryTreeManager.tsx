import React from 'react';

export interface CategoryTreeManagerProps {
  className?: string;
  children?: React.ReactNode;
}

export function CategoryTreeManager({ className, children }: CategoryTreeManagerProps) {
  return <div className={className}>{children}</div>;
}

export default CategoryTreeManager;
