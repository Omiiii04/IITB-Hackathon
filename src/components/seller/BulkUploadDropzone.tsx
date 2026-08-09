import React from 'react';

export interface BulkUploadDropzoneProps {
  className?: string;
  children?: React.ReactNode;
}

export function BulkUploadDropzone({ className, children }: BulkUploadDropzoneProps) {
  return <div className={className}>{children}</div>;
}

export default BulkUploadDropzone;
