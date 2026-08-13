import { PlatformMetricsCard } from '@/components/admin/PlatformMetricsCard';
import { GMVChart } from '@/components/charts/GMVChart';

async function getAdminAnalytics() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/admin/analytics`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getAdminAnalytics();

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Platform Dashboard</h1>
        <p className="text-sm text-slate-400">Marketplace-wide performance at a glance.</p>
      </div>

      {!data && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300">
          Sign in as an admin to view platform analytics.
        </div>
      )}

      {data && (
        <>
          <PlatformMetricsCard metrics={data.platform} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Top Stores by GMV
            </h2>
            <GMVChart data={data.topStores} />
          </div>
        </>
      )}
    </div>
  );
}