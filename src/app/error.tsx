'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Unhandled runtime error in FlexHub:', error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 mb-6 shadow-lg shadow-red-500/10">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Something went wrong!
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        An unexpected error occurred while processing your request. Our telemetry system has logged this incident.
      </p>

      {error.digest && (
        <div className="mt-4 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 font-mono text-xs text-slate-400">
          Incident ID: {error.digest}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
