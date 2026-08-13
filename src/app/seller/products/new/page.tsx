"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value.trim(),
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim(),
      brand: (form.elements.namedItem('brand') as HTMLInputElement).value.trim() || undefined,
      basePrice: Math.round(parseFloat((form.elements.namedItem('basePrice') as HTMLInputElement).value) * 100),
      categoryId: (form.elements.namedItem('categoryId') as HTMLInputElement).value.trim(),
    };

    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to create product. Please sign in as a seller.');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/seller/products'), 1500);
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
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/seller/products"
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Add New Product</h1>
          <p className="text-xs text-slate-400">Fill in the details to list a new product in your store.</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Product created! Redirecting to your catalogue…
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Product Title *
          </label>
          <input name="title" required minLength={3} maxLength={200} placeholder="e.g. Wireless Noise-Cancelling Headphones" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Description *
          </label>
          <textarea
            name="description"
            required
            minLength={10}
            rows={4}
            placeholder="Describe your product in detail…"
            className={inputCls + ' resize-none'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Brand
            </label>
            <input name="brand" placeholder="e.g. Sony" maxLength={100} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Base Price (₹) *
            </label>
            <input
              name="basePrice"
              type="number"
              required
              min={1}
              step={0.01}
              placeholder="999.00"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Category ID *
          </label>
          <input
            name="categoryId"
            required
            placeholder="UUID of the category"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-slate-500">Browse categories at <code className="text-blue-400">/api/categories</code> to get the UUID.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/seller/products"
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}