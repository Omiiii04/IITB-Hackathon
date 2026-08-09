import React from 'react';

export interface AIDescriptionModalProps {
  className?: string;
  children?: React.ReactNode;
}

export function AIDescriptionModal({ className, children }: AIDescriptionModalProps) {
  return <div className={className}>{children}</div>;
}

export default AIDescriptionModal;
