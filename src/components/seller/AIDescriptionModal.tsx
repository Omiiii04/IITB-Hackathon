'use client';

import React, { useState } from 'react';
import { Sparkles, X, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export interface AIDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  category?: string;
  brand?: string;
  onApplyDescription: (description: string) => void;
}

export function AIDescriptionModal({
  isOpen,
  onClose,
  productTitle,
  category,
  brand,
  onApplyDescription,
}: AIDescriptionModalProps) {
  const { fetchWithAuth } = useAuth();
  const [tone, setTone] = useState<'engaging' | 'professional' | 'minimalist' | 'luxury'>('engaging');
  const [keywords, setKeywords] = useState('');
  const [features, setFeatures] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!productTitle) {
      setError('Please provide a product title first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const featureList = features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const keywordList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetchWithAuth('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: productTitle,
          category,
          brand,
          tone,
          features: featureList.length > 0 ? featureList : undefined,
          keywords: keywordList.length > 0 ? keywordList : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? 'Failed to generate AI description');
        return;
      }

      setGeneratedText(json.data.description);
    } catch {
      setError('Network error while connecting to Gemini AI');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!generatedText) return;
    onApplyDescription(generatedText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Description Generator</h2>
              <p className="text-xs text-slate-400">Powered by Google Gemini 2.0 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Product Title</label>
            <input
              type="text"
              value={productTitle}
              readOnly
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2 text-slate-300 font-medium cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Tone & Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as 'engaging' | 'professional' | 'minimalist' | 'luxury')}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="engaging">Engaging & Conversational</option>
                <option value="professional">Professional & Technical</option>
                <option value="luxury">Luxury & Premium</option>
                <option value="minimalist">Minimalist & Direct</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Target Keywords (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. lightweight, waterproof, organic"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Key Features / Bullets (one per line)</label>
            <textarea
              rows={2}
              placeholder="e.g. 40mm custom drivers&#10;45-hour battery life"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Trigger */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Copy...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {generatedText ? 'Regenerate Description' : 'Generate with Gemini AI'}
            </>
          )}
        </button>

        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        {/* Output Preview */}
        {generatedText && (
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Generated Description</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
              {generatedText}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                Apply to Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIDescriptionModal;
