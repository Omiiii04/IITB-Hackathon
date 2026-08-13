import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Package, ShieldCheck } from 'lucide-react';
import { listProducts } from '@/modules/products/products.service';
import { listCategories } from '@/modules/categories/categories.service';
import { ProductCard } from '@/components/storefront/ProductCard';

export const metadata = {
  title: 'MarketHub — Multi-Vendor Marketplace',
  description:
    'Discover thousands of products from verified sellers on MarketHub. Shop electronics, fashion, home goods and more.',
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-12 w-12 text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm">No products listed yet — check back soon!</p>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
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
          className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-sm text-slate-300 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
        >
          {cat.name}
        </Link>
      ))}
      <Link
        href="/products"
        className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
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
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    desc: 'Every seller is approved and monitored for quality and compliance.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Package,
    title: 'Fast Fulfilment',
    desc: 'Real-time inventory with OTP-secured delivery handoffs.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
];

export default async function StorefrontHomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-slate-900 px-8 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-blue-500/20 blur-[80px]" />
          <div className="absolute bottom-0 right-0 h-48 w-96 rounded-full bg-indigo-500/15 blur-[80px]" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-6">
            <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
            <span>Multi-Vendor Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Shop from Hundreds of{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Verified Sellers
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            Discover competitive prices, exclusive deals, and curated collections — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/seller-register"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-all"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Shop by Category</h2>
          <Link href="/products" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            All Products <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <Suspense fallback={<div className="flex flex-wrap gap-2 justify-center">{Array.from({length:6}).map((_,i)=><div key={i} className="h-8 w-24 animate-pulse rounded-full bg-slate-800" />)}</div>}>
          <CategoryChipsSection />
        </Suspense>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {highlights.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className={`flex items-start gap-4 rounded-2xl border ${bg} p-5`}>
            <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">New Arrivals</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest products from our sellers</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Suspense fallback={<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-slate-800/60" />)}</div>}>
          <FeaturedProductsSection />
        </Suspense>
      </section>
    </div>
  );
}
