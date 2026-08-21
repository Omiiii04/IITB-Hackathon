'use client';

import React, { useState } from 'react';
import { Tag, Loader2, CheckCircle2, XCircle, X } from 'lucide-react';

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description?: string;
}

export interface CouponInputProps {
  /** Cart subtotal in ₹, used to check minimum order constraints server-side */
  orderValue: number;
  onApplied: (coupon: AppliedCoupon) => void;
  onRemoved: () => void;
  appliedCoupon?: AppliedCoupon | null;
  className?: string;
}

interface ValidateCouponResponse {
  discountAmount: number;
  description?: string;
}

export function CouponInput({
  orderValue,
  onApplied,
  onRemoved,
  appliedCoupon,
  className = '',
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, orderValue }),
      });

      const body = await res.json() as ValidateCouponResponse & { error?: string };

      if (!res.ok) {
        throw new Error(body.error ?? 'Invalid or expired coupon code.');
      }

      onApplied({
        code: trimmed,
        discountAmount: body.discountAmount,
        description: body.description,
      });
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon.');
    } finally {
      setLoading(false);
    }
  };

  // Applied state
  if (appliedCoupon) {
    return (
      <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 ${className}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-800 tracking-wider">
                {appliedCoupon.code}
              </p>
              {appliedCoupon.description && (
                <p className="text-[11px] text-emerald-600 mt-0.5">{appliedCoupon.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-bold text-emerald-700">
              &minus;&#8377;{appliedCoupon.discountAmount.toLocaleString('en-IN')}
            </span>
            <button
              type="button"
              onClick={onRemoved}
              className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-900 transition-colors cursor-pointer"
              aria-label="Remove coupon"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
            placeholder="Enter coupon code"
            maxLength={32}
            autoComplete="off"
            className={[
              'w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm font-mono text-[#191b23] placeholder-[#94A3B8] outline-none transition-colors shadow-2xs',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
                : 'border-[#E2E8F0] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/30',
            ].join(' ')}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0058be] hover:bg-[#004395] disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {loading ? 'Applying' : 'Apply'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}

export default CouponInput;

