'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  ChevronDown,
  Store,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function StorefrontUserNav() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setDropdownOpen(false);
      router.push('/');
    } catch {
      // Swallowed
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Skeleton during initial session verification
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 rounded-xl bg-slate-100 animate-pulse hidden sm:block" />
        <div className="h-9 w-24 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  // If user is authenticated (Customer or Seller)
  if (user) {
    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
    const displayName = user.email.split('@')[0];
    const isSeller = user.role === 'SELLER';

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white p-1.5 pr-3 hover:bg-[#F8FAFC] transition-all shadow-2xs group"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          {/* Avatar / Initial */}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0058be] to-blue-500 text-xs font-bold text-white shadow-2xs">
            {userInitial}
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#191b23] max-w-[110px] truncate leading-tight">
              {displayName}
            </span>
            <span className="text-[10px] text-[#64748B] capitalize leading-none">
              {user.role.toLowerCase()}
            </span>
          </div>

          <ChevronDown
            className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-[#0058be]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
            {/* Header info */}
            <div className="px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]/50 rounded-t-2xl">
              <p className="text-xs font-semibold text-[#191b23] truncate">{displayName}</p>
              <p className="text-[11px] text-[#64748B] truncate mt-0.5">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#d8e2ff] px-2 py-0.5 text-[10px] font-bold text-[#0058be]">
                <ShieldCheck className="h-3 w-3" />
                <span>{user.role} Verified</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="p-1.5 space-y-0.5">
              <Link
                href="/account/orders"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0058be] transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-[#64748B]" />
                <span>My Orders</span>
              </Link>

              <Link
                href="/account/addresses"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0058be] transition-colors"
              >
                <MapPin className="h-4 w-4 text-[#64748B]" />
                <span>Saved Addresses</span>
              </Link>

              {isSeller ? (
                <Link
                  href="/seller/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#006c49] hover:bg-emerald-50 transition-colors"
                >
                  <Store className="h-4 w-4 text-[#006c49]" />
                  <span className="font-semibold">Seller Hub</span>
                </Link>
              ) : (
                <Link
                  href="/seller-register"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#4f46e5] hover:bg-indigo-50 transition-colors"
                >
                  <Store className="h-4 w-4 text-[#4f46e5]" />
                  <span>Become a Seller</span>
                </Link>
              )}
            </div>

            {/* Sign out */}
            <div className="p-1.5 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If user is unauthenticated
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      {/* Quick Google OAuth Button */}
      <a
        href="/api/auth/oauth/google?redirect=/products"
        title="Sign in with Google"
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#1E293B] transition-all shadow-2xs hover:shadow-xs"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="hidden sm:inline">Google</span>
      </a>

      {/* Sign In Link */}
      <Link
        href="/login?redirect=/products"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-[#191b23] hover:bg-[#F1F5F9] transition-colors"
      >
        <User className="h-3.5 w-3.5" />
        <span>Sign In</span>
      </Link>

      {/* Get Started / Register Button */}
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0058be] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#004395] transition-all hover:scale-[1.02]"
      >
        <Sparkles className="h-3 w-3" />
        <span>Register</span>
      </Link>
    </div>
  );
}

export default StorefrontUserNav;
