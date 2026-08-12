'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Plus, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export interface Address {
  id: string;
  recipientName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  selectedId?: string;
  className?: string;
}

interface NewAddressForm {
  recipientName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

const EMPTY_FORM: NewAddressForm = {
  recipientName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
};

export function AddressSelector({ onSelect, selectedId, className = '' }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewAddressForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<NewAddressForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/addresses');
      if (!res.ok) throw new Error('Failed to load addresses');
      const data: Address[] = await res.json();
      setAddresses(data);
      const def = data.find((a) => a.isDefault) ?? data[0];
      if (def && !selectedId) onSelect(def);
    } catch {
      setError('Could not load your saved addresses. Please add one below.');
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }, [onSelect, selectedId]);

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = (): boolean => {
    const errs: Partial<NewAddressForm> = {};
    if (!form.recipientName.trim()) errs.recipientName = 'Name is required';
    if (!form.line1.trim()) errs.line1 = 'Address line 1 is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!/^\d{6}$/.test(form.postalCode.trim())) errs.postalCode = 'Enter a valid 6-digit PIN';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = 'Enter a valid 10-digit mobile number';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, country: 'India' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body?.error ?? 'Failed to save address');
      }
      const saved: Address = await res.json();
      setAddresses((prev) => [...prev, saved]);
      onSelect(saved);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleField = (field: keyof NewAddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 py-8 justify-center ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <span className="text-sm text-slate-400">Loading your addresses&hellip;</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {addresses.map((addr) => {
        const isSelected = addr.id === selectedId;
        return (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr)}
            className={[
              'w-full text-left rounded-2xl border p-4 transition-all duration-200',
              isSelected
                ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600',
                ].join(' ')}
              >
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{addr.recipientName}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-full px-2 py-0.5">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''},{' '}
                  {addr.city}, {addr.state} &mdash; {addr.postalCode}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{addr.phone}</p>
              </div>
            </div>
          </button>
        );
      })}

      {error && !showForm && (
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowForm((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-600 hover:border-blue-500/60 hover:bg-blue-500/5 px-4 py-3 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-all duration-200"
      >
        <Plus className="h-4 w-4" />
        <span>Add a new address</span>
        {showForm ? (
          <ChevronUp className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        )}
      </button>

      {showForm && (
        <form
          onSubmit={handleAddAddress}
          className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">New Delivery Address</span>
          </div>

          <Field
            label="Full Name"
            id="addr-name"
            value={form.recipientName}
            error={formErrors.recipientName}
            placeholder="Somnath Bhatia"
            onChange={(v) => handleField('recipientName', v)}
          />
          <Field
            label="Address Line 1"
            id="addr-line1"
            value={form.line1}
            error={formErrors.line1}
            placeholder="Flat 3B, Sunrise Apartments"
            onChange={(v) => handleField('line1', v)}
          />
          <Field
            label="Address Line 2 (Optional)"
            id="addr-line2"
            value={form.line2}
            placeholder="Near Central Park"
            onChange={(v) => handleField('line2', v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="City"
              id="addr-city"
              value={form.city}
              error={formErrors.city}
              placeholder="Mumbai"
              onChange={(v) => handleField('city', v)}
            />
            <Field
              label="State"
              id="addr-state"
              value={form.state}
              error={formErrors.state}
              placeholder="Maharashtra"
              onChange={(v) => handleField('state', v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="PIN Code"
              id="addr-pin"
              value={form.postalCode}
              error={formErrors.postalCode}
              placeholder="400001"
              inputMode="numeric"
              maxLength={6}
              onChange={(v) => handleField('postalCode', v)}
            />
            <Field
              label="Mobile Number"
              id="addr-phone"
              value={form.phone}
              error={formErrors.phone}
              placeholder="9876543210"
              inputMode="numeric"
              maxLength={10}
              onChange={(v) => handleField('phone', v)}
            />
          </div>

          {submitError && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {submitError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitting ? 'Saving\u2026' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormErrors({}); }}
              className="rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

function Field({ label, id, value, onChange, error, placeholder, inputMode, maxLength }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-slate-400">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className={[
          'w-full rounded-xl border bg-slate-900 px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors',
          error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
            : 'border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30',
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default AddressSelector;

