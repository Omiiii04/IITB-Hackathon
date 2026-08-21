import React from 'react';
import { Layers } from 'lucide-react';

export default async function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Category Taxonomy & GST Mapping</h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure marketplace categories, HSN classification, and commission rates.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.05)] text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mx-auto mb-4 border border-blue-100">
          <Layers className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Taxonomy Management Ready</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Marketplace root and nested category hierarchies are active. Configure dynamic sub-categories and commission overrides.
        </p>
      </div>
    </div>
  );
}
