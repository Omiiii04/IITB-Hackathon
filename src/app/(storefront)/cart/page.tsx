'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  ArrowLeft,
  Trash2,
  ArrowRight,
  Plus,
  Sparkles,
  Check,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { StoreCartGroup, ValidatedCartItem } from '@/modules/cart/cart.service';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';

const TRENDING_RECOMMENDATIONS = [
  {
    id: 'p1',
    category: 'Power',
    name: 'Nova Wireless Charger',
    price: '₹3,750',
    numericPrice: 3750,
    oldPrice: null,
    discount: null,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBciOrGfedXMc3cL4i5VsgZ4nen8GCuJ7ZSX5T6SwV8NSYBfm0Dl2ls7M_9JyNHkN-GR5sEu6QYm0myIBV8m4fjTQdz96ZxgFdvg9Ccg4NutG3ELKDxV7WKdq4PDflvhSCftyYtpsaUoCtQXjwKXJpLdu67FpJqGBTgX5BAkEXSlqxITu4Abx-kytJ5Dunu5N2BsXxvXqnGQMMdJaQoaDdERJ_I6rMKNTrpXUprnIuz9AH4PIIhcYDtjA',
    alt: 'Nova Wireless Charger',
  },
  {
    id: 'p2',
    category: 'Peripherals',
    name: 'Ergo Glide Mouse',
    price: '₹6,550',
    numericPrice: 6550,
    oldPrice: null,
    discount: null,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzKSfVVor_nhz0mahsF4glBqrpuUpp-rpm4sexwye-Oy1ksP4Dtabp6OG6nJMtEGeXRquuf4G46KBMHCNQ2HHSOqEPTiJb7nKsX6fCBN4cKjT3QneNtsS4QNiqOnjQeLAyHzfXDzExb0zHu7wu9izhIHNUq-UZxxdW5vc5BCNhp2pSnPokbFFJFi55J5er8JgfdR4QrjxyNOleVJssW0Dz0Ifo0ndBzFY96dSiunhoG0z-oywQYMRAhQ',
    alt: 'Ergo Glide Mouse',
  },
  {
    id: 'p3',
    category: 'Audio',
    name: 'Echo Buds Pro',
    price: '₹10,700',
    numericPrice: 10700,
    oldPrice: '₹12,400',
    discount: '-15%',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAScxOOjiC8nM_fPEjFJzWNvHiBd2nUavymswu7S0J0fdFklVFT4eWM2lmsB2_WZ_brThFJCiqben5NSN6KIVKVwshnQRr6xdla2dnSrKsUIzTBbMoB3_gaDPFJqLsQwSPBN2GnBq2JJniogz_fodJH7gQZuDtbKQo-4IrXxqSS-6kwWB6aJcPTgxSq5ZCfShkFjEDRIDKWIijucENWxdtJdX_oxxAS0e09Fd9GoCQ18ZzgcfL36nGbmA',
    alt: 'Echo Buds Pro',
  },
  {
    id: 'p4',
    category: 'Computing',
    name: 'Slate Pad Air',
    price: '₹41,400',
    numericPrice: 41400,
    oldPrice: null,
    discount: null,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfsw4flS_ovpgcK6zpaX66vBDhwda-KYvQke-zXn4VPpfZ88itnVYIwRixw7Dendr5di9jVjT-E4sgqayR3MBLP3XG42T_96UhTNCBDaSh-z7UYpMQGl9OCUXmMWYzgAegFRPmavFSxNo_QStVQYfyRXTPVouRSm2_F7uAJwQlxTxY0BFTnKciSoOEEo8NmtfozgDVOhfKSEA6TaUxpNcOVSZzPmq872H0IbZckt8EeOBlw38jBDKhiA',
    alt: 'Slate Pad Air',
  },
  {
    id: 'p5',
    category: 'Audio',
    name: 'Sonic Pro ANC Headphones',
    price: '₹24,800',
    numericPrice: 24800,
    oldPrice: '₹28,000',
    discount: '-11%',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL74KcEYJvR7zXPcL0fwcacTkqsIxozB26gEvyD_u0PZEB3aQgiXVnoiKYq6v3qgSUrXvpeX4aLwG2sopSQclwzUC3uU2euSUY9SKBpVa5kytURM69OJcJAb__SiC3JbKHZilpw-CQxRiUvZ80fQjtRIdjoCl2fga8kMvUgN5zPGHJZiuDJR7ogbjoVuX03f8GbOJbVlNfCjyxhGSGnYAkbfI8UsfZ7Uhtng_1YywR2LdLHM1wXOWdiQ',
    alt: 'Sonic Pro ANC Headphones',
  },
  {
    id: 'p6',
    category: 'Peripherals',
    name: 'Typist Mech 2 Wireless Keyboard',
    price: '₹12,000',
    numericPrice: 12000,
    oldPrice: null,
    discount: null,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt-ueqrFcgVKnkcbTH9CtWLr-rTrF4Nnj2BiOkx0CNrqW7KhxTEtKC5Rcgj5uGP2rVsN7YC2KFLT03JT8fSj3FUQufnIwYwpZu_0UJz_upC7wlGAB3C0V31K7MPGVCICdplUT1Ebbfp6aPyT1G1xx6f8dOBRuTax9cjOhViLhh3SfaH2PQR6jgredsUPfnwrfi6ECE-YfkxrDbRMv-y1J2s3oOu4GClU3Wp2pDyqXDPD68I3iLSh_joQ',
    alt: 'Typist Mech 2',
  },
];

