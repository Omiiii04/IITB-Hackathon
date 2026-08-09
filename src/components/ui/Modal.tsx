import React from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Modal({ open, onClose, className = '', children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`w-full max-w-md rounded bg-surface-light p-6 shadow-lg ${className}`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="mb-4 float-right text-primary-500"
        >
          ✕
        </button>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
}

export default Modal;