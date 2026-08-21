'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface ProductSortFormProps {
  q?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy: string;
  order: string;
}

export function ProductSortForm({ q, categoryId, minPrice, maxPrice, sortBy, order }: ProductSortFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    (e.target.form as HTMLFormElement)?.submit();
  };

  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal className="h-4 w-4 text-[#64748B] flex-shrink-0" />
      <form method="GET" action="/products" className="flex items-center gap-2">
        {q && <input type="hidden" name="q" value={q} />}
        {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
        {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
        {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
        <select
          name="sortBy"
          defaultValue={sortBy}
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#191b23] focus:border-[#0058be] focus:outline-none shadow-2xs"
          onChange={handleChange}
        >
          <option value="createdAt">Newest</option>
          <option value="basePrice">Price</option>
          <option value="title">Name</option>
        </select>
        <select
          name="order"
          defaultValue={order}
          className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#191b23] focus:border-[#0058be] focus:outline-none shadow-2xs"
          onChange={handleChange}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </form>
    </div>
  );
}
