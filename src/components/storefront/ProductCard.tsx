'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    const firstVariant = product.variants[0];
    if (firstVariant) {
      addItem({
        variantId: firstVariant.id,
        productId: product.id,
        title: product.title,
        price: firstVariant.variantPrice,
        imageUrl: mainImage,
        storeName: product.store?.storeName ?? undefined,
      });
    }
  };

  return (
    <Link
      href={`/products/${product.slug ?? product.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 ${className ?? ''}`}
    >
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-800/50">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-slate-700" />
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 text-xs font-bold text-white">
            SALE
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category & brand */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          {product.category && (
            <span className="text-blue-400/80 font-medium">{product.category.name}</span>
          )}
          {product.category && product.brand && <span>·</span>}
          {product.brand && <span>{product.brand}</span>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
          {product.title}
        </h3>

        {/* Store */}
        {product.store && (
          <p className="text-[11px] text-slate-500 line-clamp-1">
            by {product.store.storeName}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through">{formatPrice(product.basePrice)}</span>
            )}
          </div>

          {/* Add-to-cart button */}
          {inStock && (
            <button
              type="button"
              aria-label={`Add ${product.title} to cart`}
              onClick={handleAddToCart}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-colors flex-shrink-0"
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
