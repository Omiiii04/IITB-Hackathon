
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
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-6 text-center">
        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Email Verification</h1>
        <p className="mt-1 text-sm text-slate-400">Confirm your account email address</p>
      </div>

      {status === 'verifying' && (
        <div className="text-center py-6 space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Verifying your token...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-4 space-y-4">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{message}</span>
          </div>

          <Link
            href="/login"
            className="inline-block w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all text-center"
          >
            Proceed to Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-2 space-y-4">
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message}</span>
          </div>
        </div>
      )}

      {(status === 'idle' || status === 'error') && (
        <div className="mt-4 border-t border-slate-800 pt-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Request a New Verification Link</h2>
          <p className="text-xs text-slate-400 mb-4">
            Enter your account email address to receive a fresh verification link.
          </p>

          <form onSubmit={handleResend} className="space-y-3">
            <input
              type="email"
              required
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />

            <button
              type="submit"
              disabled={resendStatus === 'sending'}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resendStatus === 'sending' ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Verification Link</span>
              )}
            </button>
          </form>

          {resendMessage && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs ${
                resendStatus === 'sent'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {resendMessage}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
        <Link href="/login" className="text-xs font-semibold text-blue-400 hover:underline">
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
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

