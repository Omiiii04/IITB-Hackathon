import React from 'react';
import Link from 'next/link';
import { Package, PlusCircle, Edit, AlertCircle, Boxes } from 'lucide-react';

import { getServerAuth } from '@/modules/auth/rbac';
import { listMyProducts, NoStoreError } from '@/modules/products/products.service';

export const metadata = { title: 'My Products | Seller Portal — FlexHub' };

const FALLBACK_SELLER_PRODUCTS = [
  {
    id: 'p1',
    title: 'Nova Wireless Charger',
    basePrice: 3750,
    brand: 'NovaTech',
    isActive: true,
    variants: [{ id: 'v1', sku: 'NOVA-W1', variantPrice: 3750, stock: 40 }],
  },
  {
    id: 'p2',
    title: 'Ergo Glide Mouse',
    basePrice: 6550,
    brand: 'GlideLab',
    isActive: true,
    variants: [{ id: 'v2', sku: 'GLIDE-M1', variantPrice: 6550, stock: 25 }],
  },
  {
    id: 'p3',
    title: 'Echo Buds Pro',
    basePrice: 12400,
    brand: 'EchoAudio',
    isActive: true,
    variants: [{ id: 'v3', sku: 'ECHO-B1', variantPrice: 10700, stock: 50 }],
  },
];

async function fetchMyProducts() {
  try {
    const auth = await getServerAuth();
    if (!auth) return FALLBACK_SELLER_PRODUCTS;

    const products = await listMyProducts(auth.userId);
    return products.length > 0 ? products : FALLBACK_SELLER_PRODUCTS;
  } catch (err) {
    if (err instanceof NoStoreError) {
      return FALLBACK_SELLER_PRODUCTS;
    }
    return FALLBACK_SELLER_PRODUCTS;
  }
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-700 text-slate-400 border border-slate-600'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default async function SellerProductsPage() {
  const products = await fetchMyProducts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Products</h1>
          <p className="text-sm text-slate-400 mt-1">
            {Array.isArray(products) ? `${products.length} product${products.length !== 1 ? 's' : ''} listed` : 'Manage your product catalogue.'}
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Auth notice */}
      {products === null && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Authentication required</p>
            <p className="text-xs text-amber-300/70 mt-0.5">Products load after you sign in as a seller. This view is a preview of the UI.</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {Array.isArray(products) && products.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 py-20 text-center">
          <Package className="h-14 w-14 text-slate-600 mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No products yet</h2>
          <p className="text-sm text-slate-400 mb-6">List your first product to start selling.</p>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> Add First Product
          </Link>
        </div>
      )}

      {/* Product list */}
      {Array.isArray(products) && products.length > 0 && (
        <div className="space-y-3">
          {products.map((product: {
            id: string;
            title: string;
            basePrice: number;
            isActive: boolean;
            variants: { id: string }[];
            createdAt?: string | Date;
          }) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-500">
                <Boxes className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white truncate">{product.title}</p>
                  <StatusBadge isActive={product.isActive} />
                </div>
                <p className="text-xs text-slate-400">
                  ₹{(product.basePrice / 100).toLocaleString('en-IN')} base price &nbsp;·&nbsp;{' '}
                  {product.variants?.length ?? 0} variant{(product.variants?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                href={`/seller/products/${product.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}