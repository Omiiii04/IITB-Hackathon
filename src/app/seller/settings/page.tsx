"use client";

import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, Store } from 'lucide-react';

export default function SellerSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<'create' | 'update'>('create');

  const inputCls =
    'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget;
    const data = {
      storeName: (form.elements.namedItem('storeName') as HTMLInputElement).value.trim(),
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim() || undefined,
      logoUrl: (form.elements.namedItem('logoUrl') as HTMLInputElement).value.trim() || undefined,
      bannerUrl: (form.elements.namedItem('bannerUrl') as HTMLInputElement).value.trim() || undefined,
    };

    const url = '/api/seller/store';
    const method = mode === 'create' ? 'POST' : 'PATCH';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.error?.includes('already have a store')) {
          setMode('update');
          setError('You already have a store. Use the Update Store button instead.');
        } else {
          setError(json.error ?? 'Operation failed. Ensure you are signed in as a Seller.');
        }
      } else {
        setSuccess(true);
        if (mode === 'create') setMode('update');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Store className="h-6 w-6 text-emerald-400" />
          Store Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {mode === 'create' ? 'Create your seller storefront.' : 'Update your store profile.'}
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Store {mode === 'create' ? 'created' : 'updated'} successfully!
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
            Store Name *
          </label>
          <input
            name="storeName"
            required
            minLength={3}
            maxLength={80}
            placeholder="e.g. Audio Central Store"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Store Description
          </label>
          <textarea
            name="description"
            rows={3}
            maxLength={1000}
            placeholder="Tell customers about your store…"
            className={inputCls + ' resize-none'}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Logo URL
          </label>
          <input
            name="logoUrl"
            type="url"
            placeholder="https://example.com/logo.png"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Banner URL
          </label>
          <input
            name="bannerUrl"
            type="url"
            placeholder="https://example.com/banner.jpg"
            className={inputCls}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'create' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Create Store
            </button>
            <button
              type="button"
              onClick={() => setMode('update')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'update' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Update Store
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Saving…' : mode === 'create' ? 'Create Store' : 'Update Store'}
          </button>
        </div>
      </form>
    </div>
  );
}