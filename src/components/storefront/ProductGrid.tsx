import React from 'react';
import { ProductCard, ProductCardData } from './ProductCard';
import { PackageSearch } from 'lucide-react';

export interface ProductGridProps {
  products?: ProductCardData[];
  isLoading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
  className?: string;
  children?: React.ReactNode;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
  columns = 4,
  className = '',
  children,
}: ProductGridProps) {
  // If children are passed directly, render them in the grid container
  if (children) {
    return (
      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-${columns} ${className}`}>
        {children}
      </div>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex flex-col rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden h-[340px] shadow-xs"
          >
            <div className="aspect-square w-full bg-[#F8FAFC]" />
            <div className="p-4 flex flex-col gap-2 flex-1">
              <div className="h-3 w-1/3 bg-[#F1F5F9] rounded" />
              <div className="h-4 w-5/6 bg-[#F1F5F9] rounded" />
              <div className="h-4 w-2/3 bg-[#F1F5F9] rounded" />
              <div className="mt-auto flex justify-between items-center">
                <div className="h-5 w-20 bg-[#F1F5F9] rounded" />
                <div className="h-8 w-8 bg-[#F1F5F9] rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-[#E2E8F0] rounded-3xl bg-white shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-3 text-[#64748B]">
          <PackageSearch className="h-6 w-6 text-[#94A3B8]" />
        </div>
        <p className="text-[#191b23] font-bold text-sm">{emptyMessage}</p>
        <p className="text-[#64748B] text-xs mt-1">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
