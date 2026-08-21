'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Store,
  Zap,
  Sparkles,
  Layers,
  Lock,
  Boxes,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Linkedin,
  Github,
  ArrowRight,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { CartNavButton } from '@/components/cart/CartNavButton';
import { StorefrontUserNav } from '@/components/storefront/StorefrontUserNav';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';



  const platformPillars = [
    {
      icon: Lock,
      title: 'Atomic Stock Reservations',
      desc: 'Prevents race conditions & overselling with 15-minute transactional locks during checkout.',
    },
    {
      icon: Boxes,
      title: 'Split Sub-Order Fulfillment',
      desc: 'Multi-store carts automatically bifurcate into isolated sub-orders with independent seller states.',
    },
    {
      icon: CheckCircle2,
      title: 'OTP Delivery Confirmation',
      desc: 'Cryptographically verified delivery handoffs ensure complete order integrity before payout.',
    },
    {
      icon: Layers,
      title: 'Multi-Tenant Isolation',
      desc: 'Strict role-based access control (RBAC) guaranteeing store data boundary enforcement.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f9f9ff] text-[#191b23] selection:bg-[#d8e2ff] selection:text-[#001a42] font-sans pb-24 md:pb-12 flex flex-col">
      {/* ── Top Navigation ──────────────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#E2E8F0] shadow-xs transition-all duration-300">
        <div className="flex justify-between items-center px-4 md:px-8 max-w-[1280px] mx-auto h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0058be] to-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#191b23] group-hover:text-[#0058be] transition-colors">
              Flex<span className="text-[#0058be]">Hub</span>
            </span>
          </Link>

          {/* Functional Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-2 hidden sm:block"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[#64748B] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products across verified sellers..."
                className="w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-10 py-2 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-all shadow-2xs"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1.5 p-1.5 rounded-full bg-[#0058be] hover:bg-[#004395] text-white transition-colors"
              >
                <Search className="h-3 w-3" />
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-[#0058be] font-semibold hover:opacity-80 transition-opacity text-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Storefront
            </Link>
            <Link
              href="/seller/dashboard"
              className="flex items-center gap-1.5 text-[#424754] hover:text-[#0058be] transition-colors text-sm font-medium"
            >
              <Store className="h-4 w-4" />
              Seller Portal
            </Link>
          </nav>

          {/* Action Icons & User Auth */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <CartNavButton />
            <StorefrontUserNav />
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-[#64748B] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-9 py-1.5 text-xs text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 p-1 rounded-full bg-[#0058be] text-white"
            >
              <Search className="h-3 w-3" />
            </button>
          </form>
        </div>
      </header>

      {/* ── Main Portal Hub Content ───────────────────────────────────────── */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 pt-28 md:pt-24 space-y-12">
        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white px-6 sm:px-12 py-12 md:py-16 text-center shadow-xs">
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#adc6ff] bg-[#d8e2ff] px-4 py-1.5 text-xs font-bold text-[#0058be] mb-6 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#0058be]" />
              <span>Multi-Vendor E-Commerce Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#191b23] mb-4">
              Enterprise Marketplace <br />
              <span className="text-[#0058be]">Gateway Portals</span>
            </h1>

            <p className="mx-auto max-w-2xl text-[#475569] text-sm sm:text-base leading-relaxed mb-8">
              Select your portal to access buyer storefronts and multi-vendor catalogs or manage seller inventory and fulfillment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {user ? (
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0058be] hover:bg-[#004395] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Enter Storefront
                </Link>
              ) : (
                <>
                  <a
                    href="/api/auth/oauth/google?redirect=/products"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0058be] hover:bg-[#004395] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#ffffff"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#ffffff"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#ffffff"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#ffffff"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Enter Storefront (OAuth)</span>
                  </a>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] px-5 py-2.5 text-sm font-semibold text-[#191b23] transition-all shadow-2xs"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#0058be]" />
                    Browse as Guest
                  </Link>
                </>
              )}

              {isSeller ? (
                <Link
                  href="/seller/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#006c49] hover:bg-[#005237] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <Store className="h-4 w-4" />
                  Merchant Hub
                </Link>
              ) : (
                <Link
                  href="/seller-register"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] px-5 py-2.5 text-sm font-semibold text-[#191b23] transition-all shadow-2xs"
                >
                  <Store className="h-4 w-4 text-[#006c49]" />
                  Become a Seller
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Platform Portals Grid (Strictly 2 Portals) ───────────────────── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#191b23] tracking-tight">
              FlexHub Role Portals
            </h2>
            <p className="mt-1 text-sm text-[#475569]">
              Direct gateway routing with built-in OAuth for customers and verified merchants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 1. Customer Storefront (Shop Portal) */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#0058be]">
              <div className="absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                    <ShoppingBag className="h-7 w-7 text-[#0058be]" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border text-[#0058be] bg-[#d8e2ff] border-[#adc6ff]">
                    Shop Portal
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#191b23] mb-2.5 group-hover:text-[#0058be] transition-colors">
                  Customer Storefront
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mb-6">
                  Browse multi-vendor catalogs, dynamic full-text search, live inventory reservations, and unified multi-store checkout with Google OAuth authentication.
                </p>

                {!user && (
                  <div className="mb-4">
                    <a
                      href="/api/auth/oauth/google?redirect=/products"
                      id="customer-google-oauth-btn"
                      className="w-full py-2.5 px-4 rounded-xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs hover:shadow-xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google (OAuth 2.0)</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-4 border-t border-[#F1F5F9] space-y-2">
                {user ? (
                  <Link
                    href="/products"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shadow-xs bg-[#0058be] hover:bg-[#004395] text-white"
                  >
                    <span>Enter Storefront</span>
                    <ShoppingBag className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <a
                      href="/api/auth/oauth/google?redirect=/products"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shadow-xs bg-[#0058be] hover:bg-[#004395] text-white"
                    >
                      <span>Enter Storefront</span>
                      <ShoppingBag className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <Link
                      href="/products"
                      className="block text-center text-xs font-semibold text-[#64748B] hover:text-[#0058be] transition-colors py-1"
                    >
                      or Browse as Guest →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 2. Seller Merchant Hub (Merchant Portal) */}
            <div className="group relative flex flex-col justify-between rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-500">
              <div className="absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                    <Store className="h-7 w-7 text-[#006c49]" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border text-[#006c49] bg-[#6cf8bb]/30 border-[#4edea3]">
                    Merchant Portal
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#191b23] mb-2.5 group-hover:text-[#006c49] transition-colors">
                  Seller Merchant Hub
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed mb-6">
                  Real-time multi-tenant stock management, sub-order fulfillment lifecycle, OTP delivery handoffs, and seller analytics dashboard.
                </p>

                {user && (
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Signed in as <strong>{user.email}</strong> ({user.role})</span>
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-4 border-t border-[#F1F5F9] space-y-2">
                {isSeller ? (
                  <Link
                    href="/seller/dashboard"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shadow-xs bg-[#006c49] hover:bg-[#005237] text-white"
                  >
                    <span>Enter Seller Hub</span>
                    <Store className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : user ? (
                  <>
                    <Link
                      href="/seller-register"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shadow-xs bg-[#006c49] hover:bg-[#005237] text-white"
                    >
                      <span>Register Merchant Store</span>
                      <Store className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/seller/dashboard"
                      className="block text-center text-xs font-semibold text-[#64748B] hover:text-[#006c49] transition-colors py-1"
                    >
                      or Access Seller Dashboard →
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login?redirect=/seller/dashboard"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all shadow-xs bg-[#006c49] hover:bg-[#005237] text-white"
                    >
                      <span>Enter Seller Hub</span>
                      <Store className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/seller-register"
                      className="block text-center text-xs font-semibold text-[#64748B] hover:text-[#006c49] transition-colors py-1"
                    >
                      or Register New Seller Account →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Architecture & Security Pillars ─────────────────────────────── */}
        <section className="rounded-3xl border border-[#E2E8F0] bg-white p-8 md:p-10 shadow-xs">
          <div className="mb-8">
            <span className="text-xs font-bold text-[#0058be] uppercase tracking-wider block mb-1">
              Engineered for Scale
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#191b23] tracking-tight">
              Enterprise Multi-Vendor Core Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformPillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex flex-col p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]/80 hover:border-[#adc6ff] transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0058be] mb-3 shadow-2xs">
                    <PillarIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#191b23] mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Homepage Footer ───────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-[#d1d5db] bg-[#1c1c1e] text-white">
        {/* Newsletter Banner */}
        <div className="bg-gradient-to-r from-[#2a2a2e] via-[#323236] to-[#2a2a2e] border-b border-[#3a3a3e] px-6 py-10">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Stay ahead of the market
              </h3>
              <p className="text-[#a1a1aa] text-sm mt-1">
                Get seller tips, platform updates, and exclusive deals straight to your inbox.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center w-full md:w-auto gap-2"
            >
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a] pointer-events-none" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#3a3a3e] border border-[#4a4a4e] text-white placeholder-[#71717a] text-sm focus:outline-none focus:ring-2 focus:ring-[#0058be]/50 focus:border-[#0058be] transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0058be] text-white font-bold text-sm hover:bg-[#004395] transition-colors shadow-sm whitespace-nowrap"
              >
                Subscribe <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 bg-[#1c1c1e]">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0058be] to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                Flex<span className="text-[#adc6ff]">Hub</span>
              </span>
            </Link>
            <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-xs">
              Enterprise-grade multi-vendor marketplace powering buyers, sellers, and admins with
              real-time inventory, OTP delivery verification, and atomic checkout flows.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2e] border border-[#3a3a3e] text-[#a1a1aa] text-xs">
                <Shield className="h-3 w-3 text-[#60a5fa]" /> Secure Checkout
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2e] border border-[#3a3a3e] text-[#a1a1aa] text-xs">
                <HeartHandshake className="h-3 w-3 text-emerald-400" /> Verified Sellers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a2a2e] border border-[#3a3a3e] text-[#a1a1aa] text-xs">
                <CheckCircle2 className="h-3 w-3 text-blue-400" /> OTP Delivery
              </span>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FlexHub on Twitter"
                className="h-9 w-9 rounded-xl bg-[#2a2a2e] border border-[#3a3a3e] flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#0058be] hover:border-[#0058be] transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FlexHub on LinkedIn"
                className="h-9 w-9 rounded-xl bg-[#2a2a2e] border border-[#3a3a3e] flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FlexHub on GitHub"
                className="h-9 w-9 rounded-xl bg-[#2a2a2e] border border-[#3a3a3e] flex items-center justify-center text-[#71717a] hover:text-white hover:bg-[#404040] hover:border-[#555] transition-all"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#71717a]">
              Marketplace
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse All Products', href: '/products' },
                { label: 'New Arrivals', href: '/products?sort=newest' },
                { label: 'Top Deals', href: '/products?sort=price_asc' },
                { label: 'My Cart', href: '/cart' },
                { label: 'My Orders', href: '/account/orders' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#a1a1aa] hover:text-white transition-colors hover:underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#71717a]">
              Sell on FlexHub
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Seller Dashboard', href: '/seller/dashboard' },
                { label: 'Manage Inventory', href: '/seller/products' },
                { label: 'Order Fulfillment', href: '/seller/orders' },
                { label: 'Register as Seller', href: '/seller-register' },
                { label: 'Seller Analytics', href: '/seller/dashboard' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#a1a1aa] hover:text-white transition-colors hover:underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#71717a]">
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About FlexHub', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'Admin Portal', href: '/admin' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#a1a1aa] hover:text-white transition-colors hover:underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-3 space-y-2.5">
              <a
                href="mailto:support@flexhub.io"
                className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-[#0058be] flex-shrink-0" />
                support@flexhub.io
              </a>
              <span className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <MapPin className="h-3.5 w-3.5 text-[#0058be] flex-shrink-0" />
                IIT Bombay, Mumbai, India
              </span>
              <span className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <Phone className="h-3.5 w-3.5 text-[#0058be] flex-shrink-0" />
                +91 98765 43210
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2a2a2e] bg-[#141414] px-6 md:px-8 py-5">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#71717a]">
              © {new Date().getFullYear()} FlexHub. All rights reserved. Built for IITB Hackathon.
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#71717a]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>
              <span className="text-xs text-[#3a3a3e]">|</span>
              <Link href="#" className="text-xs text-[#71717a] hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-xs text-[#71717a] hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-xs text-[#71717a] hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
      <nav className="md:hidden bg-white/95 backdrop-blur-md fixed bottom-0 w-full z-50 border-t border-[#E2E8F0] shadow-[0_-2px_10px_rgba(15,23,42,0.05)]">
        <div className="flex justify-around items-center h-16 px-4 max-w-[1280px] mx-auto">
          <Link
            href="/products"
            className="flex flex-col items-center justify-center text-[#0058be] rounded-xl px-4 py-1 active:scale-95 transition-transform duration-200"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[11px] font-bold mt-0.5">Shop</span>
          </Link>
          <Link
            href="/seller/dashboard"
            className="flex flex-col items-center justify-center text-[#475569] px-4 py-1 hover:bg-[#F8FAFC] rounded-xl transition-colors active:scale-95 duration-200"
          >
            <Store className="h-5 w-5" />
            <span className="text-[11px] font-medium mt-0.5">Sell</span>
          </Link>
          <Link
            href="/account/orders"
            className="flex flex-col items-center justify-center text-[#475569] px-4 py-1 hover:bg-[#F8FAFC] rounded-xl transition-colors active:scale-95 duration-200"
          >
            <Zap className="h-5 w-5" />
            <span className="text-[11px] font-medium mt-0.5">Orders</span>
          </Link>
          <Link
            href="/login"
            className="flex flex-col items-center justify-center text-[#475569] px-4 py-1 hover:bg-[#F8FAFC] rounded-xl transition-colors active:scale-95 duration-200"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[11px] font-medium mt-0.5">Account</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
