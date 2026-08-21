'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export interface ProductCardData {
  id: string;
  title: string;
  slug: string | null;
  basePrice: number;
  // Prisma stores images as JsonValue; we safely coerce to string[] at runtime
  images: unknown;
  brand?: string | null;
  category?: { name: string; slug: string } | null;
  store?: { storeName: string; slug: string } | null;
  variants: {
    id: string;
    variantPrice: number;
    stock: number;
  }[];
}

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const lowestVariantPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.variantPrice))
    : null;
  const displayPrice = lowestVariantPrice ?? product.basePrice;
  const hasDiscount = lowestVariantPrice !== null && lowestVariantPrice < product.basePrice;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const inStock = product.variants.length === 0 ? true : totalStock > 0;
  const safeImages: string[] = Array.isArray(product.images)
    ? (product.images as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];
  const mainImage = safeImages[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstVariant = product.variants?.[0];
    addItem({
      variantId: firstVariant?.id,
      productId: product.id,
      title: product.title,
      price: firstVariant?.variantPrice ?? product.basePrice,
      imageUrl: mainImage,
      storeName: product.store?.storeName ?? undefined,
      slug: product.slug ?? undefined,
    });
  };

  return (
    <Link
      href={`/products/${product.slug ?? product.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#0058be] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 ${className ?? ''}`}
    >
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC] p-4 flex items-center justify-center">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-[#94A3B8]" />
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <span className="rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 rounded-full bg-[#d8e2ff] border border-[#adc6ff] px-2.5 py-0.5 text-xs font-bold text-[#0058be]">
            SALE
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        {/* Category & brand */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
          {product.category && (
            <span className="text-[#0058be] font-semibold">{product.category.name}</span>
          )}
          {product.category && product.brand && <span>·</span>}
          {product.brand && <span>{product.brand}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#191b23] leading-snug line-clamp-2 group-hover:text-[#0058be] transition-colors">
          {product.title}
        </h3>

        {/* Store */}
        {product.store && (
          <p className="text-[11px] text-[#64748B] line-clamp-1">
            by {product.store.storeName}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-end justify-between gap-2 mt-2 pt-2 border-t border-[#F1F5F9]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-[#191b23]">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-[#94A3B8] line-through">{formatPrice(product.basePrice)}</span>
            )}
          </div>

          {/* Add-to-cart button */}
          {inStock && (
            <button
              type="button"
              aria-label={`Add ${product.title} to cart`}
              onClick={handleAddToCart}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0058be] hover:bg-[#004395] text-white shadow-2xs transition-colors flex-shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
