import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Zap } from 'lucide-react';
import { StorefrontNav } from '@/components/storefront/StorefrontNav';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      {/* Storefront Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors hidden sm:block">
              Market<span className="text-blue-400">Hub</span>
            </span>
          </Link>

          {/* Search bar */}
          <form
            action="/products"
            method="GET"
            className="flex-1 max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                name="q"
                placeholder="Search products..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </form>

          {/* Right nav */}
          <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="hidden sm:block rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-md shadow-blue-600/25 hover:bg-blue-500 transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>

        {/* Category nav strip */}
        <StorefrontNav />
      </header>

      {/* Page content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-10 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-white">MarketHub</span>
              <span className="text-xs text-slate-500">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link href="/products" className="hover:text-slate-300 transition-colors">All Products</Link>
              <Link href="/seller-register" className="hover:text-slate-300 transition-colors">Become a Seller</Link>
              <Link href="/api/health" className="hover:text-slate-300 transition-colors">API Health</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
