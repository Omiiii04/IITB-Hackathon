import React from 'react';

export interface InvoiceButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function InvoiceButton({ className, children }: InvoiceButtonProps) {
  return <div className={className}>{children}</div>;
}

export default InvoiceButton;
