'use client';

import type { BulkUploadSummary } from '@/components/seller/BulkUploadDropzone';

export interface BulkUploadResultTableProps {
  summary: BulkUploadSummary;
  className?: string;
}

export function BulkUploadResultTable({ summary, className }: BulkUploadResultTableProps) {
  const { total, succeeded, failed, results } = summary;

  return (
    <div className={className}>
      <div className="mb-3 flex gap-4 text-sm">
        <span className="text-slate-600 dark:text-slate-400">{total} rows processed</span>
        <span className="text-success-500">{succeeded} succeeded</span>
        {failed > 0 && <span className="text-danger-500">{failed} failed</span>}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="px-3 py-2 font-medium">Row</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.row} className="border-t border-slate-200 dark:border-slate-700">
                <td className="px-3 py-2">{r.row}</td>
                <td className="px-3 py-2">{r.sku ?? '—'}</td>
                <td className="px-3 py-2">
                  {r.success ? (
                    <span className="text-success-500">{r.action === 'updated' ? 'Updated' : 'Created'}</span>
                  ) : (
                    <span className="text-danger-500">Failed</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-500">{r.error ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BulkUploadResultTable;