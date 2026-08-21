import React, { Suspense } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { StorefrontNav } from '@/components/storefront/StorefrontNav';
import { CartNavButton } from '@/components/cart/CartNavButton';
import { SearchBar } from '@/components/storefront/SearchBar';
import { StorefrontUserNav } from '@/components/storefront/StorefrontUserNav';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#191b23] flex flex-col selection:bg-[#d8e2ff] selection:text-[#001a42]">
      {/* Storefront Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0058be] to-blue-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#191b23] group-hover:text-[#0058be] transition-colors hidden sm:block">
              Flex<span className="text-[#0058be]">Hub</span>
            </span>
          </Link>

          {/* Search bar — client component that syncs with URL params */}
          <Suspense fallback={
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <div className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] h-9 animate-pulse" />
              </div>
            </div>
          }>
            <SearchBar />
          </Suspense>

          {/* Right nav with live Customer Auth & Cart */}
          <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <CartNavButton />
            <StorefrontUserNav />
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
      <footer className="border-t border-[#E2E8F0] bg-white mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0058be] to-blue-500 text-white">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="font-bold text-[#191b23] text-base">Flex<span className="text-[#0058be]">Hub</span></span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-[200px]">
                Your one-stop marketplace for quality products and trusted sellers.
              </p>
            </div>

            {/* Shop */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#191b23]">Shop</h4>
              <nav className="flex flex-col gap-2 text-xs text-[#64748B]">
                <Link href="/products" className="hover:text-[#0058be] transition-colors">All Products</Link>
                <Link href="/cart" className="hover:text-[#0058be] transition-colors">My Cart</Link>
                <Link href="/checkout" className="hover:text-[#0058be] transition-colors">Checkout</Link>
              </nav>
            </div>

            {/* Account */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#191b23]">Account</h4>
              <nav className="flex flex-col gap-2 text-xs text-[#64748B]">
                <Link href="/login" className="hover:text-[#0058be] transition-colors">Sign In</Link>
                <Link href="/register" className="hover:text-[#0058be] transition-colors">Create Account</Link>
                <Link href="/account/orders" className="hover:text-[#0058be] transition-colors">My Orders</Link>
                <Link href="/account/addresses" className="hover:text-[#0058be] transition-colors">My Addresses</Link>
              </nav>
            </div>

            {/* Sellers */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[#191b23]">Sellers</h4>
              <nav className="flex flex-col gap-2 text-xs text-[#64748B]">
                <Link href="/seller-register" className="hover:text-[#0058be] transition-colors">Become a Seller</Link>
                <Link href="/seller/dashboard" className="hover:text-[#0058be] transition-colors">Seller Dashboard</Link>
                <Link href="/seller/products" className="hover:text-[#0058be] transition-colors">Manage Products</Link>
                <Link href="/seller/orders" className="hover:text-[#0058be] transition-colors">Manage Orders</Link>
              </nav>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-10 border-t border-[#E2E8F0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <span>© {new Date().getFullYear()} FlexHub. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-[#0058be] transition-colors">Privacy Policy</Link>
              <Link href="/login" className="hover:text-[#0058be] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