const CATEGORIES = ['All', 'Audio', 'Peripherals', 'Computing', 'Power'];

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    estimatedTax,
    estimatedShipping,
    total,
    storeGroups,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleQuickAdd = (product: (typeof TRENDING_RECOMMENDATIONS)[0]) => {
    addItem({
      productId: product.id,
      title: product.name,
      price: product.numericPrice,
      imageUrl: product.src,
      storeName: 'FlexHub Verified Seller',
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const filteredProducts = TRENDING_RECOMMENDATIONS.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-12">
        {/* Empty Cart Banner */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto">
          <div className="h-20 w-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-5 text-[#64748B]">
            <ShoppingBag className="h-10 w-10 text-[#0058be]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191b23] mb-2 tracking-tight">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mb-6 max-w-md leading-relaxed">
            You haven&apos;t added any items to your cart yet. Browse our curated selection below or explore the full multi-vendor marketplace!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0058be] hover:bg-[#004395] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explore All Products</span>
            </Link>
          </div>
        </div>

        {/* ── Integrated Browse Products Section for Empty Cart ───────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0058be] uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Add to Cart</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#191b23] tracking-tight">
                Browse Trending Products
              </h2>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#0058be] text-white shadow-xs'
                      : 'bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#0058be] hover:text-[#0058be]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {filteredProducts.map((product) => {
              const isAdded = !!addedIds[product.id];
              return (
                <div
                  key={product.id}
                  className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#0058be] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="relative aspect-square bg-[#F8FAFC] p-3 flex items-center justify-center overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.src}
                      alt={product.alt}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#d8e2ff] border border-[#adc6ff] text-[#0058be] text-[10px] font-bold rounded-full">
                        {product.discount}
                      </span>
                    )}
                  </Link>

                  <div className="p-3 flex flex-col flex-grow justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#0058be] uppercase tracking-wider block mb-0.5">
                        {product.category}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-xs font-bold text-[#191b23] line-clamp-1 group-hover:text-[#0058be] transition-colors"
                      >
                        {product.name}
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#191b23]">
                          {product.price}
                        </span>
                        {product.oldPrice && (
                          <span className="font-mono text-[10px] text-[#94A3B8] line-through">
                            {product.oldPrice}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className={`inline-flex items-center justify-center h-7 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0058be] hover:bg-[#004395] text-white shadow-2xs active:scale-95'
                        }`}
                        title="Add to cart"
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0058be] hover:underline"
            >
              <span>View all marketplace products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#191b23] sm:text-3xl">Shopping Cart</h1>
            <span className="rounded-full bg-[#d8e2ff] border border-[#adc6ff] px-3 py-0.5 text-xs font-semibold text-[#0058be]">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#64748B]">
            Items from {storeGroups.length} store{storeGroups.length !== 1 ? 's' : ''} (will be processed as split sub-orders)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-600 px-3.5 py-2 text-xs font-medium text-[#64748B] transition-colors shadow-2xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Cart</span>
          </button>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs text-[#0058be] hover:text-[#004395] font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Grid: Store items on left, Summary on right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left items column */}
        <div className="lg:col-span-8 space-y-6">
          {storeGroups.map((group: StoreCartGroup) => (
            <div
              key={group.storeId}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4"
            >
              {/* Store title badge */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#d8e2ff] border border-[#adc6ff] flex items-center justify-center text-[#0058be]">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Store: <span className="text-[#191b23] font-bold">{group.storeName}</span>
                  </span>
                </div>
                <span className="text-xs font-medium text-[#64748B]">
                  Subtotal: <span className="text-[#191b23] font-semibold">₹{group.subtotal.toLocaleString()}</span>
                </span>
              </div>

              {/* Items for this store */}
              <div className="space-y-3">
                {group.items.map((item: ValidatedCartItem) => (
                  <CartItemRow
                    key={`${item.productId}-${item.variantId ?? 'base'}`}
                    item={{
                      productId: item.productId,
                      variantId: item.variantId,
                      quantity: item.quantity,
                      title: item.title,
                      price: item.unitPrice,
                      imageUrl: item.imageUrl,
                      storeId: item.storeId,
                      storeName: item.storeName,
                      variantTitle: item.variantTitle,
                      slug: item.slug,
                    }}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right summary column */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <CartSummary
              subtotal={subtotal}
              estimatedTax={estimatedTax}
              estimatedShipping={estimatedShipping}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
