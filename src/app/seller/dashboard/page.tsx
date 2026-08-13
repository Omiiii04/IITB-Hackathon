import React from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Upload,
} from 'lucide-react';

export const metadata = { title: 'Dashboard | Seller Portal — MarketHub' };

async function getDashboardData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/seller/analytics`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardData();

  const statCards = [
    {
      label: 'Products Listed',
      value: stats?.totalProducts ?? '—',
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Orders (Total)',
      value: stats?.totalOrders ?? '—',
      icon: ShoppingCart,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Revenue (30 days)',
      value: stats ? `₹${(stats.revenueThisMonth / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—',
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? '—',
      icon: AlertCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  const quickLinks = [
    { href: '/seller/products/new', label: 'Add New Product', icon: PlusCircle, desc: 'List a new product in your store.' },
    { href: '/seller/inventory/bulk-upload', label: 'Bulk Upload', icon: Upload, desc: 'Upload variants via CSV file.' },
    { href: '/seller/orders', label: 'Manage Orders', icon: ShoppingCart, desc: 'Fulfil and track your orders.' },
    { href: '/seller/settings', label: 'Store Settings', icon: Package, desc: 'Update your store profile.' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Your store performance at a glance.</p>
      </div>

      {!stats && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Analytics require an active store and database connection. Create your store first.</span>
          <Link href="/seller/settings" className="ml-auto text-xs font-semibold text-amber-200 hover:text-white flex items-center gap-1 flex-shrink-0">
            Set up store <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border ${bg} p-5`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${bg} mb-3`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 group-hover:border-emerald-500/40 group-hover:text-emerald-400 text-slate-400 transition-all">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 truncate">{desc}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}