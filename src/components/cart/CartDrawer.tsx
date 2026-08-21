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
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#E2E8F0] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#0058be]" />
              <h2 className="text-base font-bold text-[#191b23]">Your Cart</h2>
              <span className="rounded-full bg-[#d8e2ff] border border-[#adc6ff] px-2 py-0.5 text-xs font-semibold text-[#0058be]">
                {itemCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-[#64748B] hover:text-red-600 transition-colors mr-2 font-medium"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                className="rounded-xl p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#191b23] transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#64748B]">
                  <ShoppingBag className="h-8 w-8 text-[#0058be]" />
                </div>
                <h3 className="text-base font-semibold text-[#191b23] mb-1">Your cart is empty</h3>
                <p className="text-xs text-[#64748B] max-w-xs mb-6 leading-relaxed">
                  Looks like you haven&apos;t added any products to your cart yet.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0058be] hover:bg-[#004395] px-5 py-2.5 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Browse Products</span>
                </Link>
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
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-medium">Subtotal</span>
                <span className="text-lg font-bold text-[#191b23]">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="flex gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] py-3 text-xs font-semibold text-[#191b23] transition-colors shadow-xs"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0058be] hover:bg-[#004395] py-3 text-xs font-semibold text-white shadow-sm transition-all"
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
