
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Edit2,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

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

interface AddressFormState {
  recipientName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormState = {
  recipientName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form modal/drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<AddressFormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status banners
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/addresses');
      if (!res.ok) throw new Error('Failed to load addresses');
      const data: Address[] = await res.json();
      setAddresses(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not fetch saved addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setFormErrors({});
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setForm({
      recipientName: address.recipientName,
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setFormErrors({});
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errs: Partial<AddressFormState> = {};
    if (!form.recipientName.trim()) errs.recipientName = 'Recipient name is required';
    if (!form.line1.trim()) errs.line1 = 'Address line 1 is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!/^\d{6}$/.test(form.postalCode.trim())) errs.postalCode = 'Enter a valid 6-digit PIN code';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = 'Enter a valid 10-digit mobile number';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);

    const isEdit = Boolean(editingAddress);
    const url = isEdit ? `/api/addresses/${editingAddress?.id}` : '/api/addresses';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          country: 'India',
        }),
      });

      const body = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(body?.error ?? 'Failed to save address');

      await fetchAddresses();
      setIsModalOpen(false);
      showToast(isEdit ? 'Address updated successfully' : 'Address added successfully');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error('Failed to set default address');
      await fetchAddresses();
      showToast('Default address updated');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update default address', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete address');
      await fetchAddresses();
      showToast('Address removed');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete address', 'error');
    }
  };

  const handleFieldChange = (field: keyof AddressFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div
          className={[
            'flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-semibold shadow-lg transition-all duration-300',
            toastMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border border-red-500/30 text-red-400',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Saved Delivery Addresses</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Manage saved shipping destinations for faster checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-44 rounded-3xl border border-[#E2E8F0] bg-white p-5 animate-pulse space-y-3 shadow-xs"
            >
              <div className="h-4 w-1/3 rounded bg-[#F1F5F9]" />
              <div className="h-3 w-3/4 rounded bg-[#F8FAFC]" />
              <div className="h-3 w-1/2 rounded bg-[#F8FAFC]" />
              <div className="h-8 w-full rounded-xl bg-[#F8FAFC] mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && fetchError && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          <AlertCircle className="mx-auto h-8 w-8 text-amber-600 mb-2" />
          <p className="text-sm font-semibold">{fetchError}</p>
          <button
            type="button"
            onClick={fetchAddresses}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0058be] hover:text-[#004395] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && addresses.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white p-12 text-center shadow-sm">
          <div className="h-16 w-16 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#64748B]">
            <MapPin className="h-8 w-8 text-[#0058be]" />
          </div>
          <h3 className="text-base font-bold text-[#191b23] mb-1">No Saved Addresses Yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mb-6 leading-relaxed">
            Add your primary shipping destination to enjoy one-click checkout across all seller stores.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0058be] hover:bg-[#004395] px-6 py-3 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Address</span>
          </button>
        </div>
      )}

      {/* Addresses Grid */}
      {!loading && !fetchError && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={[
                'relative flex flex-col justify-between rounded-3xl border p-5 transition-all duration-200 shadow-sm',
                addr.isDefault
                  ? 'border-[#0058be] bg-[#d8e2ff]/15 ring-1 ring-[#0058be]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]',
              ].join(' ')}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#191b23]">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0058be] bg-[#d8e2ff] border border-[#adc6ff] rounded-full px-2.5 py-0.5">
                        <Star className="h-3 w-3 fill-[#0058be]" />
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed font-normal">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {addr.city}, {addr.state} &mdash; <span className="font-mono font-semibold text-[#191b23]">{addr.postalCode}</span>
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">{addr.country}</p>
                <p className="text-xs font-mono text-[#94A3B8] mt-2">Mobile: {addr.phone}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4 mt-4 gap-2">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-[#64748B] hover:text-[#0058be] transition-colors cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Default Shipping
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#191b23] p-1.5 rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                    title="Edit Address"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Address"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0058be]" />
                <h3 className="text-base font-bold text-[#191b23]">
                  {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#191b23] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Recipient name */}
              <Field
                label="Full Name / Recipient"
                id="modal-name"
                value={form.recipientName}
                error={formErrors.recipientName}
                placeholder="e.g. Somnath Bhatia"
                onChange={(v) => handleFieldChange('recipientName', v)}
              />

              {/* Line 1 */}
              <Field
                label="Address Line 1"
                id="modal-line1"
                value={form.line1}
                error={formErrors.line1}
                placeholder="Flat / Building / Street Address"
                onChange={(v) => handleFieldChange('line1', v)}
              />

              {/* Line 2 */}
              <Field
                label="Address Line 2 (Optional)"
                id="modal-line2"
                value={form.line2}
                placeholder="Landmark, Apartment Name, Unit"
                onChange={(v) => handleFieldChange('line2', v)}
              />

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  id="modal-city"
                  value={form.city}
                  error={formErrors.city}
                  placeholder="e.g. Mumbai"
                  onChange={(v) => handleFieldChange('city', v)}
                />
                <Field
                  label="State"
                  id="modal-state"
                  value={form.state}
                  error={formErrors.state}
                  placeholder="e.g. Maharashtra"
                  onChange={(v) => handleFieldChange('state', v)}
                />
              </div>

              {/* PIN Code + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="PIN Code (6 digits)"
                  id="modal-pin"
                  value={form.postalCode}
                  error={formErrors.postalCode}
                  placeholder="400001"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(v) => handleFieldChange('postalCode', v)}
                />
                <Field
                  label="Mobile Phone (10 digits)"
                  id="modal-phone"
                  value={form.phone}
                  error={formErrors.phone}
                  placeholder="9876543210"
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(v) => handleFieldChange('phone', v)}
                />
              </div>

              {/* Is Default Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="modal-default-check"
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => handleFieldChange('isDefault', e.target.checked)}
                  className="h-4 w-4 rounded border-[#CBD5E1] text-[#0058be] focus:ring-[#0058be]/30 cursor-pointer"
                />
                <label htmlFor="modal-default-check" className="text-xs text-[#475569] font-medium cursor-pointer">
                  Make this my default shipping address
                </label>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0058be] hover:bg-[#004395] disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {submitting ? 'Saving\u2026' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] px-4 py-2.5 text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Field Component ──────────────────────────────────────────────────
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
      <label htmlFor={id} className="block text-xs font-medium text-[#475569]">
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
          'w-full rounded-xl border bg-white px-3 py-2 text-xs text-[#191b23] placeholder-[#94A3B8] outline-none transition-colors shadow-2xs',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
            : 'border-[#E2E8F0] focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]/30',
        ].join(' ')}
      />
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

