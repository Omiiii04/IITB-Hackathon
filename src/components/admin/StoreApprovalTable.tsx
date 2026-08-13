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
    return <p className="text-sm text-slate-400">Loading pending stores…</p>;
  }

  if (error) {
    return <p className="text-sm text-danger-500">{error}</p>;
  }

  if (stores.length === 0) {
    return <p className="text-sm text-slate-400">No stores are waiting for approval.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-4 py-2 font-medium text-slate-300">Store</th>
            <th className="px-4 py-2 font-medium text-slate-300">Seller</th>
            <th className="px-4 py-2 font-medium text-slate-300">Applied</th>
            <th className="px-4 py-2 font-medium text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id} className="border-t border-slate-800">
              <td className="px-4 py-2 text-white">{store.storeName}</td>
              <td className="px-4 py-2 text-slate-400">{store.seller.email}</td>
              <td className="px-4 py-2 text-slate-400">
                {new Date(store.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => updateStatus(store.id, 'APPROVED')}
                  disabled={updatingId === store.id}
                  className="mr-2 rounded bg-success-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(store.id, 'SUSPENDED')}
                  disabled={updatingId === store.id}
                  className="rounded bg-danger-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StoreApprovalTable;