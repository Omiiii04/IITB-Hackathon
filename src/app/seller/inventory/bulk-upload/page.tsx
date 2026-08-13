"use client";

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, XCircle, FileText, Loader2 } from 'lucide-react';

interface RowResult {
  row: number;
  sku?: string;
  action?: 'created' | 'updated';
  success: boolean;
  error?: string;
}

interface UploadSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: RowResult[];
}

const CSV_TEMPLATE = `sku,title,variantPrice,stock,attributes,imageUrl
SKU-001,Blue 128GB,59999,10,"{""color"":""Blue"",""storage"":""128GB""}",
SKU-002,Black 256GB,79999,5,"{""color"":""Black"",""storage"":""256GB""}",`;

export default function BulkUploadPage() {
  const [productId, setProductId] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setCsvContent((ev.target?.result as string) ?? '');
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId.trim()) { setError('Product ID is required.'); return; }
    if (!csvContent.trim()) { setError('Please select or paste a CSV file.'); return; }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch('/api/seller/inventory/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId.trim(), csv: csvContent }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Upload failed. Sign in as a seller first.');
      } else {
        setSummary(json.data);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Upload className="h-6 w-6 text-emerald-400" />
          Bulk Upload Variants
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload a CSV file to create or update product variants in bulk.
        </p>
      </div>

      {/* CSV template */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">CSV Template</span>
        </div>
        <pre className="text-xs text-slate-400 overflow-x-auto font-mono bg-slate-950/60 rounded-lg p-3 border border-slate-800">
          {CSV_TEMPLATE}
        </pre>
        <p className="mt-2 text-xs text-slate-500">
          <code className="text-blue-400">attributes</code> must be a JSON object (double-quoted in CSV). Leave <code className="text-blue-400">imageUrl</code> blank if not applicable.
        </p>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Product ID *
          </label>
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="UUID of the product to add variants to"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-slate-500">Find product IDs at <code className="text-blue-400">/seller/products</code>.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            CSV File *
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 py-8 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
          >
            <Upload className="h-8 w-8 text-slate-500" />
            <div className="text-center">
              <p className="text-sm text-slate-300">{filename || 'Click to upload a CSV file'}</p>
              <p className="text-xs text-slate-500 mt-1">or paste CSV content below</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Or Paste CSV
          </label>
          <textarea
            value={csvContent}
            onChange={(e) => { setCsvContent(e.target.value); setFilename(''); }}
            rows={6}
            placeholder="sku,title,variantPrice,stock,attributes,imageUrl&#10;SKU-001,..."
            className={inputCls + ' resize-y font-mono text-xs'}
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Uploading…' : 'Upload CSV'}
          </button>
        </div>
      </form>

      {/* Results */}
      {summary && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">{summary.succeeded} succeeded</span>
            </div>
            {summary.failed > 0 && (
              <div className="flex items-center gap-1.5 text-rose-400">
                <XCircle className="h-4 w-4" />
                <span className="font-semibold">{summary.failed} failed</span>
              </div>
            )}
            <span className="text-slate-500">of {summary.total} total rows</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {summary.results.map((r) => (
              <div
                key={r.row}
                className={`flex items-start gap-3 rounded-lg px-3 py-2 text-xs ${r.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}
              >
                {r.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-slate-400 flex-shrink-0">Row {r.row}</span>
                {r.sku && <span className="font-mono text-slate-300">{r.sku}</span>}
                {r.action && <span className="text-emerald-300 capitalize">{r.action}</span>}
                {r.error && <span className="text-rose-300">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}