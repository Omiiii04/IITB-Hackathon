
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
      <div className="border-b border-[#E2E8F0] pb-5">
        <h2 className="text-xl font-bold text-[#191b23]">Order History</h2>
        <p className="mt-0.5 text-xs text-[#64748B]">
          Track active shipments, review past purchases, and download tax invoices.
        </p>
      </div>

      {/* Filter tabs & Search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-2xs">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer',
                  isActive
                    ? 'bg-[#0058be] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#191b23] hover:bg-[#F8FAFC]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order # or item"
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-xs text-[#191b23] placeholder-[#94A3B8] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/30 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-48 rounded-3xl border border-[#E2E8F0] bg-white p-5 animate-pulse space-y-4 shadow-xs"
            >
              <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
                <div className="h-4 w-1/3 rounded bg-[#F1F5F9]" />
                <div className="h-6 w-24 rounded-full bg-[#F1F5F9]" />
              </div>
              <div className="h-16 w-full rounded-2xl bg-[#F8FAFC]" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600 mb-2" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0058be] hover:text-[#004395] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white p-12 text-center shadow-sm">
          <div className="h-16 w-16 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#64748B]">
            <ShoppingBag className="h-8 w-8 text-[#0058be]" />
          </div>
          <h3 className="text-base font-bold text-[#191b23] mb-1">No Orders Found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mb-6 leading-relaxed">
            {searchTerm
              ? 'No orders match your search criteria. Try a different search keyword.'
              : 'You have not placed any orders yet. Explore our multi-vendor marketplace!'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] hover:bg-[#004395] px-6 py-3 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
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
                className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm space-y-5 transition-all hover:border-[#CBD5E1]"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2E8F0] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-extrabold text-[#191b23]">
                        Order #{order.orderNumber ?? order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${statusInfo.style}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <span>Placed on {formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-[#F1F5F9] pt-3 sm:border-t-0 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-[#64748B] block">Total Amount</span>
                      <span className="text-base font-extrabold text-[#191b23]">
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
                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span className="text-xs text-[#64748B]">
                    {order.orderItems?.length ?? 0} item{(order.orderItems?.length ?? 0) !== 1 ? 's' : ''} from {storeGroups.length} store{storeGroups.length !== 1 ? 's' : ''}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0058be] hover:text-[#004395] transition-colors"
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

