
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  ArrowRight,
  AlertCircle,
  Package,
  Calendar,
} from 'lucide-react';
import { SubOrderItemCard } from '@/components/orders/SubOrderItemCard';
import { InvoiceButton } from '@/components/orders/InvoiceButton';
import { groupOrderItemsByStore } from '@/modules/orders/orders.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderRecord = any;

const FILTER_TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.set('status', activeTab);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load order history');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch orders');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-xl font-bold text-white">Order History</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Track active shipments, review past purchases, and download tax invoices.
        </p>
      </div>

      {/* Filter tabs & Search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 backdrop-blur-sm">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order # or item"
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-48 rounded-3xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="h-4 w-1/3 rounded bg-slate-800" />
                <div className="h-6 w-24 rounded-full bg-slate-800" />
              </div>
              <div className="h-16 w-full rounded-2xl bg-slate-800/60" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 text-center text-amber-300">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-400 mb-2" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center backdrop-blur-sm">
          <div className="h-16 w-16 rounded-3xl bg-slate-800 flex items-center justify-center mb-4 text-slate-500">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            {searchTerm
              ? 'No orders match your search criteria. Try a different search keyword.'
              : 'You have not placed any orders yet. Explore our multi-vendor marketplace!'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <Package className="h-4 w-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      )}

      {/* Order Cards List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order: OrderRecord) => {
            const statusInfo = ORDER_STATUS_BADGES[order.orderStatus] ?? ORDER_STATUS_BADGES.PROCESSING;
            const storeGroups = groupOrderItemsByStore(order.orderItems || []);
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm space-y-5 transition-all hover:border-slate-700"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-extrabold text-white">
                        Order #{order.orderNumber ?? order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${statusInfo.style}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>Placed on {formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-800/60 pt-3 sm:border-t-0 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block">Total Amount</span>
                      <span className="text-base font-extrabold text-white">
                        &#8377;{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <InvoiceButton orderId={order.id} orderNumber={order.orderNumber} />
                  </div>
                </div>

                {/* Sub-orders grouped by seller store */}
                <div className="space-y-4">
                  {storeGroups.map((subOrder) => (
                    <SubOrderItemCard key={subOrder.storeId} subOrder={subOrder} />
                  ))}
                </div>

                {/* View Details Link Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400">
                    {order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? 's' : ''} from {storeGroups.length} store{storeGroups.length !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>View Order Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

