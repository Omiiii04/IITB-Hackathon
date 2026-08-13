import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Tag,
  Upload,
  Zap,
  ArrowLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/seller/coupons', label: 'Coupons', icon: Tag },
  { href: '/seller/inventory/bulk-upload', label: 'Bulk Upload', icon: Upload },
  { href: '/seller/settings', label: 'Settings', icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-sm sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">MarketHub</span>
            <span className="block text-xs text-slate-400 leading-none">Seller Portal</span>
          </div>
        </div>

        {/* Back to storefront */}
        <div className="px-3 pt-3">
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Storefront
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-2 pb-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group"
            >
              <Icon className="h-4 w-4 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 overflow-x-auto">
        <Link href="/" className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white">
          <Zap className="h-3.5 w-3.5" />
        </Link>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 lg:pl-0 pt-0 lg:pt-0">
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
}