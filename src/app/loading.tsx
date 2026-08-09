export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <div className="h-6 w-6 rounded-full bg-blue-500/30 animate-pulse" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-slate-300">Loading MarketHub</p>
        <p className="text-xs text-slate-500">Preparing marketplace interface...</p>
      </div>
    </div>
  );
}
