import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuth } from '@/modules/auth/rbac';
import { SellerNav } from './SellerNav';
import { Badge } from '@/components/ui/Badge';
import { Bell, User } from 'lucide-react';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuth();

  // Server-side role check:
  if (!auth) {
    redirect('/login?redirect=/seller/dashboard');
  }

  // If authenticated as a customer, send to seller registration/store setup
  if (auth.role !== 'SELLER' && auth.role !== 'ADMIN') {
    redirect('/seller-register');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex">
      {/* Sidebar Navigation */}
      <SellerNav />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Sticky Glass Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchant Portal</span>
              <span className="text-slate-300">/</span>
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Store Management</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Badge (Pill) */}
            <Badge variant="success" className="gap-1.5 px-3 py-1 font-medium shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Store Active
            </Badge>

            {/* User / Notification quick controls */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-2 pl-2">
                <div className="h-7 w-7 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                  <User className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium text-slate-700 hidden md:inline-block">
                  Seller Account
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 min-w-0 p-6 lg:p-8">
          <div className="lg:hidden h-10" />
          {children}
        </main>
      </div>
    </div>
  );
}