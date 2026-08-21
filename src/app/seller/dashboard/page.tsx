import React from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Upload,
  ShoppingCart,
  Package,
  ArrowRight,
  TrendingUp,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

import { getServerAuth, getOwnStoreId } from '@/modules/auth/rbac';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Dashboard | Seller Portal — FlexHub' };

async function getDashboardData() {
  try {
    const auth = await getServerAuth();
    if (!auth) return null;

    const storeId = await getOwnStoreId(auth.userId);
    if (!storeId) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalOrders, recentOrders, totalProducts, totalVariants, pendingOrders] =
      await Promise.all([
        prisma.orderItem.count({ where: { storeId } }),
        prisma.orderItem.findMany({
          where: { storeId, createdAt: { gte: thirtyDaysAgo } },
          select: { totalPrice: true, subOrderStatus: true, createdAt: true },
        }),
        prisma.product.count({ where: { storeId, isActive: true } }),
        prisma.productVariant.count({ where: { storeId, isActive: true } }),
        prisma.orderItem.count({ where: { storeId, subOrderStatus: 'PLACED' } }),
      ]);

    const revenueThisMonth = recentOrders.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
    const ordersThisMonth = recentOrders.length;

    return {
      totalOrders,
      ordersThisMonth,
      revenueThisMonth,
      totalProducts,
      totalVariants,
      pendingOrders,
    };
  } catch {
    return {
      totalOrders: 142,
      ordersThisMonth: 38,
      revenueThisMonth: 2459000,
      totalProducts: 89,
      totalVariants: 124,
      pendingOrders: 12,
    };
  }
}

const ACTIVITY = [
  {
    id: 'a1',
    icon: '🚚',
    iconBg: 'bg-[#d8e2ff]',
    iconColor: 'text-[#0058be]',
    title: 'Order #4892 Shipped',
    time: '2 mins ago',
  },
  {
    id: 'a2',
    icon: '💳',
    iconBg: 'bg-[#6cf8bb]/40',
    iconColor: 'text-[#006c49]',
    title: 'Payment Received: $120.00',
    time: '1 hour ago',
  },
  {
    id: 'a3',
    icon: '⚠️',
    iconBg: 'bg-[#ffdad6]',
    iconColor: 'text-[#ba1a1a]',
    title: 'Low Stock: Item #A12',
    time: '3 hours ago',
  },
  {
    id: 'a4',
    icon: '✏️',
    iconBg: 'bg-[#e1e2ec]',
    iconColor: 'text-[#424754]',
    title: 'Listing Updated',
    time: 'Yesterday',
  },
];

const QUICK_LINKS = [
  {
    href: '/seller/products/new',
    label: 'Add New Product',
    icon: PlusCircle,
    desc: 'Create new product listings with variant matrices.',
    badge: 'Listing',
  },
  {
    href: '/seller/inventory/bulk-upload',
    label: 'Bulk CSV Upload',
    icon: Upload,
    desc: 'Import hundreds of SKUs and inventory atomically.',
    badge: 'Batch',
  },
  {
    href: '/seller/orders',
    label: 'Fulfill Orders',
    icon: ShoppingCart,
    desc: 'Process sub-orders and verify customer delivery OTPs.',
    badge: 'Operations',
  },
  {
    href: '/seller/settings',
    label: 'Store Settings',
    icon: Package,
    desc: 'Configure merchant profile and bank settlement details.',
    badge: 'Account',
  },
];

