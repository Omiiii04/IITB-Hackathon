import React from 'react';

interface PlatformMetrics {
  totalStores: number;
  pendingStores: number;
  totalOrders: number;
  gmvThisMonth: number;
  totalUsers: number;
}

export interface PlatformMetricsCardProps {
  metrics: PlatformMetrics;
  className?: string;
}

export function PlatformMetricsCard({ metrics, className }: PlatformMetricsCardProps) {
  const cards = [
    { label: 'Approved Stores', value: metrics.totalStores },
    { label: 'Pending Approvals', value: metrics.pendingStores },
    { label: 'Total Orders', value: metrics.totalOrders },
    { label: 'GMV (30 days)', value: `₹${metrics.gmvThisMonth.toLocaleString('en-IN')}` },
    { label: 'Total Users', value: metrics.totalUsers },
  ];

  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-5 ${className ?? ''}`}>
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-2xl font-bold text-white">{c.value}</div>
          <div className="text-xs text-slate-400 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

export default PlatformMetricsCard;