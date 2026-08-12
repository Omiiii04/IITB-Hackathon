'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Tag, ShieldCheck, Truck } from 'lucide-react';

export interface CartSummaryProps {
  subtotal?: number;
  estimatedTax?: number;
  estimatedShipping?: number;
  total?: number;
  discount?: number;
  onApplyCoupon?: (code: string) => Promise<boolean>;
  checkoutHref?: string;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function CartSummary({
  subtotal = 0,
  estimatedTax = 0,
  estimatedShipping = 0,
  total,
  discount = 0,
  onApplyCoupon,
  checkoutHref = '/checkout',
  isLoading = false,
  className = '',
  children,
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (children) {
    return <div className={className}>{children}</div>;
  }

  const calculatedTotal = total ?? Math.max(0, subtotal + estimatedTax + estimatedShipping - discount);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !onApplyCoupon) return;

    setIsApplying(true);
    setCouponMessage(null);
    try {
      const success = await onApplyCoupon(couponCode.trim());
      if (success) {
        setCouponMessage({ text: 'Coupon applied successfully!' });
      } else {
        setCouponMessage({ text: 'Invalid or expired coupon code.', isError: true });
      }
    } catch {
      setCouponMessage({ text: 'Failed to apply coupon.', isError: true });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      className={`flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl ${className}`}
    >
      <h2 className="text-base font-bold text-white">Order Summary</h2>

      {/* Breakdown lines */}
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-200">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-slate-500" />
            Estimated Shipping
          </span>
          <span className="font-semibold text-slate-200">
            {estimatedShipping === 0 ? 'Free' : formatPrice(estimatedShipping)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Estimated Tax (GST 18%)</span>
          <span className="font-semibold text-slate-200">{formatPrice(estimatedTax)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-medium">
            <span>Discount Applied</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Coupon input */}
      {onApplyCoupon && (
        <form onSubmit={handleApply} className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon Code"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={isApplying || !couponCode.trim()}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors disabled:opacity-50"
            >
              {isApplying ? '...' : 'Apply'}
            </button>
          </div>

          {couponMessage && (
            <p
              className={`text-[11px] font-medium ${
                couponMessage.isError ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {couponMessage.text}
            </p>
          )}
        </form>
      )}

      {/* Total line */}
      <div className="flex items-baseline justify-between pt-3 border-t border-slate-800">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">Grand Total</span>
          <span className="text-[11px] text-slate-500">Includes all taxes & shipping</span>
        </div>
        <span className="text-2xl font-extrabold text-white">{formatPrice(calculatedTotal)}</span>
      </div>

      {/* Checkout button */}
      <Link
        href={checkoutHref}
        className={`flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all ${
          subtotal === 0 || isLoading ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>256-bit SSL Secure Checkout</span>
      </div>
    </div>
  );
}

export default CartSummary;
