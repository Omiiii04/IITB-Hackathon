import React from 'react';

export interface VariantMatrixEditorProps {
  className?: string;
  children?: React.ReactNode;
}

export function VariantMatrixEditor({ className, children }: VariantMatrixEditorProps) {
  return <div className={className}>{children}</div>;
}

export default VariantMatrixEditor;
