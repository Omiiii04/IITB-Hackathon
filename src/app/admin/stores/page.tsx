import { StoreApprovalTable } from '@/components/admin/StoreApprovalTable';

export default async function StoresPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white mb-2">Store Approvals</h1>
        <p className="text-sm text-slate-400 mb-6">
          Review and approve seller-submitted stores before they can go live.
        </p>
        <StoreApprovalTable />
      </div>
    </div>
  );
}