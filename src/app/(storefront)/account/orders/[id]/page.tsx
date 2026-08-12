'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { SubOrderItemCard } from '@/components/orders/SubOrderItemCard';
import { InvoiceButton } from '@/components/orders/InvoiceButton';
import type { GroupedSubOrder } from '@/modules/orders/orders.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderDetailRecord = any;

const ORDER_STATUS_BADGES: Record<string, { label: string; style: string }> = {
  AWAITING_PAYMENT: { label: 'Awaiting Payment', style: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  PAYMENT_FAILED: { label: 'Payment Failed', style: 'bg-red-500/10 border-red-500/30 text-red-400' },
  PAYMENT_SUCCESSFUL: { label: 'Payment Received', style: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
  PROCESSING: { label: 'Processing', style: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  PARTIALLY_FULFILLED: { label: 'Partially Fulfilled', style: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  COMPLETED: { label: 'Completed', style: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  CANCELLED: { label: 'Cancelled', style: 'bg-red-500/10 border-red-500/30 text-red-400' },
  REFUNDED: { label: 'Refunded', style: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch order details');
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-xs text-slate-400">Loading order details…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center text-amber-300 space-y-4 max-w-md mx-auto my-12">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
        <h3 className="text-base font-bold text-white">Order Not Found</h3>
        <p className="text-xs text-amber-400/80">{error ?? 'The requested order could not be located.'}</p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Orders</span>
        </Link>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_BADGES[order.orderStatus] ?? ORDER_STATUS_BADGES.PROCESSING;
  const address = order.shippingAddressSnapshot;
  const payment = order.payments?.[0];
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Order History</span>
      </Link>

      {/* Header card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-extrabold text-white">
                Order #{order.orderNumber ?? order.id.slice(0, 8)}
              </h2>
              <span className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${statusInfo.style}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Placed on {formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InvoiceButton orderId={order.id} orderNumber={order.orderNumber} />
          </div>
        </div>

        {/* Live Order Progress Timeline */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Live Order Tracking
          </h3>
          <OrderTimeline steps={order.timelineSteps} orderStatus={order.orderStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Sub-orders by seller store */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              <span>Ordered Items</span>
            </h3>
            <span className="text-xs text-slate-400">
              Split across {order.storeGroups?.length ?? 0} seller store{(order.storeGroups?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Sub-order cards */}
          {order.storeGroups?.map((subOrder: GroupedSubOrder) => (
            <SubOrderItemCard key={subOrder.storeId} subOrder={subOrder} />
          ))}
        </div>

        {/* Right column: Address & Payment Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shipping Address */}
          {address && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span>Shipping Address</span>
              </h4>
              <div>
                <p className="text-sm font-bold text-white">{address.recipientName}</p>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {address.city}, {address.state} &mdash; <span className="font-mono text-slate-300">{address.postalCode}</span>
                </p>
                <p className="text-xs font-mono text-slate-400 mt-1">Phone: {address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment & Financial Breakdown */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-blue-400" />
              <span>Payment Details</span>
            </h4>

            {payment && (
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method</span>
                  <span className="font-semibold text-white uppercase">{payment.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-mono text-slate-300 truncate max-w-[140px]">{payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-emerald-400">{payment.status}</span>
                </div>
              </div>
            )}

            {/* Financials breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">
                  &#8377;{(order.totalAmount - (order.taxAmount || 0) - (order.shippingAmount || 0) + (order.discountAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% est.)</span>
                <span className="text-slate-200">&#8377;{(order.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="text-slate-200">&#8377;{(order.shippingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {Boolean(order.discountAmount) && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount ({order.coupon?.code ?? 'PROMO'})</span>
                  <span>&minus;&#8377;{order.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-700 pt-2.5 mt-2">
                <span>Grand Total</span>
                <span>&#8377;{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Razorpay Verified Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

