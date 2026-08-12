'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2, Package } from 'lucide-react';
import type { CartItem } from '@/hooks/useCart';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity?: (productId: string, variantId: string | undefined, quantity: number) => void;
  onRemove?: (productId: string, variantId?: string) => void;
  compact?: boolean;
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

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
  className = '',
  children,
}: CartItemRowProps) {
  if (children) {
    return <div className={className}>{children}</div>;
  }

  const handleIncrement = () => {
    onUpdateQuantity?.(item.productId, item.variantId, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity?.(item.productId, item.variantId, item.quantity - 1);
    } else {
      onRemove?.(item.productId, item.variantId);
    }
  };

  const handleRemove = () => {
    onRemove?.(item.productId, item.variantId);
  };

  const itemSubtotal = item.price * item.quantity;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-slate-700/80 ${className}`}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-800/50">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <Package className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Link
          href={`/products/${item.slug || item.productId}`}
          className="text-xs font-semibold text-slate-100 hover:text-blue-400 transition-colors line-clamp-1"
        >
          {item.title}
        </Link>

        {item.variantTitle && (
          <span className="text-[11px] text-slate-400 line-clamp-1">
            Option: {item.variantTitle}
          </span>
        )}

        {item.storeName && !compact && (
          <span className="text-[10px] text-slate-500 line-clamp-1">
            Sold by {item.storeName}
          </span>
        )}

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs font-bold text-white">
            {formatPrice(item.price)}
          </span>

          {/* Stepper */}
          <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 p-0.5">
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-slate-200">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtotal & remove */}
      {!compact && (
        <div className="flex flex-col items-end justify-between gap-2 self-stretch py-0.5">
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove item"
            className="text-slate-500 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <span className="text-xs font-extrabold text-blue-400">
            {formatPrice(itemSubtotal)}
          </span>
        </div>
      )}
    </div>
  );
}

export default CartItemRow;
