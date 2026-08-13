"use client";

import React, { useState, useEffect } from 'react';
import { Tag, PlusCircle, AlertCircle, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue?: number | null;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

const inputCls =
  'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/seller/coupons')
      .then((r) => r.json())
      .then((j) => { if (j.success) setCoupons(j.data); else setError(j.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error. Sign in as a seller to view coupons.'));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    setFormSuccess(false);
    const form = e.currentTarget;
    const data = {
      code: (form.elements.namedItem('code') as HTMLInputElement).value.trim().toUpperCase(),
      discountType: (form.elements.namedItem('discountType') as HTMLSelectElement).value,
      discountValue: parseFloat((form.elements.namedItem('discountValue') as HTMLInputElement).value),
      minOrderValue: (form.elements.namedItem('minOrderValue') as HTMLInputElement).value ? parseFloat((form.elements.namedItem('minOrderValue') as HTMLInputElement).value) : undefined,
      maxUses: (form.elements.namedItem('maxUses') as HTMLInputElement).value ? parseInt((form.elements.namedItem('maxUses') as HTMLInputElement).value) : undefined,
      expiresAt: (form.elements.namedItem('expiresAt') as HTMLInputElement).value || undefined,
    };
    try {
      const res = await fetch('/api/seller/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error ?? 'Failed to create coupon.');
      } else {
        setFormSuccess(true);
        setCoupons((prev) => (prev ? [json.data, ...prev] : [json.data]));
        form.reset();
        setTimeout(() => { setShowForm(false); setFormSuccess(false); }, 1500);
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`/api/seller/coupons/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        setCoupons((prev) => prev ? prev.filter((c) => c.id !== id) : prev);
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="h-6 w-6 text-emerald-400" />
            Store Coupons
          </h1>
          <p className="text-sm text-slate-400 mt-1">Create and manage discount codes for your store.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4 w-4" />
          New Coupon
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-6">
          <h2 className="text-sm font-semibold text-white">New Coupon</h2>
          {formSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Coupon created!
            </div>
          )}
          {formError && (
            <div className="flex items-center gap-2 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4" /> {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Code *</label>
              <input name="code" required placeholder="SAVE20" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type *</label>
              <select name="discountType" required className={inputCls}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Value *</label>
              <input name="discountValue" required type="number" min={0.01} step={0.01} placeholder="20" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Min Order (₹)</label>
              <input name="minOrderValue" type="number" min={0} placeholder="500" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Max Uses</label>
              <input name="maxUses" type="number" min={1} placeholder="100" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Expires At</label>
              <input name="expiresAt" type="datetime-local" className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-all">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? 'Creating…' : 'Create Coupon'}
            </button>
          </div>
        </form>
      )}

      {/* Coupon list */}
      {coupons === null && !error && (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      )}
      {Array.isArray(coupons) && coupons.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 py-20 text-center">
          <Tag className="h-12 w-12 text-slate-600 mb-3" />
          <p className="text-white font-semibold mb-1">No coupons yet</p>
          <p className="text-sm text-slate-400">Create your first discount code to attract customers.</p>
        </div>
      )}
      {Array.isArray(coupons) && coupons.length > 0 && (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <code className="text-sm font-bold text-white font-mono">{coupon.code}</code>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${coupon.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 rounded-full px-2 py-0.5">
                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Used: {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  {coupon.minOrderValue ? ` · Min order ₹${coupon.minOrderValue}` : ''}
                  {coupon.expiresAt ? ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString('en-IN')}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                title="Delete coupon"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}