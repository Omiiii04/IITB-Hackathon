'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
    storeName?: string;
    variantId?: string;
    variantTitle?: string;
    slug?: string;
  };
  inStock?: boolean;
  className?: string;
}

export function AddToCartButton({ product, inStock = true, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!inStock) return;
    addItem({
      productId: product.id,
      variantId: product.variantId,
      variantTitle: product.variantTitle,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      storeName: product.storeName,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={handleAdd}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all shadow-sm active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed ${
        added
          ? 'bg-emerald-600 hover:bg-emerald-500'
          : 'bg-[#0058be] hover:bg-[#004395]'
      } ${className}`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </>
      )}
    </button>
  );
}

export default AddToCartButton;
