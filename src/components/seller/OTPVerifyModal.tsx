'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface OTPVerifyModalProps {
  subOrderId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function OTPVerifyModal({ subOrderId, onSuccess, onClose }: OTPVerifyModalProps) {
  const { fetchWithAuth } = useAuth();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (otp.trim().length !== 6) {
      setError('Enter the 6-digit OTP shown to the customer');
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetchWithAuth(`/api/seller/orders/${subOrderId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Incorrect OTP');
        return;
      }
      onSuccess();
    } catch {
      setError('Network error — please try again');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Confirm Delivery</h2>
        <p className="text-sm text-slate-400 mb-4">Ask the customer for their OTP and enter it below.</p>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit OTP"
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-center text-lg tracking-widest text-white"
        />
        {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isVerifying}
            className="flex-1 rounded-lg bg-success-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isVerifying ? 'Verifying…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerifyModal;