'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface BulkUploadRowResult {
  row: number;
  sku?: string;
  action?: 'created' | 'updated';
  success: boolean;
  error?: string;
}

export interface BulkUploadSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkUploadRowResult[];
}

export interface BulkUploadDropzoneProps {
  productId: string;
  onComplete: (summary: BulkUploadSummary) => void;
  className?: string;
}

export function BulkUploadDropzone({ productId, onComplete, className }: BulkUploadDropzoneProps) {
  const { fetchWithAuth } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a .csv file');
        return;
      }

      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      try {
        const res = await fetchWithAuth('/api/seller/inventory/bulk-upload', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error ?? 'Upload failed');
          return;
        }
        onComplete(json.data as BulkUploadSummary);
      } catch {
        setError('Network error — please try again');
      } finally {
        setIsUploading(false);
      }
    },
    [productId, fetchWithAuth, onComplete],
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-slate-300 dark:border-slate-700'
        }`}
      >
        {isUploading ? (
          <p className="text-sm text-slate-500">Uploading…</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Drag and drop a CSV file here, or
            </p>
            <label className="mt-2 cursor-pointer text-sm font-medium text-primary-500 hover:text-primary-900">
              browse files
              <input type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
            </label>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
    </div>
  );
}

export default BulkUploadDropzone;