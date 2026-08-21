import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { listCategories } from '@/modules/categories/categories.service';
import { listProducts } from '@/modules/products/products.service';
import { ProductCard, type ProductCardData } from '@/components/storefront/ProductCard';
import { ChevronRight, ChevronLeft, LayoutGrid, SlidersHorizontal } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string; order?: string; minPrice?: string; maxPrice?: string }>;
}

const FALLBACK_CATEGORIES = [
  { id: 'power', name: 'Power', slug: 'power' },
  { id: 'peripherals', name: 'Peripherals', slug: 'peripherals' },
  { id: 'audio', name: 'Audio', slug: 'audio' },
  { id: 'computing', name: 'Computing', slug: 'computing' },
  { id: 'wearables', name: 'Wearables', slug: 'wearables' },
];

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

// Find a category by slug (categories.service uses id — we list all and match by slug)
async function getCategoryBySlug(slug: string) {
  try {
    const all = await listCategories({ activeOnly: true, withChildren: true });
    const found = all.find((c) => c.slug === slug);
    if (found) return found;
  } catch {}
  const fallback = FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  if (fallback) {
    return {
      id: fallback.id,
      name: fallback.name,
      slug: fallback.slug,
      description: `Curated ${fallback.name} products on FlexHub.`,
      imageUrl: null as string | null,
      subCategories: [] as { id: string; name: string; slug: string; imageUrl?: string | null }[],
    };
  }
  return null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found | FlexHub' };
  return {
    title: `${category.name} | FlexHub`,
    description: category.description ?? `Browse ${category.name} products on FlexHub.`,
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

  let products: ProductCardData[] = [];
  let total = 0;
  let totalPages = 1;

  try {
    const res = await listProducts({
      categoryId: category.id,
      minPrice,
      maxPrice,
      sortBy,
      order,
      page,
      limit: 24,
    });
    products = res.products;
    total = res.total;
    totalPages = res.totalPages;
  } catch {
    products = [];
  }

  if (products.length === 0) {
    let filtered = FALLBACK_PRODUCTS.filter(
      (p) =>
        p.category.slug.toLowerCase() === slug.toLowerCase() ||
        p.category.name.toLowerCase() === category.name.toLowerCase()
    );
    if (minPrice !== undefined) filtered = filtered.filter((p) => p.basePrice >= minPrice);
    if (maxPrice !== undefined) filtered = filtered.filter((p) => p.basePrice <= maxPrice);
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
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] mb-8">
        <Link href="/" className="hover:text-[#191b23] transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-[#191b23] transition-colors">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#191b23] font-semibold">{category.name}</span>
      </nav>

      {/* Category hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 md:p-12 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {category.imageUrl && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
              <Image src={category.imageUrl} alt={category.name} fill className="object-cover" sizes="80px" />
            </div>
          )}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#adc6ff] bg-[#d8e2ff] px-3 py-0.5 text-xs font-bold text-[#0058be] mb-3">
              <LayoutGrid className="h-3 w-3" />
              Category
            </div>
            <h1 className="text-3xl font-extrabold text-[#191b23] sm:text-4xl">{category.name}</h1>
            {category.description && (
              <p className="mt-2 text-sm text-[#475569] max-w-xl leading-relaxed">{category.description}</p>
            )}
            <p className="mt-3 text-xs font-medium text-[#64748B]">{total.toLocaleString()} product{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Sub-categories */}
      {subCategories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">Sub-categories</h2>
          <div className="flex flex-wrap gap-2">
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#0058be] hover:text-[#0058be] px-4 py-2 text-sm font-semibold text-[#191b23] transition-all shadow-2xs"
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
        <p className="text-sm font-medium text-[#64748B]">
          Showing {((page - 1) * 24) + 1}–{Math.min(page * 24, total)} of {total.toLocaleString()} products
        </p>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#64748B] flex-shrink-0" />
          <form method="GET" className="flex items-center gap-2">
            {sp.minPrice && <input type="hidden" name="minPrice" value={sp.minPrice} />}
            {sp.maxPrice && <input type="hidden" name="maxPrice" value={sp.maxPrice} />}
            <select
              name="sortBy"
              defaultValue={sortBy}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#191b23] focus:border-[#0058be] focus:outline-none shadow-2xs"
            >
              <option value="createdAt">Newest</option>
              <option value="basePrice">Price</option>
              <option value="title">Name</option>
            </select>
            <select
              name="order"
              defaultValue={order}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#191b23] focus:border-[#0058be] focus:outline-none shadow-2xs"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#191b23] hover:bg-[#E2E8F0] transition-colors"
            >
              Sort
            </button>
          </form>
        </div>
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white py-24 text-center shadow-xs">
          <div className="h-16 w-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#94A3B8]">
            <LayoutGrid className="h-8 w-8 text-[#94A3B8]" />
          </div>
          <h3 className="text-lg font-bold text-[#191b23] mb-2">No products in this category yet</h3>
          <p className="text-sm text-[#64748B]">Check back soon or browse all products.</p>
          <Link
            href="/products"
            className="mt-6 rounded-xl bg-[#0058be] hover:bg-[#004395] px-5 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
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
                  className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#191b23] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Link>
              )}
              <span className="text-sm font-medium text-[#64748B] px-2">Page {page} of {totalPages}</span>
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
  );
}
