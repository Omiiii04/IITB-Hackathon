import React from 'react';

export interface SelectProps {
  className?: string;
  children?: React.ReactNode;
}

export function Select({ className, children }: SelectProps) {
  return <div className={className}>{children}</div>;
}

export default Select;
