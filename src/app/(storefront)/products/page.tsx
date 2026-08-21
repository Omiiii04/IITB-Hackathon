import React from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { listProducts } from '@/modules/products/products.service';
import { listCategories } from '@/modules/categories/categories.service';
import { ProductCard, ProductCardData } from '@/components/storefront/ProductCard';
import { ProductSortForm } from '@/components/storefront/ProductSortForm';

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
  title: 'All Products | FlexHub',
  description: 'Browse thousands of products from verified sellers on FlexHub.',
};

const FALLBACK_PRODUCTS = [
  {
    id: 'p1',
    title: 'Nova Wireless Charger',
    slug: 'nova-wireless-charger',
    basePrice: 3750,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBciOrGfedXMc3cL4i5VsgZ4nen8GCuJ7ZSX5T6SwV8NSYBfm0Dl2ls7M_9JyNHkN-GR5sEu6QYm0myIBV8m4fjTQdz96ZxgFdvg9Ccg4NutG3ELKDxV7WKdq4PDflvhSCftyYtpsaUoCtQXjwKXJpLdu67FpJqGBTgX5BAkEXSlqxITu4Abx-kytJ5Dunu5N2BsXxvXqnGQMMdJaQoaDdERJ_I6rMKNTrpXUprnIuz9AH4PIIhcYDtjA'],
    brand: 'NovaTech',
    category: { name: 'Power', slug: 'power' },
    store: { storeName: 'NovaTech Official', slug: 'novatech' },
    variants: [{ id: 'v1', variantPrice: 3750, stock: 40 }],
  },
  {
    id: 'p2',
    title: 'Ergo Glide Mouse',
    slug: 'ergo-glide-mouse',
    basePrice: 6550,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBzKSfVVor_nhz0mahsF4glBqrpuUpp-rpm4sexwye-Oy1ksP4Dtabp6OG6nJMtEGeXRquuf4G46KBMHCNQ2HHSOqEPTiJb7nKsX6fCBN4cKjT3QneNtsS4QNiqOnjQeLAyHzfXDzExb0zHu7wu9izhIHNUq-UZxxdW5vc5BCNhp2pSnPokbFFJFi55J5er8JgfdR4QrjxyNOleVJssW0Dz0Ifo0ndBzFY96dSiunhoG0z-oywQYMRAhQ'],
    brand: 'GlideLab',
    category: { name: 'Peripherals', slug: 'peripherals' },
    store: { storeName: 'GlideLab Ergonomics', slug: 'glidelab' },
    variants: [{ id: 'v2', variantPrice: 6550, stock: 25 }],
  },
  {
    id: 'p3',
    title: 'Echo Buds Pro',
    slug: 'echo-buds-pro',
    basePrice: 12400,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAScxOOjiC8nM_fPEjFJzWNvHiBd2nUavymswu7S0J0fdFklVFT4eWM2lmsB2_WZ_brThFJCiqben5NSN6KIVKVwshnQRr6xdla2dnSrKsUIzTBbMoB3_gaDPFJqLsQwSPBN2GnBq2JJniogz_fodJH7gQZuDtbKQo-4IrXxqSS-6kwWB6aJcPTgxSq5ZCfShkFjEDRIDKWIijucENWxdtJdX_oxxAS0e09Fd9GoCQ18ZzgcfL36nGbmA'],
    brand: 'EchoAudio',
    category: { name: 'Audio', slug: 'audio' },
    store: { storeName: 'Echo Acoustics', slug: 'echo-acoustics' },
    variants: [{ id: 'v3', variantPrice: 10700, stock: 50 }],
  },
  {
    id: 'p4',
    title: 'Slate Pad Air',
    slug: 'slate-pad-air',
    basePrice: 41400,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCfsw4flS_ovpgcK6zpaX66vBDhwda-KYvQke-zXn4VPpfZ88itnVYIwRixw7Dendr5di9jVjT-E4sgqayR3MBLP3XG42T_96UhTNCBDaSh-z7UYpMQGl9OCUXmMWYzgAegFRPmavFSxNo_QStVQYfyRXTPVouRSm2_F7uAJwQlxTxY0BFTnKciSoOEEo8NmtfozgDVOhfKSEA6TaUxpNcOVSZzPmq872H0IbZckt8EeOBlw38jBDKhiA'],
    brand: 'SlateTech',
    category: { name: 'Computing', slug: 'computing' },
    store: { storeName: 'Slate Digital', slug: 'slate-digital' },
    variants: [{ id: 'v4', variantPrice: 41400, stock: 15 }],
  },
  {
    id: 'aura-smartwatch-gen-5',
    title: 'Aura Smartwatch Gen 5',
    slug: 'aura-smartwatch-gen-5',
    basePrice: 28990,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC76mcaj7nI9yn7b6o84piFgyKBDZwqbadDeTit_pWnOjDyS8KH1Cx5y9DmWwOmpOVbxCm9SC_7dknQHmdLTXqIDufScM8gNsrSuctXJD1giLMh1_PdBCulFMLam_tSUhkG6nKFsChQjyDYCKTLMabjKOJ1l6tVyDnYeu_MZ3kWsHzXAHTE4nqGqu5pb98S5noTlLbwuBqy6nDEoVe7L18N_IxRP25VF7vCSe4sG4Mu6fbL0TDikjz3qg'],
    brand: 'Aura Wearables',
    category: { name: 'Wearables', slug: 'wearables' },
    store: { storeName: 'Aura Official', slug: 'aura' },
    variants: [{ id: 'v5', variantPrice: 28990, stock: 20 }],
  },
  {
    id: 'sonic-pro-anc',
    title: 'Sonic Pro ANC Wireless Headphones',
    slug: 'sonic-pro-anc',
    basePrice: 24800,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBL74KcEYJvR7zXPcL0fwcacTkqsIxozB26gEvyD_u0PZEB3aQgiXVnoiKYq6v3qgSUrXvpeX4aLwG2sopSQclwzUC3uU2euSUY9SKBpVa5kytURM69OJcJAb__SiC3JbKHZilpw-CQxRiUvZ80fQjtRIdjoCl2fga8kMvUgN5zPGHJZiuDJR7ogbjoVuX03f8GbOJbVlNfCjyxhGSGnYAkbfI8UsfZ7Uhtng_1YywR2LdLHM1wXOWdiQ'],
    brand: 'Sonic Labs',
    category: { name: 'Audio', slug: 'audio' },
    store: { storeName: 'Sonic Labs Store', slug: 'sonic-labs' },
    variants: [{ id: 'v6', variantPrice: 24800, stock: 35 }],
  },
  {
    id: 'typist-mech-2',
    title: 'Typist Mech 2 Wireless Mechanical Keyboard',
    slug: 'typist-mech-2',
    basePrice: 12000,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDt-ueqrFcgVKnkcbTH9CtWLr-rTrF4Nnj2BiOkx0CNrqW7KhxTEtKC5Rcgj5uGP2rVsN7YC2KFLT03JT8fSj3FUQufnIwYwpZu_0UJz_upC7wlGAB3C0V31K7MPGVCICdplUT1Ebbfp6aPyT1G1xx6f8dOBRuTax9cjOhViLhh3SfaH2PQR6jgredsUPfnwrfi6ECE-YfkxrDbRMv-y1J2s3oOu4GClU3Wp2pDyqXDPD68I3iLSh_joQ'],
    brand: 'Typist Studio',
    category: { name: 'Peripherals', slug: 'peripherals' },
    store: { storeName: 'Typist Studio', slug: 'typist' },
    variants: [{ id: 'v7', variantPrice: 12000, stock: 18 }],
  },
];

