'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, ShoppingBag, User, ShieldCheck } from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    name: 'Saved Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    name: 'Order History',
    href: '/account/orders',
    icon: ShoppingBag,
  },
];

export default function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">My Account</h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your saved addresses, track recent orders, and update preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar navigation */}
        <aside className="lg:col-span-3">
          <nav className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm space-y-1">
            <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-800/80 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">Customer Account</p>
                <p className="text-[11px] text-slate-400 truncate">Manage Account & Orders</p>
              </div>
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                  ].join(' ')}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800/80 px-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Encrypted Account Portal</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main account content */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}

