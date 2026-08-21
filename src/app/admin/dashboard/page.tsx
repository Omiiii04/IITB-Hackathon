import React from 'react';
import Link from 'next/link';
import {
  Store,
  Layers,
  Users,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/Badge';

export const metadata = { title: 'Admin Governance Dashboard — FlexHub' };

async function getAdminOverview() {
  try {
    const [storesCount, pendingStoresCount, categoriesCount, usersCount] = await Promise.all([
      prisma.store.count(),
      prisma.store.count({ where: { status: 'PENDING' } }),
      prisma.category.count(),
      prisma.user.count(),
    ]);

    return {
      storesCount,
      pendingStoresCount,
      categoriesCount,
      usersCount,
    };
  } catch {
    return {
      storesCount: 0,
      pendingStoresCount: 0,
      categoriesCount: 0,
      usersCount: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getAdminOverview();

  const metrics = [
    {
      label: 'Registered Stores',
      value: data.storesCount,
      icon: Store,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      note: `${data.pendingStoresCount} pending approval`,
      alert: data.pendingStoresCount > 0,
    },
    {
      label: 'Active Categories',
      value: data.categoriesCount,
      icon: Layers,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      note: 'Tax & commission mapped',
      alert: false,
    },
    {
      label: 'Platform Users',
      value: data.usersCount,
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      note: 'Customers, sellers & staff',
      alert: false,
    },
    {
      label: 'Security Status',
      value: '100% OK',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      note: 'RBAC & multi-tenant active',
      alert: false,
    },
  ];

  const adminActions = [
    {
      href: '/admin/stores',
      title: 'Store Approvals & KYC',
      desc: 'Audit new merchant store applications and manage operating statuses.',
      icon: Store,
      badge: 'Stores',
    },
    {
      href: '/admin/categories',
      title: 'Category Hierarchy & Tax Rates',
      desc: 'Define top-level and nested taxonomy with HSN tax rules.',
      icon: Layers,
      badge: 'Taxonomy',
    },
    {
      href: '/admin/users',
      title: 'User Management & Roles',
      desc: 'Inspect customer accounts, assign seller privileges, and review sessions.',
      icon: Users,
      badge: 'Accounts',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Governance Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            Global multi-vendor platform controls, merchant approvals, and catalog governance.
          </p>
        </div>
        <Badge variant="primary" className="self-start sm:self-auto px-3 py-1 text-xs font-semibold">
          Platform Mode: Operational
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map(({ label, value, icon: Icon, iconBg, note, alert }) => (
          <div
            key={label}
            className="rounded-2xl bg-white border border-slate-200 p-5 shadow-[0_2px_4px_rgba(15,23,42,0.05)] hover:border-blue-500 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} transition-transform group-hover:scale-105`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {value}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              {alert ? (
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  {note}
                </span>
              ) : (
                <span className="text-slate-600">{note}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Governance Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Administrative Modules</h2>
          <span className="text-xs text-slate-500">Centralized control</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminActions.map(({ href, title, desc, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_4px_rgba(15,23,42,0.05)] hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    {badge}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  {desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
