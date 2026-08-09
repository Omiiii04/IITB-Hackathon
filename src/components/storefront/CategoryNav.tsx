import React from 'react';

export interface CategoryNavProps {
  className?: string;
  children?: React.ReactNode;
}

export function CategoryNav({ className, children }: CategoryNavProps) {
  return <div className={className}>{children}</div>;
}

export default CategoryNav;
