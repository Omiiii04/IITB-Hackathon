import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  Zap,
  Activity,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  const techBadges = [
    { name: 'Next.js 15', desc: 'App Router & Turbopack', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
    { name: 'React 19', desc: 'Server & Client Components', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' },
    { name: 'Tailwind CSS v4', desc: '@theme CSS Variables', color: 'border-sky-500/30 bg-sky-500/10 text-sky-400' },
    { name: 'TypeScript Strict', desc: 'Zero Any Policy', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' },
    { name: 'Prisma 6', desc: 'PostgreSQL ORM', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
    { name: 'Dual Payments', desc: 'Razorpay & Stripe Webhooks', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
  ];

  const portals = [
    {
      title: 'Customer Storefront',
      desc: 'Browse multi-vendor catalogs, configure product variants, manage shopping carts, and checkout with atomic reservation locks.',
      href: '/products',
      icon: ShoppingBag,
      tag: 'Storefront',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'hover:border-blue-500/50',
    },
    {
      title: 'Seller Merchant Hub',
      desc: 'Manage variant inventory, execute sub-order fulfillment workflows (accept, pack, ship), verify delivery OTPs, and issue store coupons.',
      href: '/seller/dashboard',
      icon: Store,
      tag: 'Seller Panel',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      gradient: 'from-emerald-600/20 via-teal-600/10 to-transparent',
      borderColor: 'hover:border-emerald-500/50',
    },
    {
      title: 'Admin Governance Console',
      desc: 'Platform-wide oversight: approve new merchant stores, manage category taxonomies, monitor gross merchandise value, and track system audits.',
      href: '/admin/dashboard',
      icon: ShieldCheck,
      tag: 'Admin Console',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gradient: 'from-purple-600/20 via-pink-600/10 to-transparent',
      borderColor: 'hover:border-purple-500/50',
    },
    {
      title: 'API & Diagnostics Center',
      desc: 'Explore REST endpoints, test automated webhook signature verification, inspect health diagnostics, and run database migrations.',
      href: '/api/health',
      icon: Activity,
      tag: 'API Health',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
      borderColor: 'hover:border-amber-500/50',
    },
  ];

  const features = [
    {
      icon: Lock,
      title: 'Atomic Inventory Lock',
      desc: 'Stock is reserved atomically at checkout creation inside a Prisma transaction block with 15-min TTL expiry, eliminating race conditions.',
    },
    {
      icon: Layers,
      title: 'Multi-Tenant Isolation',
      desc: 'Every variant and coupon is indexed with strict store_id tenant scoping, guaranteeing zero cross-store data leakage.',
    },
    {
      icon: Package,
      title: 'Sub-Order & OTP Handshake',
      desc: 'Multi-vendor carts split into isolated vendor sub-orders with 6-digit cryptographic OTP confirmation upon customer handoff.',
    },
    {
      icon: Cpu,
      title: 'Dual-Provider Webhook Engine',
      desc: 'Provider-specific signature verification for Razorpay (HMAC-SHA256 timingSafeEqual) and Stripe (constructEvent) with idempotency keys.',
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                MarketHub
              </span>
              <span className="text-xs text-slate-400 font-mono">Next.js 15 Platform</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/40 transition-all"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm mb-8">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span>Next.js 15 • App Router • TS Strict • Tailwind v4</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Enterprise Multi-Vendor{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            E-Commerce Platform
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
          High-performance distributed marketplace architecture built with atomic inventory reservations, 
          multi-tenant seller fulfillment, dual payment webhooks, and sub-order OTP delivery handoffs.
        </p>

        {/* Tech Stack Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {techBadges.map((badge) => (
            <div
              key={badge.name}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm ${badge.color}`}
            >
              <span className="font-bold">{badge.name}</span>
              <span className="opacity-60">•</span>
              <span className="opacity-80">{badge.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Portals Grid */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Platform Gateway Portals
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Select a role portal to explore interactive workflows and system interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.title}
                href={portal.href}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 ${portal.borderColor}`}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${portal.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 group-hover:scale-110 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${portal.tagColor}`}
                    >
                      {portal.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {portal.desc}
                  </p>
                </div>

                <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Core Architecture Invariants */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 lg:p-12 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                <Server className="h-4 w-4" />
                <span>Architecture & Security Standards</span>
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Built for High Concurrency & Integrity
              </h2>
            </div>
            <Link
              href="/api/health"
              className="inline-flex items-center gap-2 self-start md:self-auto rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>API Health: Online</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-slate-400">MarketHub Platform</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/api/health" className="hover:text-slate-300 transition-colors">
              Health Status
            </Link>
            <Link href="/seller-register" className="hover:text-slate-300 transition-colors">
              Become a Seller
            </Link>
            <Link href="/products" className="hover:text-slate-300 transition-colors">
              Explore Store
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
