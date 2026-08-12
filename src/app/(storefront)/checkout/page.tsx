'use client';

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Store,
  Package,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { AddressSelector, type Address } from '@/components/checkout/AddressSelector';
import { CouponInput, type AppliedCoupon } from '@/components/checkout/CouponInput';
import { RazorpayModal, type RazorpayModalHandle, type RazorpaySuccessResponse } from '@/components/checkout/RazorpayModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckoutStep = 'idle' | 'placing' | 'paying' | 'verifying' | 'success' | 'error';

interface CheckoutOrderResponse {
  razorpayOrderId: string;
  amount: number; // in paisa
  currency: string;
  storeName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, itemCount, subtotal, estimatedTax, estimatedShipping, total, storeGroups, clearCart } = useCart();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [step, setStep] = useState<CheckoutStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const razorpayRef = useRef<RazorpayModalHandle>(null);

  // Coupon discount reduces the total
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const grandTotal = Math.max(0, total - discountAmount);

  // ─── Place Order → Open Razorpay ────────────────────────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      setErrorMessage('Please select a delivery address before proceeding.');
      return;
    }
    if (items.length === 0) return;

    setStep('placing');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
            title: i.title,
            storeId: i.storeId,
          })),
          shippingAddress: {
            recipientName: selectedAddress.recipientName,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country,
            phone: selectedAddress.phone,
          },
          couponCode: appliedCoupon?.code,
        }),
      });

      const body = await res.json() as CheckoutOrderResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Failed to create order. Please try again.');

      setStep('paying');
      razorpayRef.current?.open({
        orderId: body.razorpayOrderId,
        amountPaisa: body.amount,
        currency: body.currency ?? 'INR',
        storeName: body.storeName ?? 'MarketHub',
        prefill: {
          name: selectedAddress.recipientName,
          contact: selectedAddress.phone,
        },
      });
    } catch (err) {
      setStep('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }, [selectedAddress, items, appliedCoupon]);

  // ─── Payment Success → Verify HMAC ──────────────────────────────────────────
  const handlePaymentSuccess = useCallback(async (response: RazorpaySuccessResponse) => {
    setStep('verifying');
    try {
      const verifyRes = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? 'Payment verification failed.');
      }

      setStep('success');
      clearCart();
    } catch (err) {
      setStep('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Payment verification failed. Please contact support.'
      );
    }
  }, [clearCart]);

  const handlePaymentFailure = useCallback((description: string) => {
    setStep('error');
    setErrorMessage(description);
  }, []);

  const handleDismiss = useCallback(() => {
    setStep('idle');
  }, []);

  // ─── Success Screen ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-12 backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-white">Order Placed!</h1>
          <p className="text-sm text-slate-400 mb-8">
            Your payment was successful and your order is being processed. You will receive a
            confirmation shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              <Package className="h-4 w-4" />
              View My Orders
            </Link>
            <Link
              href="/products"
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty Cart ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center backdrop-blur-sm max-w-lg mx-auto">
          <div className="h-20 w-20 rounded-3xl bg-slate-800 flex items-center justify-center mb-6 text-slate-500 shadow-inner">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
          <p className="text-sm text-slate-400 mb-8">Add items to your cart before checking out.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ─── Checkout Layout ─────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hidden Razorpay modal manager */}
      <RazorpayModal
        ref={razorpayRef}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onDismiss={handleDismiss}
      />

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Cart
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Checkout</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {itemCount} item{itemCount !== 1 ? 's' : ''} &middot; Secure payment via Razorpay
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Delivery Address */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                1
              </span>
              Delivery Address
            </h2>
            <AddressSelector
              selectedId={selectedAddress?.id}
              onSelect={setSelectedAddress}
            />
          </section>

          {/* Coupon */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                2
              </span>
              Promo Code
            </h2>
            <CouponInput
              orderValue={subtotal}
              appliedCoupon={appliedCoupon}
              onApplied={setAppliedCoupon}
              onRemoved={() => setAppliedCoupon(null)}
            />
          </section>

          {/* Items by store */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                3
              </span>
              Order Items
            </h2>
            <div className="space-y-4">
              {storeGroups.map((group) => (
                <div key={group.storeId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-300">{group.storeName}</span>
                  </div>
                  {group.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? 'base'}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/40 p-3"
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        {item.variantTitle && (
                          <p className="text-xs text-slate-400">{item.variantTitle}</p>
                        )}
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-white shrink-0">
                        &#8377;{item.itemSubtotal.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right Column: Order Summary ──────────────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5">
              <h2 className="text-base font-bold text-white">Order Summary</h2>

              {/* Line items */}
              <div className="space-y-3 text-sm">
                <SummaryRow label={`Subtotal (${itemCount} items)`} value={subtotal} />
                <SummaryRow label="GST (18% est.)" value={estimatedTax} />
                <SummaryRow label={`Shipping (${storeGroups.length} store${storeGroups.length !== 1 ? 's' : ''})`} value={estimatedShipping} />
                {discountAmount > 0 && (
                  <SummaryRow label={`Coupon (${appliedCoupon?.code})`} value={-discountAmount} accent="emerald" />
                )}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">Grand Total</span>
                  <span className="text-xl font-extrabold text-white">
                    &#8377;{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Inclusive of all taxes</p>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                id="checkout-place-order-btn"
                onClick={handlePlaceOrder}
                disabled={step === 'placing' || step === 'paying' || step === 'verifying'}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200"
              >
                {step === 'placing' || step === 'verifying' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {step === 'placing'
                  ? 'Creating Order…'
                  : step === 'paying'
                  ? 'Awaiting Payment…'
                  : step === 'verifying'
                  ? 'Verifying Payment…'
                  : `Pay ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>256-bit SSL encrypted &bull; Powered by Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'emerald';
}) {
  const formatted = `₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={accent === 'emerald' ? 'text-emerald-400 font-semibold' : 'text-slate-200'}>
        {value < 0 ? `−${formatted}` : formatted}
      </span>
    </div>
  );
}
