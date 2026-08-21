
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setStatus('verifying');

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'This verification link is invalid or has expired.');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus('error');
        setMessage('Network error. Unable to verify email address.');
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendStatus('sending');
    setResendMessage(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResendStatus('sent');
        setResendMessage(data.message || 'Verification link sent! Check your inbox.');
      } else {
        setResendStatus('error');
        setResendMessage(data.error || 'Failed to send verification link.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-sm">
      <div className="mb-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-[#d8e2ff] border border-[#adc6ff] text-[#0058be] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191b23] tracking-tight">Email Verification</h1>
        <p className="mt-1.5 text-sm text-[#64748B]">Confirm your FlexHub account email address</p>
      </div>

      {status === 'verifying' && (
        <div className="text-center py-6 space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#0058be]/30 border-t-[#0058be] animate-spin mx-auto" />
          <p className="text-sm text-[#475569]">Verifying your token...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-4 space-y-4">
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{message}</span>
          </div>

          <Link
            href="/login"
            className="inline-block w-full rounded-xl bg-[#0058be] hover:bg-[#004395] py-3 text-sm font-semibold text-white shadow-sm transition-all text-center"
          >
            Proceed to Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-2 space-y-4">
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-sm flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      {(status === 'idle' || status === 'error') && (
        <div className="mt-6 border-t border-[#E2E8F0] pt-6">
          <h2 className="text-sm font-bold text-[#191b23] mb-1">Request a New Verification Link</h2>
          <p className="text-xs text-[#64748B] mb-4">
            Enter your account email address to receive a fresh verification link.
          </p>

          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              required
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 transition-colors"
            />

            <button
              type="submit"
              disabled={resendStatus === 'sending'}
              className="w-full rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-[#191b23] py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resendStatus === 'sending' ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-slate-600/30 border-t-slate-600 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Verification Link</span>
              )}
            </button>
          </form>

          {resendMessage && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs font-medium ${
                resendStatus === 'sent'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {resendMessage}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 border-t border-[#E2E8F0] pt-5 text-center">
        <Link href="/login" className="text-xs font-bold text-[#0058be] hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-8 text-center text-[#64748B]">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

