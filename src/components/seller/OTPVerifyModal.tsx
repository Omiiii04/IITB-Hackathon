import React from 'react';

export interface OTPVerifyModalProps {
  className?: string;
  children?: React.ReactNode;
}

export function OTPVerifyModal({ className, children }: OTPVerifyModalProps) {
  return <div className={className}>{children}</div>;
}

export default OTPVerifyModal;
