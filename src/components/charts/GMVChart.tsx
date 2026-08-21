'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StoreGmv {
  storeName: string;
  gmv: number;
}

export interface GMVChartProps {
  data: StoreGmv[];
  className?: string;
}

export function GMVChart({ data, className }: GMVChartProps) {
  if (data.length === 0) {
    return <p className={`text-sm text-slate-400 ${className ?? ''}`}>No GMV data yet.</p>;
  }

  return (
    <div className={className} style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="storeName" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'GMV']}
          />
          <Bar dataKey="gmv" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GMVChart;