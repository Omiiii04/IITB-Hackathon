import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-blue-400 mb-6 shadow-xl shadow-blue-500/10">
        <FileQuestion className="h-10 w-10" />
      </div>

      <span className="font-mono text-sm font-bold uppercase tracking-wider text-blue-400">
        404 — Page Not Found
      </span>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Lost in the Marketplace?
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-400 leading-relaxed">
        The page or resource you are looking for does not exist, has been moved, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
        >
          <Home className="h-4 w-4" />
          FlexHub Portal
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Storefront
        </Link>
      </div>
    </div>
  );
}
