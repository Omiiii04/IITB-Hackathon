import React from 'react';

export interface AddressSelectorProps {
  className?: string;
  children?: React.ReactNode;
}

export function AddressSelector({ className, children }: AddressSelectorProps) {
  return <div className={className}>{children}</div>;
}

export default AddressSelector;
