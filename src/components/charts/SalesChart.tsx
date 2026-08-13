'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesPoint {
  date: string;
  revenue: number;
}

export interface SalesChartProps {
  data: SalesPoint[];
  className?: string;
}

export function SalesChart({ data, className }: SalesChartProps) {
  if (data.length === 0) {
    return <p className={`text-sm text-slate-400 ${className ?? ''}`}>No sales data yet.</p>;
  }

  return (
    <div className={className} style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;