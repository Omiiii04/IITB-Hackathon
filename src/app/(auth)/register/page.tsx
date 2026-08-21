
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
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
          role: 'CUSTOMER',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Registration failed.');
      }

      // Auto-login after registration
      try {
        await login(email, password);
        router.push('/');
      } catch {
        router.push('/login?registered=true');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191b23] tracking-tight">Create Customer Account</h1>
        <p className="mt-1.5 text-sm text-[#64748B]">Join FlexHub to explore top verified products</p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600 flex items-center gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Google OAuth Option */}
      <a
        href="/api/auth/oauth/google"
        className="w-full py-3 px-4 rounded-2xl border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#1E293B] text-sm font-semibold flex items-center justify-center gap-3 transition-all mb-6 shadow-2xs hover:shadow-xs"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        <span>Sign up with Google</span>
      </a>

      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]" />
        </div>
        <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="name">
            Full Name (Optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 10 chars with A-Z, a-z, 0-9"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-colors"
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
          <label className="block text-xs font-bold text-[#191b23] mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 rounded-xl bg-[#0058be] hover:bg-[#004395] py-3 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-[#E2E8F0] pt-5 text-center space-y-2">
        <p className="text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#0058be] hover:underline">
            Sign In
          </Link>
        </p>
        <p className="text-xs text-[#64748B]">
          Registering as a vendor?{' '}
          <Link href="/seller-register" className="font-bold text-indigo-600 hover:underline">
            Create Seller Account
          </Link>
        </p>
      </div>
    </div>
  );
}

