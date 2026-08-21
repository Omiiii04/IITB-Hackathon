import React from 'react';
import { Users } from 'lucide-react';

export default async function UsersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Roles & Access Control</h1>
        <p className="text-sm text-slate-600 mt-1">
          Inspect platform users, audit active refresh sessions, and configure role privileges.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_2px_4px_rgba(15,23,42,0.05)] text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mx-auto mb-4 border border-indigo-100">
          <Users className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-slate-900">User Governance Active</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Platform-wide RBAC authentication and role management directory initialized.
        </p>
      </div>
    </div>
  );
}
