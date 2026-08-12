'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Store, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { StoreCartGroup, ValidatedCartItem } from '@/modules/cart/cart.service';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    estimatedTax,
    estimatedShipping,
    total,
    storeGroups,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center backdrop-blur-sm max-w-lg mx-auto">
          <div className="h-20 w-20 rounded-3xl bg-slate-800 flex items-center justify-center mb-6 text-slate-500 shadow-inner">
            <ShoppingBag className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Your Shopping Cart is Empty</h1>
          <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
            Explore our multi-vendor marketplace and discover quality products from verified sellers.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Shopping Cart</h1>
            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-0.5 text-xs font-semibold text-blue-400">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Items from {storeGroups.length} store{storeGroups.length !== 1 ? 's' : ''} (will be processed as split sub-orders)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Cart</span>
          </button>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Grid: Store items on left, Summary on right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left items column */}
        <div className="lg:col-span-8 space-y-6">
          {storeGroups.map((group: StoreCartGroup) => (
            <div
              key={group.storeId}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4"
            >
              {/* Store title badge */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Store: <span className="text-white font-bold">{group.storeName}</span>
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Subtotal: <span className="text-slate-200 font-semibold">₹{group.subtotal.toLocaleString()}</span>
                </span>
              </div>

              {/* Items for this store */}
              <div className="space-y-3">
                {group.items.map((item: ValidatedCartItem) => (
                  <CartItemRow
                    key={`${item.productId}-${item.variantId ?? 'base'}`}
                    item={{
                      productId: item.productId,
                      variantId: item.variantId,
                      quantity: item.quantity,
                      title: item.title,
                      price: item.unitPrice,
                      imageUrl: item.imageUrl,
                      storeId: item.storeId,
                      storeName: item.storeName,
                      variantTitle: item.variantTitle,
                      slug: item.slug,
                    }}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right summary column */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <CartSummary
              subtotal={subtotal}
              estimatedTax={estimatedTax}
              estimatedShipping={estimatedShipping}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
