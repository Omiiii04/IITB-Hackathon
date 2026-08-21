'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StoreRow {
  id: string;
  storeName: string;
  slug: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  createdAt: string;
  seller: { id: string; name: string | null; email: string };
}

export function StoreApprovalTable() {
  const { fetchWithAuth } = useAuth();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/admin/stores?status=PENDING');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to load stores');
        return;
      }
      setStores(json.data);
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (storeId: string, status: 'APPROVED' | 'SUSPENDED') => {
    setUpdatingId(storeId);
    try {
      const res = await fetchWithAuth(`/api/admin/stores/${storeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to update store');
        return;
      }
      setStores((prev) => prev.filter((s) => s.id !== storeId));
    } catch {
      setError('Network error — please try again');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium text-slate-500">Loading pending merchant stores…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        <p className="text-sm">No stores are currently awaiting approval.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Store Name</th>
            <th className="px-5 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Merchant Email</th>
            <th className="px-5 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Applied Date</th>
            <th className="px-5 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stores.map((store) => (
            <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-5 py-3.5 font-medium text-slate-900">{store.storeName}</td>
              <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{store.seller.email}</td>
              <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                {new Date(store.createdAt).toLocaleDateString()}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(store.id, 'APPROVED')}
                    disabled={updatingId === store.id}
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(store.id, 'SUSPENDED')}
                    disabled={updatingId === store.id}
                    className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default StoreApprovalTable;