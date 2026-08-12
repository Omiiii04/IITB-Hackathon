'use client';

import React from 'react';
import { Store, Package, KeyRound, Truck } from 'lucide-react';
import type { GroupedSubOrder } from '@/modules/orders/orders.service';

export interface SubOrderItemCardProps {
  subOrder: GroupedSubOrder;
  className?: string;
}

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  PLACED: { label: 'Placed', style: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  SELLER_ACCEPTED: { label: 'Confirmed by Seller', style: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
  PACKED: { label: 'Packed', style: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  SHIPPED: { label: 'Shipped', style: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', style: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  DELIVERED: { label: 'Delivered', style: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  CANCELLED: { label: 'Cancelled', style: 'bg-red-500/10 border-red-500/30 text-red-400' },
};

export function SubOrderItemCard({ subOrder, className = '' }: SubOrderItemCardProps) {
  const statusInfo = STATUS_BADGES[subOrder.subOrderStatus] ?? STATUS_BADGES.PLACED;

  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4 ${className}`}>
      {/* Store Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Seller Store</span>
            <h4 className="text-sm font-bold text-white leading-none">{subOrder.storeName}</h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusInfo.style}`}
          >
            {statusInfo.label}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Subtotal: <span className="text-white font-bold">&#8377;{subOrder.subtotal.toLocaleString('en-IN')}</span>
          </span>
        </div>
      </div>

      {/* Item rows */}
      <div className="space-y-3">
        {subOrder.items.map((item) => {
          const attributes = item.variantAttributes;
          const attrString = attributes
            ? Object.entries(attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' · ')
            : null;

          return (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-800/40 p-3.5"
            >
              <div className="h-14 w-14 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <Package className="h-6 w-6 text-slate-500" />
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-white truncate">{item.productTitle}</h5>
                {attrString && <p className="text-xs text-slate-400 mt-0.5">{attrString}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>Qty: <strong className="text-slate-200">{item.quantity}</strong></span>
                  <span>&bull;</span>
                  <span>Unit: &#8377;{item.unitPrice.toLocaleString('en-IN')}</span>
                </div>

                {/* OTP Delivery Verification Badge */}
                {item.otpCode && (
                  <div className="mt-2.5 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs text-amber-300">
                    <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>
                      Delivery OTP: <strong className="font-mono text-white tracking-widest">{item.otpCode}</strong>
                    </span>
                  </div>
                )}

                {/* Courier tracking details */}
                {item.trackingNumber && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <Truck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span>
                      {item.courierPartner ?? 'Courier'}: <strong className="font-mono text-slate-200">{item.trackingNumber}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold text-white">
                  &#8377;{item.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SubOrderItemCard;

