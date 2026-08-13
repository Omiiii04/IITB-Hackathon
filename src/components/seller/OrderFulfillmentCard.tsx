'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SubOrder {
  id: string;
  subOrderStatus: 'PLACED' | 'SELLER_ACCEPTED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  productTitleSnapshot: string;
  quantity: number;
  totalPrice: number;
  order: { orderNumber: string | null };
}

const NEXT_STATUS: Record<string, 'SELLER_ACCEPTED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | null> = {
  PLACED: 'SELLER_ACCEPTED',
  SELLER_ACCEPTED: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: null,
  DELIVERED: null,
  CANCELLED: null,
};

const NEXT_LABEL: Record<string, string> = {
  PLACED: 'Accept Order',
  SELLER_ACCEPTED: 'Mark Packed',
  PACKED: 'Mark Shipped',
  SHIPPED: 'Mark Out for Delivery',
};

export interface OrderFulfillmentCardProps {
  subOrder: SubOrder;
  onUpdated: (updated: SubOrder) => void;
  onVerifyDelivery?: () => void;
  className?: string;
}

export function OrderFulfillmentCard({ subOrder, onUpdated, onVerifyDelivery, className }: OrderFulfillmentCardProps) {
  const { fetchWithAuth } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = NEXT_STATUS[subOrder.subOrderStatus];

  const advance = async () => {
    if (!nextStatus) return;
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/seller/orders/${subOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to update order');
        return;
      }
      onUpdated(json.data);
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{subOrder.productTitleSnapshot}</p>
          <p className="text-xs text-slate-400">
            Qty: {subOrder.quantity} · ₹{subOrder.totalPrice.toLocaleString('en-IN')}
            {subOrder.order.orderNumber && ` · Order #${subOrder.order.orderNumber}`}
          </p>
        </div>
        <div className="flex-shrink-0">
          {nextStatus && (
            <button
              onClick={advance}
              disabled={isUpdating}
              className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {isUpdating ? 'Updating…' : NEXT_LABEL[subOrder.subOrderStatus]}
            </button>
          )}
          {subOrder.subOrderStatus === 'OUT_FOR_DELIVERY' && onVerifyDelivery && (
            <button
              onClick={onVerifyDelivery}
              className="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-medium text-white"
            >
              Confirm Delivery (OTP)
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}

export default OrderFulfillmentCard;