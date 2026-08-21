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
      <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
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
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#0058be] bg-[#d8e2ff]/20 ring-1 ring-[#0058be]'
                  : isOos
                  ? 'border-[#E2E8F0] bg-[#F8FAFC] opacity-50 cursor-not-allowed'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {variant.imageUrl && (
                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                    <Image
                      src={variant.imageUrl}
                      alt={attrLabel}
                      fill
                      className="object-contain p-0.5 mix-blend-multiply"
                      sizes="36px"
                    />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-[#0058be]' : 'text-[#191b23]'
                    }`}
                  >
                    {attrLabel}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-medium">
                    {formatPrice(variant.variantPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isOos ? (
                  <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#94A3B8]">
                    OOS
                  </span>
                ) : (
                  <span className="text-[10px] text-[#64748B]">
                    {variant.stock} left
                  </span>
                )}
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0058be] text-white">
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
