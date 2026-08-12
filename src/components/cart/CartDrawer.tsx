'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart, CartItem } from '@/hooks/useCart';
import { CartItemRow } from './CartItemRow';

export interface CartDrawerProps {
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

export function CartDrawer({ className = '', children }: CartDrawerProps) {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (children) {
    return <div className={className}>{children}</div>;
  }

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${className}`}>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#0f172a] border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Your Cart</h2>
              <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-semibold text-blue-400">
                {itemCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors mr-2"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-slate-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Looks like you haven&apos;t added any products to your cart yet.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item: CartItem) => (
                <CartItemRow
                  key={`${item.productId}-${item.variantId ?? 'base'}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))
            )}
          </div>

          {/* Drawer footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Subtotal</span>
                <span className="text-lg font-bold text-white">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="flex gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 py-3 text-xs font-semibold text-slate-200 transition-colors"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
