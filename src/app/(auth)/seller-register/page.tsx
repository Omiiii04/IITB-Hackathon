
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SellerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password requirements calculation
  const lengthValid = password.length >= 10 && password.length <= 128;
  const lowercaseValid = /[a-z]/.test(password);
  const uppercaseValid = /[A-Z]/.test(password);
  const numberValid = /[0-9]/.test(password);
  const isPasswordValid = lengthValid && lowercaseValid && uppercaseValid && numberValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet all security requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          role: 'SELLER',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Seller registration failed.');
      }

      // Auto-login or redirect to seller portal / homepage
      try {
        await login(email, password);
        router.push('/');
      } catch {
        router.push('/login?registered=true&role=seller');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during seller registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm relative overflow-hidden">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
          Vendor Portal Onboarding
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191b23] tracking-tight">Become a FlexHub Seller</h1>
        <p className="mt-1.5 text-sm text-[#64748B]">Set up your seller account and launch your online store</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600 flex items-center gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="leading-relaxed">
          Seller accounts require email verification prior to store provisioning. Make sure to use a valid business email.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="seller-name">
            Contact / Business Owner Name
          </label>
          <input
            id="seller-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="seller-email">
            Business Email Address
          </label>
          <input
            id="seller-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seller@store.com"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="seller-password">
            Account Password
          </label>
          <input
            id="seller-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 10 chars with A-Z, a-z, 0-9"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-colors"
          />

          {password.length > 0 && (
            <div className="mt-2 text-xs space-y-1 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className={lengthValid ? 'text-emerald-600 font-medium' : 'text-[#94A3B8]'}>
                {lengthValid ? '✓' : '•'} At least 10 characters
              </div>
              <div className={lowercaseValid ? 'text-emerald-600 font-medium' : 'text-[#94A3B8]'}>
                {lowercaseValid ? '✓' : '•'} Lowercase letter (a-z)
              </div>
              <div className={uppercaseValid ? 'text-emerald-600 font-medium' : 'text-[#94A3B8]'}>
                {uppercaseValid ? '✓' : '•'} Uppercase letter (A-Z)
              </div>
              <div className={numberValid ? 'text-emerald-600 font-medium' : 'text-[#94A3B8]'}>
                {numberValid ? '✓' : '•'} Number (0-9)
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="seller-confirmPassword">
            Confirm Account Password
          </label>
          <input
            id="seller-confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Creating Seller Account...</span>
            </>
          ) : (
            <span>Register as Seller</span>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-[#E2E8F0] pt-5 text-center space-y-2">
        <p className="text-xs text-[#64748B]">
          Already registered as a seller?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In Here
          </Link>
        </p>
        <p className="text-xs text-[#64748B]">
          Looking to buy products instead?{' '}
          <Link href="/register" className="font-bold text-[#0058be] hover:underline">
            Customer Registration
          </Link>
        </p>
      </div>
    </div>
  );
}

