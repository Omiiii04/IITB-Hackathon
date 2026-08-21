import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById, getProductBySlug } from '@/modules/products/products.service';
import { Store, Tag, Package, ChevronRight, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard, ProductCardData } from '@/components/storefront/ProductCard';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { listProducts } from '@/modules/products/products.service';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProductVariant {
  id: string;
  sku?: string;
  title: string;
  variantPrice: number;
  stock: number;
  attributes?: Record<string, string> | unknown;
  imageUrl?: string | null;
}

interface ProductDetailData {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  brand?: string | null;
  basePrice: number;
  oldPrice?: number | null;
  discount?: string | null;
  images: unknown;
  category?: { id?: string; name: string; slug: string } | null;
  store?: { id?: string; storeName: string; slug: string } | null;
  variants?: ProductVariant[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CURATED_PRODUCTS: Record<string, ProductDetailData> = {
  p1: {
    id: 'p1',
    title: 'Nova Wireless Charger',
    slug: 'nova-wireless-charger',
    description: 'High-speed 15W Qi-certified magnetic wireless charging pad with intelligent heat dissipation and ultra-slim aluminum unibody.',
    brand: 'NovaTech',
    basePrice: 3750,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBciOrGfedXMc3cL4i5VsgZ4nen8GCuJ7ZSX5T6SwV8NSYBfm0Dl2ls7M_9JyNHkN-GR5sEu6QYm0myIBV8m4fjTQdz96ZxgFdvg9Ccg4NutG3ELKDxV7WKdq4PDflvhSCftyYtpsaUoCtQXjwKXJpLdu67FpJqGBTgX5BAkEXSlqxITu4Abx-kytJ5Dunu5N2BsXxvXqnGQMMdJaQoaDdERJ_I6rMKNTrpXUprnIuz9AH4PIIhcYDtjA'],
    category: { id: 'cat-power', name: 'Power', slug: 'power' },
    store: { id: 'store-nova', storeName: 'NovaTech Official', slug: 'novatech' },
    variants: [{ id: 'v1', sku: 'NOVA-W1', title: 'Arctic Silver', variantPrice: 3750, stock: 40, attributes: { Color: 'Silver' } }],
  },
  p2: {
    id: 'p2',
    title: 'Ergo Glide Mouse',
    slug: 'ergo-glide-mouse',
    description: 'Ergonomic wireless mouse with precision optical tracking up to 4000 DPI, silent switches, and 90-day rechargeable battery life.',
    brand: 'GlideLab',
    basePrice: 6550,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBzKSfVVor_nhz0mahsF4glBqrpuUpp-rpm4sexwye-Oy1ksP4Dtabp6OG6nJMtEGeXRquuf4G46KBMHCNQ2HHSOqEPTiJb7nKsX6fCBN4cKjT3QneNtsS4QNiqOnjQeLAyHzfXDzExb0zHu7wu9izhIHNUq-UZxxdW5vc5BCNhp2pSnPokbFFJFi55J5er8JgfdR4QrjxyNOleVJssW0Dz0Ifo0ndBzFY96dSiunhoG0z-oywQYMRAhQ'],
    category: { id: 'cat-peripherals', name: 'Peripherals', slug: 'peripherals' },
    store: { id: 'store-glide', storeName: 'GlideLab Ergonomics', slug: 'glidelab' },
    variants: [{ id: 'v2', sku: 'GLIDE-M1', title: 'Frost White', variantPrice: 6550, stock: 25, attributes: { Color: 'White' } }],
  },
  p3: {
    id: 'p3',
    title: 'Echo Buds Pro',
    slug: 'echo-buds-pro',
    description: 'Active Noise Cancelling true wireless earbuds with transparency mode, custom high-excursion drivers, and IPX5 water resistance.',
    brand: 'EchoAudio',
    basePrice: 12400,
    oldPrice: 14900,
    discount: '-15%',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAScxOOjiC8nM_fPEjFJzWNvHiBd2nUavymswu7S0J0fdFklVFT4eWM2lmsB2_WZ_brThFJCiqben5NSN6KIVKVwshnQRr6xdla2dnSrKsUIzTBbMoB3_gaDPFJqLsQwSPBN2GnBq2JJniogz_fodJH7gQZuDtbKQo-4IrXxqSS-6kwWB6aJcPTgxSq5ZCfShkFjEDRIDKWIijucENWxdtJdX_oxxAS0e09Fd9GoCQ18ZzgcfL36nGbmA'],
    category: { id: 'cat-audio', name: 'Audio', slug: 'audio' },
    store: { id: 'store-echo', storeName: 'Echo Acoustics', slug: 'echo-acoustics' },
    variants: [{ id: 'v3', sku: 'ECHO-B1', title: 'Carbon Grey', variantPrice: 10700, stock: 50, attributes: { Color: 'Grey' } }],
  },
  p4: {
    id: 'p4',
    title: 'Slate Pad Air',
    slug: 'slate-pad-air',
    description: 'Ultra-portable 11-inch 2K Retina display tablet with octa-core AI processor, stylus support, and all-day 12-hour battery life.',
    brand: 'SlateTech',
    basePrice: 41400,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCfsw4flS_ovpgcK6zpaX66vBDhwda-KYvQke-zXn4VPpfZ88itnVYIwRixw7Dendr5di9jVjT-E4sgqayR3MBLP3XG42T_96UhTNCBDaSh-z7UYpMQGl9OCUXmMWYzgAegFRPmavFSxNo_QStVQYfyRXTPVouRSm2_F7uAJwQlxTxY0BFTnKciSoOEEo8NmtfozgDVOhfKSEA6TaUxpNcOVSZzPmq872H0IbZckt8EeOBlw38jBDKhiA'],
    category: { id: 'cat-computing', name: 'Computing', slug: 'computing' },
    store: { id: 'store-slate', storeName: 'Slate Digital', slug: 'slate-digital' },
    variants: [{ id: 'v4', sku: 'SLATE-T1', title: 'Space Grey 128GB', variantPrice: 41400, stock: 15, attributes: { Storage: '128GB' } }],
  },
  'aura-smartwatch-gen-5': {
    id: 'aura-smartwatch-gen-5',
    title: 'Aura Smartwatch Gen 5',
    slug: 'aura-smartwatch-gen-5',
    description: 'Aerospace-grade titanium chassis, sapphire crystal display, dual-frequency GPS, comprehensive heart health & SpO2 tracking, and 7-day battery life.',
    brand: 'Aura Wearables',
    basePrice: 28990,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC76mcaj7nI9yn7b6o84piFgyKBDZwqbadDeTit_pWnOjDyS8KH1Cx5y9DmWwOmpOVbxCm9SC_7dknQHmdLTXqIDufScM8gNsrSuctXJD1giLMh1_PdBCulFMLam_tSUhkG6nKFsChQjyDYCKTLMabjKOJ1l6tVyDnYeu_MZ3kWsHzXAHTE4nqGqu5pb98S5noTlLbwuBqy6nDEoVe7L18N_IxRP25VF7vCSe4sG4Mu6fbL0TDikjz3qg'],
    category: { id: 'cat-wearables', name: 'Wearables', slug: 'wearables' },
    store: { id: 'store-aura', storeName: 'Aura Official', slug: 'aura' },
    variants: [
      { id: 'v5-a', sku: 'AURA-44-SIL', title: '44mm Titanium / Glacier Silver', variantPrice: 28990, stock: 20, attributes: { Size: '44mm', Color: 'Silver' } },
      { id: 'v5-b', sku: 'AURA-44-BLK', title: '44mm Titanium / Midnight Black', variantPrice: 28990, stock: 15, attributes: { Size: '44mm', Color: 'Black' } },
    ],
  },
  'sonic-pro-anc': {
    id: 'sonic-pro-anc',
    title: 'Sonic Pro ANC Wireless Headphones',
    slug: 'sonic-pro-anc',
    description: 'Studio-grade acoustic architecture with 40mm custom planar drivers, active hybrid noise cancellation, spatial audio with dynamic head tracking, and 45h playtime.',
    brand: 'Sonic Labs',
    basePrice: 24800,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBL74KcEYJvR7zXPcL0fwcacTkqsIxozB26gEvyD_u0PZEB3aQgiXVnoiKYq6v3qgSUrXvpeX4aLwG2sopSQclwzUC3uU2euSUY9SKBpVa5kytURM69OJcJAb__SiC3JbKHZilpw-CQxRiUvZ80fQjtRIdjoCl2fga8kMvUgN5zPGHJZiuDJR7ogbjoVuX03f8GbOJbVlNfCjyxhGSGnYAkbfI8UsfZ7Uhtng_1YywR2LdLHM1wXOWdiQ'],
    category: { id: 'cat-audio', name: 'Audio', slug: 'audio' },
    store: { id: 'store-sonic', storeName: 'Sonic Labs Store', slug: 'sonic-labs' },
    variants: [
      { id: 'v6-a', sku: 'SONIC-ANC-SIL', title: 'Lunar White', variantPrice: 24800, stock: 35, attributes: { Color: 'White' } },
      { id: 'v6-b', sku: 'SONIC-ANC-BLK', title: 'Obsidian Black', variantPrice: 24800, stock: 20, attributes: { Color: 'Black' } },
    ],
  },
  'typist-mech-2': {
    id: 'typist-mech-2',
    title: 'Typist Mech 2 Wireless Mechanical Keyboard',
    slug: 'typist-mech-2',
    description: 'Gasket-mounted hot-swappable mechanical keyboard with custom pre-lubed switches, CNC aluminum frame, PBT dye-sub keycaps, and triple-mode connectivity.',
    brand: 'Typist Studio',
    basePrice: 12000,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDt-ueqrFcgVKnkcbTH9CtWLr-rTrF4Nnj2BiOkx0CNrqW7KhxTEtKC5Rcgj5uGP2rVsN7YC2KFLT03JT8fSj3FUQufnIwYwpZu_0UJz_upC7wlGAB3C0V31K7MPGVCICdplUT1Ebbfp6aPyT1G1xx6f8dOBRuTax9cjOhViLhh3SfaH2PQR6jgredsUPfnwrfi6ECE-YfkxrDbRMv-y1J2s3oOu4GClU3Wp2pDyqXDPD68I3iLSh_joQ'],
    category: { id: 'cat-peripherals', name: 'Peripherals', slug: 'peripherals' },
    store: { id: 'store-typist', storeName: 'Typist Studio', slug: 'typist' },
    variants: [
      { id: 'v7-a', sku: 'TYPIST-M2-RED', title: 'Linear Red Switches / White Frame', variantPrice: 12000, stock: 18, attributes: { Switch: 'Linear Red' } },
      { id: 'v7-b', sku: 'TYPIST-M2-BRN', title: 'Tactile Brown Switches / White Frame', variantPrice: 12000, stock: 12, attributes: { Switch: 'Tactile Brown' } },
    ],
  },
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const curated = CURATED_PRODUCTS[decodedId] || Object.values(CURATED_PRODUCTS).find(p => p.slug === decodedId);
  const product = curated || (UUID_RE.test(decodedId) ? await getProductById(decodedId) : await getProductBySlug(decodedId));

  if (!product) return { title: 'Product Not Found | FlexHub' };

  return {
    title: `${product.title} | FlexHub`,
    description: product.description ? product.description.slice(0, 160) : `Buy ${product.title} on FlexHub.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  let product: ProductDetailData | null = CURATED_PRODUCTS[decodedId] || Object.values(CURATED_PRODUCTS).find(p => p.slug === decodedId) || null;

  if (!product) {
    product = (await (UUID_RE.test(decodedId) ? getProductById(decodedId) : getProductBySlug(decodedId))) as unknown as ProductDetailData;
  }

  if (!product) notFound();

  // Fetch related products from same category
  let related: ProductCardData[] = [];
  try {
    if (product.category?.id) {
      const res = await listProducts({ categoryId: product.category.id, page: 1, limit: 8, sortBy: 'createdAt', order: 'desc' });
      related = (res.products as unknown as ProductCardData[]).filter((p) => p.id !== product!.id).slice(0, 4);
    }
  } catch {
    related = [];
  }

  const variants = product.variants ?? [];
  const lowestVariantPrice = variants.length > 0
    ? Math.min(...variants.map((v) => v.variantPrice))
    : null;
  const displayPrice = lowestVariantPrice ?? product.basePrice;
  const hasDiscount = (lowestVariantPrice !== null && lowestVariantPrice < product.basePrice) || Boolean(product.discount);
  const totalStock = variants.reduce((sum: number, v) => sum + (v.stock || 0), 0);
  const inStock = variants.length === 0 ? true : totalStock > 0;
  
  const safeImages: string[] = Array.isArray(product.images)
    ? (product.images as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  const mainImage = safeImages[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBciOrGfedXMc3cL4i5VsgZ4nen8GCuJ7ZSX5T6SwV8NSYBfm0Dl2ls7M_9JyNHkN-GR5sEu6QYm0myIBV8m4fjTQdz96ZxgFdvg9Ccg4NutG3ELKDxV7WKdq4PDflvhSCftyYtpsaUoCtQXjwKXJpLdu67FpJqGBTgX5BAkEXSlqxITu4Abx-kytJ5Dunu5N2BsXxvXqnGQMMdJaQoaDdERJ_I6rMKNTrpXUprnIuz9AH4PIIhcYDtjA';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] mb-8">
        <Link href="/" className="hover:text-[#0058be] transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-[#0058be] transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-[#0058be] transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#191b23] font-semibold truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 mb-16">
        {/* Image gallery */}
        <div className="flex flex-col gap-4">
          {/* Main image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 flex items-center justify-center shadow-xs">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-20 w-20 text-[#94A3B8]" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs">
                <span className="rounded-full bg-slate-900 border border-slate-700 px-4 py-2 text-sm font-semibold text-white">
                  Out of Stock
                </span>
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 rounded-full bg-[#e1e2ec] text-[#191b23] px-3 py-1 text-xs font-bold shadow-2xs">
                {product.discount || 'Special Offer'}
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {safeImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {safeImages.slice(0, 6).map((img: string, i: number) => (
                <div
                  key={i}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
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
                className="inline-flex items-center gap-1 rounded-full border border-[#adc6ff] bg-[#d8e2ff] px-3 py-0.5 text-xs font-semibold text-[#0058be] hover:bg-[#c2d5ff] transition-colors"
              >
                <Tag className="h-3 w-3" />
                {product.category.name}
              </Link>
            )}
            {product.brand && (
              <span className="text-xs font-medium text-[#64748B]">by {product.brand}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191b23] leading-tight tracking-tight">
            {product.title}
          </h1>

          {/* Store */}
          {product.store && (
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Store className="h-4 w-4 text-[#0058be]" />
              <span>
                Sold by <span className="font-semibold text-[#191b23]">{product.store.storeName}</span>
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-[#191b23]">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[#94A3B8] line-through">
                  {formatPrice(product.oldPrice || product.basePrice)}
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  SAVE {product.discount || 'NOW'}
                </span>
              </>
            )}
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
                Available Options
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant: ProductVariant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={variant.stock === 0}
                    className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                      variant.stock === 0
                        ? 'border-[#E2E8F0] text-[#94A3B8] bg-[#F8FAFC] cursor-not-allowed'
                        : 'border-[#E2E8F0] text-[#191b23] hover:border-[#0058be] hover:text-[#0058be] bg-white shadow-2xs'
                    }`}
                  >
                    {variant.title || (typeof variant.attributes === 'object' && variant.attributes ? Object.values(variant.attributes as Record<string, string>).join(' / ') : '')}
                    {variant.stock === 0 && (
                      <span className="ml-1.5 text-xs text-[#94A3B8]">(Out of stock)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock & Delivery badges */}
          <div className="flex flex-wrap items-center gap-4 py-2 border-y border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-semibold ${inStock ? 'text-emerald-700' : 'text-red-600'}`}>
                {inStock ? `In Stock (${totalStock} units ready to ship)` : 'Out of Stock'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Truck className="h-3.5 w-3.5 text-[#0058be]" />
              <span>Fast Track Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0058be]" />
              <span>Verified FlexHub Guarantee</span>
            </div>
          </div>

          {/* Interactive CTA buttons */}
          <div className="flex gap-3 pt-2">
            <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                price: displayPrice,
                imageUrl: mainImage,
                storeName: product.store?.storeName,
                variantId: variants[0]?.id,
                variantTitle: variants[0]?.title,
                slug: product.slug ?? undefined,
              }}
              inStock={inStock}
            />
            <Link
              href="/cart"
              className="flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] px-6 py-3 text-sm font-semibold text-[#191b23] transition-colors shadow-2xs"
            >
              View Cart
            </Link>
          </div>

          {/* Description */}
          {product.description && (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-2xs">
              <h2 className="text-sm font-bold text-[#191b23] mb-2">Product Overview</h2>
              <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#191b23]">More from {product.category?.name}</h2>
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-sm font-semibold text-[#0058be] hover:underline transition-colors"
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
