import { StoreApprovalTable } from '@/components/admin/StoreApprovalTable';

export default async function StoresPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Approvals & Onboarding</h1>
        <p className="text-sm text-slate-600 mt-1">
          Review and audit seller applications before granting marketplace storefront access.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.05)]">
        <StoreApprovalTable />
      </div>
    </div>
  );
}