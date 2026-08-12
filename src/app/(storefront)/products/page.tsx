import React from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { listProducts } from '@/modules/products/products.service';
import { listCategories } from '@/modules/categories/categories.service';
import { ProductCard } from '@/components/storefront/ProductCard';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    order?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: 'All Products | MarketHub',
  description: 'Browse thousands of products from verified sellers on MarketHub.',
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const q = sp.q?.trim() ?? '';
  const categoryId = sp.categoryId ?? '';
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const sortBy = (sp.sortBy as 'createdAt' | 'basePrice' | 'title') ?? 'createdAt';
  const order = (sp.order as 'asc' | 'desc') ?? 'desc';

  const [{ products, total, totalPages }, rootCategories] = await Promise.all([
    listProducts({ q: q || undefined, categoryId: categoryId || undefined, minPrice, maxPrice, sortBy, order, page, limit: 24 }),
    listCategories({ activeOnly: true, withChildren: false }),
  ]);

  // Helper to build updated search params
  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    if (sp.minPrice) params.set('minPrice', sp.minPrice);
    if (sp.maxPrice) params.set('maxPrice', sp.maxPrice);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (order !== 'desc') params.set('order', order);
    params.set('page', String(page));
    for (const [key, val] of Object.entries(overrides)) {
      if (val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    const str = params.toString();
    return `/products${str ? `?${str}` : ''}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {q ? `Results for "${q}"` : categoryId ? 'Products' : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {total.toLocaleString()} product{total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <form method="GET" action="/products" className="flex items-center gap-2">
            {q && <input type="hidden" name="q" value={q} />}
            {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
            {sp.minPrice && <input type="hidden" name="minPrice" value={sp.minPrice} />}
            {sp.maxPrice && <input type="hidden" name="maxPrice" value={sp.maxPrice} />}
            <select
              name="sortBy"
              defaultValue={sortBy}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              onChange={(e) => (e.target.form as HTMLFormElement)?.submit()}
            >
              <option value="createdAt">Newest</option>
              <option value="basePrice">Price</option>
              <option value="title">Name</option>
            </select>
            <select
              name="order"
              defaultValue={order}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              onChange={(e) => (e.target.form as HTMLFormElement)?.submit()}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </form>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-28 space-y-6">
            {/* Search */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Search</h2>
              <form action="/products" method="GET" className="relative">
                {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 pl-8 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </form>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={buildUrl({ categoryId: undefined, page: '1' })}
                    className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      !categoryId ? 'bg-blue-500/15 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    All Categories
                  </Link>
                </li>
                {rootCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={buildUrl({ categoryId: cat.id, page: '1' })}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        categoryId === cat.id ? 'bg-blue-500/15 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price filter */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Price Range</h2>
              <form action="/products" method="GET" className="space-y-2">
                {q && <input type="hidden" name="q" value={q} />}
                {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
                <input type="hidden" name="sortBy" value={sortBy} />
                <input type="hidden" name="order" value={order} />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={sp.minPrice ?? ''}
                    placeholder="Min"
                    min={0}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-slate-600 text-xs">–</span>
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={sp.maxPrice ?? ''}
                    placeholder="Max"
                    min={0}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 text-xs font-medium text-slate-300 transition-colors"
                >
                  Apply Filter
                </button>
                {(sp.minPrice || sp.maxPrice) && (
                  <Link
                    href={buildUrl({ minPrice: undefined, maxPrice: undefined, page: '1' })}
                    className="block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Clear price filter
                  </Link>
                )}
              </form>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {q ? `No results for "${q}". Try a different search term or clear your filters.` : 'No products match your current filters.'}
              </p>
              <Link
                href="/products"
                className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Product pagination" className="mt-10 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Link>
                  )}
                  <span className="text-sm text-slate-500 px-2">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
