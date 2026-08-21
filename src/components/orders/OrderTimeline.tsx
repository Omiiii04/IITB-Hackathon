'use client';

import React from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  Navigation,
  Home,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { TimelineStep } from '@/modules/orders/orders.service';

export interface OrderTimelineProps {
  steps?: TimelineStep[];
  orderStatus?: string;
  className?: string;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  PLACED: ShoppingBag,
  SELLER_ACCEPTED: CheckCircle2,
  PACKED: Package,
  SHIPPED: Truck,
  OUT_FOR_DELIVERY: Navigation,
  DELIVERED: Home,
  CANCELLED: XCircle,
  PAYMENT_FAILED: AlertTriangle,
};

export function OrderTimeline({ steps = [], orderStatus, className = '' }: OrderTimelineProps) {
  if (steps.length === 0) {
    return null;
  }

  const isCancelled = orderStatus === 'CANCELLED' || steps.some((s) => s.key === 'CANCELLED');
  const isFailed = orderStatus === 'PAYMENT_FAILED' || steps.some((s) => s.key === 'PAYMENT_FAILED');

  if (isCancelled || isFailed) {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-5 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
            {isCancelled ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-800">
              {isCancelled ? 'Order Cancelled' : 'Payment Failed'}
            </h4>
            <p className="text-xs text-red-600 mt-0.5">
              {isCancelled
                ? 'This order has been cancelled. Any processed payment will be refunded.'
                : 'Payment for this order could not be completed.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line background */}
        <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#E2E8F0] -z-0" />

        {steps.map((step) => {
          const Icon = STEP_ICONS[step.key] ?? CheckCircle2;
          const isCompleted = step.completed;
          const isActive = step.active;

          return (
            <div key={step.key} className="flex flex-col items-center text-center z-10 max-w-[120px]">
              <div
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-300',
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-xs'
                    : isActive
                    ? 'border-[#0058be] bg-[#0058be] text-white shadow-md ring-4 ring-[#0058be]/20'
                    : 'border-[#E2E8F0] bg-white text-[#94A3B8]',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p
                className={[
                  'mt-2.5 text-xs font-bold transition-colors',
                  isActive ? 'text-[#0058be]' : isCompleted ? 'text-[#191b23]' : 'text-[#94A3B8]',
                ].join(' ')}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-[10px] text-[#64748B] leading-tight hidden lg:block">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile vertical stepper */}
      <div className="sm:hidden space-y-4 relative pl-4 border-l-2 border-[#E2E8F0] ml-3">
        {steps.map((step) => {
          const Icon = STEP_ICONS[step.key] ?? CheckCircle2;
          const isCompleted = step.completed;
          const isActive = step.active;

          return (
            <div key={step.key} className="relative flex items-start gap-3">
              <div
                className={[
                  'absolute -left-[25px] top-0 flex h-7 w-7 items-center justify-center rounded-xl border-2 transition-colors',
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : isActive
                    ? 'border-[#0058be] bg-[#0058be] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#94A3B8]',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="pl-4">
                <p
                  className={[
                    'text-xs font-bold',
                    isActive ? 'text-[#0058be]' : isCompleted ? 'text-[#191b23]' : 'text-[#94A3B8]',
                  ].join(' ')}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-[#64748B]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;

