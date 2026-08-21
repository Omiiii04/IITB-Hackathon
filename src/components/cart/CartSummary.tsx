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
      className={`flex flex-col gap-5 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm ${className}`}
    >
      <h2 className="text-base font-bold text-[#191b23]">Order Summary</h2>

      {/* Breakdown lines */}
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between text-[#64748B]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#191b23]">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-[#64748B]">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-[#64748B]" />
            Estimated Shipping
          </span>
          <span className="font-semibold text-[#191b23]">
            {estimatedShipping === 0 ? 'Free' : formatPrice(estimatedShipping)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#64748B]">
          <span>Estimated Tax (GST 18%)</span>
          <span className="font-semibold text-[#191b23]">{formatPrice(estimatedTax)}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span>Discount Applied</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Coupon input */}
      {onApplyCoupon && (
        <form onSubmit={handleApply} className="flex flex-col gap-1.5 pt-2 border-t border-[#E2E8F0]">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon Code"
                className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 py-2 text-xs text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={isApplying || !couponCode.trim()}
              className="rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#191b23] transition-colors disabled:opacity-50"
            >
              {isApplying ? '...' : 'Apply'}
            </button>
          </div>

          {couponMessage && (
            <p
              className={`text-[11px] font-medium ${
                couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {couponMessage.text}
            </p>
          )}
        </form>
      )}

      {/* Total line */}
      <div className="flex items-baseline justify-between pt-3 border-t border-[#E2E8F0]">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#191b23]">Grand Total</span>
          <span className="text-[11px] text-[#64748B]">Includes all taxes & shipping</span>
        </div>
        <span className="text-2xl font-extrabold text-[#191b23]">{formatPrice(calculatedTotal)}</span>
      </div>

      {/* Checkout button */}
      <Link
        href={checkoutHref}
        className={`flex items-center justify-center gap-2 rounded-2xl bg-[#0058be] hover:bg-[#004395] py-3.5 px-6 text-sm font-bold text-white shadow-sm transition-all ${
          subtotal === 0 || isLoading ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        <span>256-bit SSL Secure Checkout</span>
      </div>
    </div>
  );
}

export default CartSummary;
