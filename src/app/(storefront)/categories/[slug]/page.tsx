import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { listCategories } from '@/modules/categories/categories.service';
import { listProducts } from '@/modules/products/products.service';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ChevronRight, ChevronLeft, LayoutGrid, SlidersHorizontal } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string; order?: string; minPrice?: string; maxPrice?: string }>;
}

// Find a category by slug (categories.service uses id — we list all and match by slug)
async function getCategoryBySlug(slug: string) {
  const all = await listCategories({ activeOnly: true, withChildren: true });
  return all.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found | MarketHub' };
  return {
    title: `${category.name} | MarketHub`,
    description: category.description ?? `Browse ${category.name} products on MarketHub.`,
  };
}



export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const sortBy = (sp.sortBy as 'createdAt' | 'basePrice' | 'title') ?? 'createdAt';
  const order = (sp.order as 'asc' | 'desc') ?? 'desc';
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const { products, total, totalPages } = await listProducts({
    categoryId: category.id,
    minPrice,
    maxPrice,
    sortBy,
    order,
    page,
    limit: 24,
  });

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (sp.minPrice) params.set('minPrice', sp.minPrice);
    if (sp.maxPrice) params.set('maxPrice', sp.maxPrice);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (order !== 'desc') params.set('order', order);
    params.set('page', String(page));
    for (const [key, val] of Object.entries(overrides)) {
      if (val === undefined) params.delete(key);
      else params.set(key, val);
    }
    const str = params.toString();
    return `/categories/${slug}${str ? `?${str}` : ''}`;
  }

  // Type cast subCategories from categories.service result
  const subCategories = (category as typeof category & { subCategories?: { id: string; name: string; slug: string; imageUrl?: string | null }[] }).subCategories ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-slate-300 transition-colors">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-400">{category.name}</span>
      </nav>

      {/* Category hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 p-8 md:p-12">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {category.imageUrl && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
              <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="80px" />
            </div>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-semibold text-blue-400 mb-3">
              <LayoutGrid className="h-3 w-3" />
              Category
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{category.name}</h1>
            {category.description && (
              <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">{category.description}</p>
            )}
            <p className="mt-3 text-xs text-slate-500">{total.toLocaleString()} product{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Sub-categories */}
      {subCategories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Sub-categories</h2>
          <div className="flex flex-wrap gap-2">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 px-4 py-2 text-sm font-medium text-slate-300 transition-all"
              >
                {sub.imageUrl && (
                  <div className="relative h-5 w-5 overflow-hidden rounded-md flex-shrink-0">
                    <Image src={sub.imageUrl} alt={sub.name} fill className="object-cover" sizes="20px" />
                  </div>
                )}
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Showing {((page - 1) * 24) + 1}–{Math.min(page * 24, total)} of {total.toLocaleString()} products
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500 flex-shrink-0" />
          <form method="GET" className="flex items-center gap-2">
            {sp.minPrice && <input type="hidden" name="minPrice" value={sp.minPrice} />}
            {sp.maxPrice && <input type="hidden" name="maxPrice" value={sp.maxPrice} />}
            <select
              name="sortBy"
              defaultValue={sortBy}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="createdAt">Newest</option>
              <option value="basePrice">Price</option>
              <option value="title">Name</option>
            </select>
            <select
              name="order"
              defaultValue={order}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Sort
            </button>
          </form>
        </div>
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No products in this category yet</h3>
          <p className="text-sm text-slate-400">Check back soon or browse all products.</p>
          <Link
            href="/products"
            className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors"
          >
            Browse All Products
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
            <nav aria-label="Category product pagination" className="mt-10 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Link>
              )}
              <span className="text-sm text-slate-500 px-2">Page {page} of {totalPages}</span>
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
  );
}
