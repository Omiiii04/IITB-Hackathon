'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export interface ProductVariant {
  id: string;
  sku?: string;
  title?: string | null;
  variantPrice: number;
  stock: number;
  attributes?: Record<string, string> | unknown;
  imageUrl?: string | null;
}

export interface VariantSelectorProps {
  variants?: ProductVariant[];
  selectedVariantId?: string;
  onSelectVariant?: (variant: ProductVariant) => void;
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

export function VariantSelector({
  variants = [],
  selectedVariantId,
  onSelectVariant,
  className = '',
  children,
}: VariantSelectorProps) {
  if (children) {
    return <div className={className}>{children}</div>;
  }

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Select Variant
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOos = variant.stock <= 0;

          // Parse attributes text if title isn't provided
          const attrObj =
            typeof variant.attributes === 'object' && variant.attributes !== null
              ? (variant.attributes as Record<string, string>)
              : {};
          const attrLabel =
            variant.title ||
            Object.entries(attrObj)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' / ') ||
            variant.sku ||
            'Default';

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isOos}
              onClick={() => onSelectVariant?.(variant)}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                  : isOos
                  ? 'border-slate-800/80 bg-slate-900/30 opacity-50 cursor-not-allowed'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {variant.imageUrl && (
                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                    <Image
                      src={variant.imageUrl}
                      alt={attrLabel}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-blue-400' : 'text-slate-200'
                    }`}
                  >
                    {attrLabel}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatPrice(variant.variantPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isOos ? (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    OOS
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    {variant.stock} left
                  </span>
                )}
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VariantSelector;
