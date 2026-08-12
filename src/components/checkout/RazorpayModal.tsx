'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Declare Razorpay global that is injected by their checkout script
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;       // in paisa
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpaySuccessResponse) => void;
}

interface RazorpayInstance {
  open(): void;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OpenRazorpayParams {
  /** Razorpay order_id returned by your /api/checkout endpoint */
  orderId: string;
  /** Total in paisa (₹ × 100) */
  amountPaisa: number;
  currency?: string;
  storeName?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface RazorpayModalHandle {
  open(params: OpenRazorpayParams): void;
}

export interface RazorpayModalProps {
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onFailure?: (description: string) => void;
  onDismiss?: () => void;
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const RazorpayModal = forwardRef<RazorpayModalHandle, RazorpayModalProps>(
  function RazorpayModal({ onSuccess, onFailure, onDismiss }, ref) {
    const scriptLoaded = useRef(false);

    // Dynamically inject Razorpay checkout script once on mount
    useEffect(() => {
      if (scriptLoaded.current || document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
        scriptLoaded.current = true;
        return;
      }
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => { scriptLoaded.current = true; };
      script.onerror = () => {
        onFailure?.('Failed to load Razorpay payment SDK. Please check your internet connection.');
      };
      document.head.appendChild(script);
    }, [onFailure]);

    useImperativeHandle(ref, () => ({
      open({ orderId, amountPaisa, currency = 'INR', storeName = 'MarketHub', prefill }: OpenRazorpayParams) {
        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (!keyId) {
          onFailure?.('Payment configuration error: Razorpay key is not set.');
          return;
        }

        if (!window.Razorpay) {
          onFailure?.('Razorpay SDK is not loaded yet. Please wait a moment and try again.');
          return;
        }

        const options: RazorpayOptions = {
          key: keyId,
          amount: amountPaisa,
          currency,
          name: storeName,
          description: 'MarketHub Order Payment',
          order_id: orderId,
          prefill,
          theme: { color: '#3b82f6' },
          modal: {
            ondismiss: () => {
              onDismiss?.();
            },
          },
          handler: (response: RazorpaySuccessResponse) => {
            onSuccess(response);
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      },
    }));

    // This component renders nothing — it's purely imperative
    return null;
  }
);

export default RazorpayModal;