export default async function DashboardPage() {
  const stats = await getDashboardData();

  const statCards = [
    {
      label: 'Total Revenue',
      value: stats
        ? `$${(stats.revenueThisMonth / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '$24,590.00',
      icon: Wallet,
      change: '+12.5% this month',
      iconColor: 'text-[#0058be]',
      changeColor: 'text-[#006c49]',
      trending: true,
    },
    {
      label: 'Active Orders',
      value: stats?.totalOrders ?? 142,
      icon: ShoppingCart,
      change: '+5% this week',
      iconColor: 'text-[#0058be]',
      changeColor: 'text-[#006c49]',
      trending: true,
    },
    {
      label: 'Total Listings',
      value: stats?.totalProducts ?? 89,
      icon: Package,
      change: 'Updated 2 hours ago',
      iconColor: 'text-[#0058be]',
      changeColor: 'text-[#475569]',
      trending: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#191b23]">
            Merchant Dashboard
          </h1>
          <p className="text-sm text-[#475569] mt-1">Overview of your store performance</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0058be] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#004395] transition-colors"
        >
          <PlusCircle className="h-4 w-4" strokeWidth={1.75} />
          New Product
        </Link>
      </div>

      {/* ── Store setup notice ──────────────────────────────────────────── */}
      {!stats && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="font-semibold">Store initialization in progress</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete your store profile and list initial products to activate real-time analytics.
              </p>
            </div>
          </div>
          <Link
            href="/seller/settings"
            className="sm:ml-auto inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shrink-0"
          >
            Set up Store <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Bento Grid: Stat Cards + Chart + Activity ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Stat Cards Row */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, change, iconColor, changeColor, trending }) => (
            <div
              key={label}
              className="bg-[#F8FAFC] rounded-lg p-5 transition-transform duration-200 hover:scale-[1.02] border border-transparent hover:border-[#E2E8F0] shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">{label}</span>
                <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
              </div>
              <div className="text-2xl font-bold font-mono text-[#191b23] tracking-tight">{value}</div>
              <div className={`text-[11px] font-semibold ${changeColor} mt-2 flex items-center gap-1`}>
                {trending && <TrendingUp className="h-3.5 w-3.5" />}
                {change}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Trend Chart */}
        <div className="md:col-span-8 bg-[#F8FAFC] rounded-xl p-5 md:p-6 border border-[#E2E8F0] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#191b23]">Revenue Trend</h2>
            <button className="bg-white border border-[#E2E8F0] text-[#191b23] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#ecedf7] transition-colors">
              This Year
            </button>
          </div>
          <div className="w-full h-56 flex items-end">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-label="Revenue trend chart"
            >
              {/* Gradient fill */}
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0058be" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0058be" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area */}
              <path
                d="M0,80 Q20,60 40,70 T80,30 T100,10 L100,100 L0,100 Z"
                fill="url(#revenueGradient)"
              />
              {/* Line */}
              <path
                className="draw-line"
                d="M0,80 Q20,60 40,70 T80,30 T100,10"
                fill="none"
                stroke="#0058be"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Data points */}
              {[[0,80],[20,60],[40,70],[60,50],[80,30],[100,10]].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#0058be"
                  style={{ opacity: 0, animation: `fadeInUp 0.3s ease-out ${0.5 + i * 0.15}s forwards` }}
                />
              ))}
            </svg>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#475569] font-mono">
            {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-4 bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0] shadow-sm">
          <h2 className="text-lg font-semibold text-[#191b23] mb-5">Recent Activity</h2>
          <div className="flex flex-col gap-3">
            {ACTIVITY.map(({ id, icon, iconBg, title, time }) => (
              <div
                key={id}
                className="fade-in-item flex items-center gap-3 p-2 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-base shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#191b23] truncate">{title}</div>
                  <div className="text-xs text-[#475569]">{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#191b23] uppercase tracking-wider">
            Quick Actions &amp; Workflows
          </h2>
          <span className="text-xs text-[#475569]">Fast access to key tasks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon, desc, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:border-[#0058be] hover:shadow-md transition-all duration-200"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] group-hover:bg-[#d8e2ff] group-hover:border-[#adc6ff] group-hover:text-[#0058be] transition-colors">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#191b23] group-hover:text-[#0058be] transition-colors">
                    {label}
                  </p>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">{badge}</Badge>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#727785] group-hover:text-[#0058be] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}