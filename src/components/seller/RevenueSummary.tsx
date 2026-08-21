import React from 'react';

interface SellerStats {
  totalOrders: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  totalProducts: number;
  totalVariants: number;
  pendingOrders: number;
}

export interface RevenueSummaryProps {
  stats: SellerStats;
  className?: string;
}

export function RevenueSummary({ stats, className }: RevenueSummaryProps) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-6 ${className ?? ''}`}>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Revenue Summary
      </h2>
      <div className="text-3xl font-bold text-white">
        ₹{stats.revenueThisMonth.toLocaleString('en-IN')}
      </div>
      <p className="text-xs text-slate-400 mt-1">
        from {stats.ordersThisMonth} order{stats.ordersThisMonth !== 1 ? 's' : ''} in the last 30 days
      </p>
    </div>
  );
}

export default RevenueSummary;