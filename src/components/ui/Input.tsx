import React from 'react';

export interface InputProps {
  className?: string;
  children?: React.ReactNode;
}

export function Input({ className, children }: InputProps) {
  return <div className={className}>{children}</div>;
}

export default Input;
