import React from 'react';

export interface ModalProps {
  className?: string;
  children?: React.ReactNode;
}

export function Modal({ className, children }: ModalProps) {
  return <div className={className}>{children}</div>;
}

export default Modal;
