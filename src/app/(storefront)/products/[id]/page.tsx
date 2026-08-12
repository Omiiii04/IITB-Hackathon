import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProductById, getProductBySlug } from '@/modules/products/products.service';
import { ShoppingCart, Store, Tag, Package, ChevronRight, Star } from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';
import { listProducts } from '@/modules/products/products.service';

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = UUID_RE.test(id) ? await getProductById(id) : await getProductBySlug(id);
  if (!product) return { title: 'Product Not Found | MarketHub' };
  return {
    title: `${product.title} | MarketHub`,
    description: product.description?.slice(0, 160) ?? '',
  };
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = UUID_RE.test(id) ? await getProductById(id) : await getProductBySlug(id);

  if (!product) notFound();

  // Fetch related products from same category (exclude this one)
  const related = product.category
    ? await listProducts({ categoryId: product.category.id, page: 1, limit: 8, sortBy: 'createdAt', order: 'desc' })
        .then((r) => r.products.filter((p) => p.id !== product.id).slice(0, 4))
    : [];

  const lowestVariantPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.variantPrice))
    : null;
  const displayPrice = lowestVariantPrice ?? product.basePrice;
  const hasDiscount = lowestVariantPrice !== null && lowestVariantPrice < product.basePrice;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const inStock = product.variants.length === 0 || totalStock > 0;
  // Coerce Prisma JsonValue (images column) to string[] safely
  const safeImages: string[] = Array.isArray(product.images)
    ? (product.images as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-slate-300 transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-slate-300 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-400 truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 mb-16">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-800/40">
            {Array.isArray(product.images) && safeImages[0] ? (
              <Image
                src={safeImages[0]}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-20 w-20 text-slate-700" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                <span className="rounded-full bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {safeImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {safeImages.slice(0, 6).map((img: string, i: number) => (
                <div
                  key={i}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40"
                >
                  <Image src={img} alt={`${product.title} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6">
          {/* Category & brand */}
          <div className="flex items-center gap-2">
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Tag className="h-3 w-3" />
                {product.category.name}
              </Link>
            )}
            {product.brand && (
              <span className="text-xs text-slate-500">{product.brand}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white leading-snug sm:text-3xl">{product.title}</h1>

          {/* Store */}
          {product.store && (
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-400">
                Sold by{' '}
                <span className="font-medium text-slate-300">{product.store.storeName}</span>
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-slate-500 line-through">{formatPrice(product.basePrice)}</span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">
                  SALE
                </span>
              </>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Available Options
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={variant.stock === 0}
                    className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                      variant.stock === 0
                        ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'border-slate-700 text-slate-300 hover:border-blue-500 hover:text-blue-400 bg-slate-800/60 hover:bg-blue-500/10'
                    }`}
                  >
                    {variant.title || Object.values((variant.attributes as Record<string, string>) ?? {}).join(' / ')}
                    {variant.stock === 0 && (
                      <span className="ml-1.5 text-xs text-slate-600">(OOS)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-emerald-400' : 'text-red-400'}`}>
              {inStock ? `In Stock${totalStock > 0 ? ` (${totalStock} available)` : ''}` : 'Out of Stock'}
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!inStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <Link
              href="/cart"
              className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              View Cart
            </Link>
          </div>

          {/* Description */}
          {product.description && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 mb-3">Description</h2>
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">More from {product.category?.name}</h2>
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                See all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
