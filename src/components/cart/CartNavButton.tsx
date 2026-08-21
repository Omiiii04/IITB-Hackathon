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
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#191b23] transition-colors"
    >
      <ShoppingBag className="h-4 w-4 text-[#191b23]" />
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0058be] text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}

export default CartNavButton;
