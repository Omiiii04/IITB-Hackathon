'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutGrid, ChevronRight } from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  subCategories?: CategoryItem[];
}

export interface CategoryNavProps {
  categories?: CategoryItem[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function CategoryNav({
  categories = [],
  activeSlug,
  onSelectCategory,
  className = '',
  children,
}: CategoryNavProps) {
  if (children) {
    return <div className={className}>{children}</div>;
  }

  return (
    <nav
      aria-label="Category navigation"
      className={`flex flex-col gap-1 w-full ${className}`}
    >
      <Link
        href="/products"
        onClick={() => onSelectCategory?.('')}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          !activeSlug
            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        All Categories
      </Link>

      {categories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        const hasSubs = Boolean(cat.subCategories && cat.subCategories.length > 0);

        return (
          <div key={cat.id} className="flex flex-col">
            <Link
              href={`/categories/${cat.slug}`}
              onClick={() => onSelectCategory?.(cat.slug)}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.name}</span>
              {hasSubs && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
            </Link>

            {/* Sub-categories */}
            {hasSubs && (
              <div className="ml-4 pl-2 border-l border-slate-800 flex flex-col gap-0.5 mt-0.5">
                {cat.subCategories?.map((sub) => {
                  const isSubActive = activeSlug === sub.slug;
                  return (
                    <Link
                      key={sub.id}
                      href={`/categories/${sub.slug}`}
                      onClick={() => onSelectCategory?.(sub.slug)}
                      className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                        isSubActive
                          ? 'text-blue-400 font-semibold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default CategoryNav;
