import React from 'react';

export interface RazorpayModalProps {
  className?: string;
  children?: React.ReactNode;
}

export function RazorpayModal({ className, children }: RazorpayModalProps) {
  return <div className={className}>{children}</div>;
}

export default RazorpayModal;
