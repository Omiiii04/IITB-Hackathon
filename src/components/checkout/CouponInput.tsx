import React from 'react';

export interface CouponInputProps {
  className?: string;
  children?: React.ReactNode;
}

export function CouponInput({ className, children }: CouponInputProps) {
  return <div className={className}>{children}</div>;
}

export default CouponInput;