const FALLBACK_CATEGORIES = [
  { id: 'power', name: 'Power', slug: 'power' },
  { id: 'peripherals', name: 'Peripherals', slug: 'peripherals' },
  { id: 'audio', name: 'Audio', slug: 'audio' },
  { id: 'computing', name: 'Computing', slug: 'computing' },
  { id: 'wearables', name: 'Wearables', slug: 'wearables' },
];

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const q = sp.q?.trim() ?? '';
  const categoryId = sp.categoryId ?? '';
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const sortBy = (sp.sortBy as 'createdAt' | 'basePrice' | 'title') ?? 'createdAt';
  const order = (sp.order as 'asc' | 'desc') ?? 'desc';

  let products: ProductCardData[] = [];
  let total = 0;
  let totalPages = 1;
  let rootCategories: { id: string; name: string; slug: string }[] = [];

  try {
    const [res, cats] = await Promise.all([
      listProducts({ q: q || undefined, categoryId: categoryId || undefined, minPrice, maxPrice, sortBy, order, page, limit: 24 }),
      listCategories({ activeOnly: true, withChildren: false }),
    ]);
    products = res.products as unknown as ProductCardData[];
    total = res.total;
    totalPages = res.totalPages;
    rootCategories = cats;
  } catch {
    products = [];
    total = 0;
  }

  if (rootCategories.length === 0) {
    rootCategories = FALLBACK_CATEGORIES;
  }

  // Use curated fallback if database query returned no results or is unseeded
  if (products.length === 0) {
    let filtered = FALLBACK_PRODUCTS;
    if (categoryId) {
      filtered = filtered.filter(
        (p) =>
          p.category.slug.toLowerCase() === categoryId.toLowerCase() ||
          p.category.name.toLowerCase() === categoryId.toLowerCase() ||
          p.id === categoryId
      );
    }
    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQ) ||
          p.brand.toLowerCase().includes(lowerQ) ||
          p.category.name.toLowerCase().includes(lowerQ) ||
          p.category.slug.toLowerCase().includes(lowerQ)
      );
    }
    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => p.basePrice >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.basePrice <= maxPrice);
    }
    if (sortBy === 'basePrice') {
      filtered = [...filtered].sort((a, b) =>
        order === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
      );
    } else if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) =>
        order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      );
    }
    products = filtered;
    total = filtered.length;
    totalPages = Math.max(1, Math.ceil(total / 24));
  }

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
          <h1 className="text-2xl font-extrabold text-[#191b23]">
            {q ? `Results for "${q}"` : categoryId ? 'Products' : 'All Products'}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {total.toLocaleString()} product{total !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Sort controls */}
        <ProductSortForm
          q={q || undefined}
          categoryId={categoryId || undefined}
          minPrice={sp.minPrice}
          maxPrice={sp.maxPrice}
          sortBy={sortBy}
          order={order}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="md:sticky md:top-28 space-y-6">
            {/* Search */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Search</h2>
              <form action="/products" method="GET" className="relative flex items-center gap-2">
                {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
                {sp.minPrice && <input type="hidden" name="minPrice" value={sp.minPrice} />}
                {sp.maxPrice && <input type="hidden" name="maxPrice" value={sp.maxPrice} />}
                {sortBy !== 'createdAt' && <input type="hidden" name="sortBy" value={sortBy} />}
                {order !== 'desc' && <input type="hidden" name="order" value={order} />}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-8 pr-3 py-2 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex-shrink-0 rounded-xl bg-[#0058be] hover:bg-[#004395] px-3 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Go
                </button>
              </form>
              {q && (
                <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                  <span className="truncate mr-1">Active: &ldquo;{q}&rdquo;</span>
                  <Link
                    href={buildUrl({ q: undefined, page: '1' })}
                    className="text-[#0058be] hover:underline font-medium flex-shrink-0"
                  >
                    Clear
                  </Link>
                </div>
              )}
            </div>

            {/* Categories */}
            {rootCategories.length > 0 && (
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
                <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Categories</h2>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href={buildUrl({ categoryId: undefined, page: '1' })}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        !categoryId ? 'bg-[#d8e2ff] text-[#0058be] font-semibold' : 'text-[#64748B] hover:text-[#191b23] hover:bg-[#F8FAFC]'
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
                          categoryId === cat.id ? 'bg-[#d8e2ff] text-[#0058be] font-semibold' : 'text-[#64748B] hover:text-[#191b23] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price filter */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">Price Range</h2>
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
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[#94A3B8] text-xs">–</span>
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={sp.maxPrice ?? ''}
                    placeholder="Max"
                    min={0}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] py-1.5 text-xs font-semibold text-[#191b23] transition-colors"
                >
                  Apply Filter
                </button>
                {(sp.minPrice || sp.maxPrice) && (
                  <Link
                    href={buildUrl({ minPrice: undefined, maxPrice: undefined, page: '1' })}
                    className="block text-center text-xs text-[#0058be] hover:underline transition-colors pt-1"
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
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white py-24 px-6 text-center shadow-xs">
              <div className="h-16 w-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#64748B]">
                <Search className="h-8 w-8 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-bold text-[#191b23] mb-2">No products found</h3>
              <p className="text-sm text-[#64748B] max-w-sm">
                {q ? `No results for "${q}". Try a different search term or clear your filters.` : 'No products match your current filters.'}
              </p>
              <Link
                href="/products"
                className="mt-6 rounded-xl bg-[#0058be] hover:bg-[#004395] px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
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
                      className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#191b23] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Link>
                  )}
                  <span className="text-sm font-medium text-[#64748B] px-2">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#191b23] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
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
