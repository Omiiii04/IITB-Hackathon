import React from 'react';

export interface ButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Button({ className, children }: ButtonProps) {
  return <div className={className}>{children}</div>;
}

export default Button;
