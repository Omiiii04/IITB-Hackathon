'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TopProduct {
  productTitle: string;
  quantity: number;
  revenue: number;
}

export interface TopProductsChartProps {
  data: TopProduct[];
  className?: string;
}

export function TopProductsChart({ data, className }: TopProductsChartProps) {
  if (data.length === 0) {
    return <p className={`text-sm text-slate-400 ${className ?? ''}`}>No sales yet.</p>;
  }

  return (
    <div className={className} style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" stroke="#64748b" fontSize={12} />
          <YAxis dataKey="productTitle" type="category" stroke="#64748b" fontSize={12} width={140} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopProductsChart;