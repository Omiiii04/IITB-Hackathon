'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function CartNavButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Open shopping cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
    >
      <ShoppingBag className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm shadow-blue-600/50 animate-in zoom-in">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}

export default CartNavButton;
