'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function StorefrontNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/categories?activeOnly=true')
      .then((r) => r.json())
      .then((body: { success: boolean; data?: Category[] }) => {
        if (body.success && body.data) setCategories(body.data.slice(0, 8));
      })
      .catch(() => {/* silently swallow on network error */});
  }, []);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Product categories"
      className="w-full overflow-x-auto border-t border-slate-800/60"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5 sm:px-6">
        <Link
          href="/products"
          className={`flex items-center gap-1.5 flex-shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            pathname === '/products'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="h-3 w-3" />
          All
        </Link>
        {categories.map((cat) => {
          const isActive = pathname?.includes(`/categories/${cat.slug}`);
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`flex-shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default StorefrontNav;
