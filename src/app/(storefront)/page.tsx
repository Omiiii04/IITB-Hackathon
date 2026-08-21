import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Package, ShieldCheck } from 'lucide-react';
import { listProducts } from '@/modules/products/products.service';
import { listCategories } from '@/modules/categories/categories.service';
import { ProductCard } from '@/components/storefront/ProductCard';

export const metadata = {
  title: 'FlexHub — Multi-Vendor Marketplace',
  description:
    'Discover thousands of products from verified sellers on FlexHub. Shop electronics, peripherals, audio, computing and more.',
};

async function FeaturedProductsSection() {
  let products: Awaited<ReturnType<typeof listProducts>>['products'] = [];
  try {
    const result = await listProducts({ sortBy: 'createdAt', order: 'desc', page: 1, limit: 8 });
    products = result.products;
  } catch {
    products = [];
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-[#E2E8F0] bg-white p-8">
        <Package className="h-12 w-12 text-[#94A3B8] mb-4" />
        <p className="text-[#64748B] text-sm">Explore thousands of curated products on FlexHub!</p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0058be] hover:underline transition-colors"
        >
          Browse all products <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

async function CategoryChipsSection() {
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  try {
    categories = await listCategories({ activeOnly: true, withChildren: false });
  } catch {
    categories = [];
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.slice(0, 10).map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="rounded-full border border-[#E2E8F0] bg-white px-4 py-1.5 text-sm font-semibold text-[#191b23] hover:border-[#0058be] hover:text-[#0058be] hover:bg-[#F8FAFC] transition-all duration-200 shadow-2xs"
        >
          {cat.name}
        </Link>
      ))}
      <Link
        href="/products"
        className="rounded-full border border-[#adc6ff] bg-[#d8e2ff] px-4 py-1.5 text-sm font-bold text-[#0058be] hover:bg-[#c4d6ff] transition-colors"
      >
        View all
      </Link>
    </div>
  );
}

const highlights = [
  {
    icon: TrendingUp,
    title: 'Trending Deals',
    desc: 'Curated top picks updated daily across all seller stores.',
    color: 'text-[#0058be]',
    bg: 'bg-white border-[#E2E8F0]',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    desc: 'Every seller is approved and monitored for quality and compliance.',
    color: 'text-emerald-600',
    bg: 'bg-white border-[#E2E8F0]',
  },
  {
    icon: Package,
    title: 'Fast Fulfilment',
    desc: 'Real-time inventory with OTP-secured delivery handoffs.',
    color: 'text-amber-600',
    bg: 'bg-white border-[#E2E8F0]',
  },
];

export default async function StorefrontHomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-gradient-to-br from-blue-50 via-indigo-50/40 to-white px-8 py-16 text-center shadow-xs">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#adc6ff] bg-[#d8e2ff] px-4 py-1.5 text-xs font-bold text-[#0058be] mb-6 shadow-2xs">
            <Sparkles className="h-3 w-3 text-[#0058be]" />
            <span>FlexHub Multi-Vendor Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#191b23] mb-4">
            Shop from Hundreds of{' '}
            <span className="text-[#0058be]">
              Verified Sellers
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-[#475569] text-sm sm:text-base leading-relaxed mb-8">
            Discover competitive prices, instantaneous reservation locks, and curated collections — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0058be] hover:bg-[#004395] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/seller-register"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] px-6 py-2.5 text-sm font-semibold text-[#191b23] transition-all shadow-2xs"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#191b23]">Shop by Category</h2>
          <Link href="/products" className="text-xs font-bold text-[#0058be] hover:underline transition-colors flex items-center gap-1">
            All Products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Suspense fallback={<div className="flex flex-wrap gap-2 justify-center">{Array.from({length:6}).map((_,i)=><div key={i} className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />)}</div>}>
          <CategoryChipsSection />
        </Suspense>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {highlights.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className={`flex items-start gap-4 rounded-3xl border ${bg} p-6 shadow-2xs`}>
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#191b23] mb-1">{title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#191b23]">New Arrivals</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Latest products from our sellers</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0058be] hover:underline transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Suspense fallback={<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-100" />)}</div>}>
          <FeaturedProductsSection />
        </Suspense>
      </section>
    </div>
  );
}
