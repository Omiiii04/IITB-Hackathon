import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#191b23] flex flex-col justify-between relative overflow-hidden">
      {/* Subtle ambient background accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

      {/* Auth Navbar / Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between z-10 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#191b23] hover:opacity-90 transition-opacity">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0058be] to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span className="text-[#191b23]">Flex<span className="text-[#0058be]">Hub</span></span>
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-[#475569] hover:text-[#0058be] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Store
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-md md:max-w-lg">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#64748B] z-10">
        &copy; {new Date().getFullYear()} FlexHub. All rights reserved.
      </footer>
    </div>
  );
}
