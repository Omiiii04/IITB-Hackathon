'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Store,
  Users,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/stores', label: 'Stores', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-[#F8FAFC] sticky top-0 h-screen select-none">
        {/* Logo & Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 bg-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block">FlexHub</span>
            <span className="block text-[11px] font-medium text-blue-600 uppercase tracking-wider">Admin Control</span>
          </div>
        </div>

        {/* Back to storefront link */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Back to Storefront
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-blue-600" />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                  strokeWidth={1.5}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 text-xs text-slate-400 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span>Governance v2.0</span>
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center gap-2 overflow-x-auto shadow-xs">
        <Link href="/" className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white mr-1">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
        </Link>
        {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
