import React from 'react';

export interface VariantSelectorProps {
  className?: string;
  children?: React.ReactNode;
}

export function VariantSelector({ className, children }: VariantSelectorProps) {
  return <div className={className}>{children}</div>;
}

export default VariantSelector;
