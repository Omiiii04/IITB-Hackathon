'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  subCategories?: CategoryNode[];
}

export function CategoryTreeManager() {
  const { fetchWithAuth } = useAuth();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/admin/categories?withChildren=true&activeOnly=false');
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to load categories');
        return;
      }
      setCategories(json.data);
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), parentCategoryId: newParentId || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to create category');
        return;
      }
      setNewName('');
      setNewParentId('');
      loadCategories();
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivate = async (categoryId: string) => {
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/admin/categories/${categoryId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to deactivate category');
        return;
      }
      loadCategories();
    } catch {
      setError('Network error — please try again');
    }
  };

  const renderNode = (node: CategoryNode, depth = 0) => (
    <div key={node.id}>
      <div
        className="flex items-center justify-between border-t border-slate-800 px-4 py-2"
        style={{ paddingLeft: 16 + depth * 20 }}
      >
        <span className="text-sm text-white">{node.name}</span>
        <button
          onClick={() => handleDeactivate(node.id)}
          className="rounded bg-danger-500 px-3 py-1 text-xs font-medium text-white"
        >
          Deactivate
        </button>
      </div>
      {node.subCategories?.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading categories…</p>;
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white"
        />
        <select
          value={newParentId}
          onChange={(e) => setNewParentId(e.target.value)}
          className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-white"
        >
          <option value="">No parent (root category)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          disabled={isCreating || !newName.trim()}
          className="rounded bg-primary-500 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {error && <p className="mb-2 text-sm text-danger-500">{error}</p>}

      {categories.length === 0 ? (
        <p className="text-sm text-slate-400">No categories yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-800">
          {categories.map((c) => renderNode(c))}
        </div>
      )}
    </div>
  );
}

export default CategoryTreeManager;