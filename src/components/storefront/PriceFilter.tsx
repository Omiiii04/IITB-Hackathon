'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, RotateCcw } from 'lucide-react';
import { useDebouncedCallback } from '@/hooks/useDebounce';

export interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min?: number, max?: number) => void;
  presets?: { label: string; min?: number; max?: number }[];
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_PRESETS = [
  { label: 'Under ₹500', max: 500 },
  { label: '₹500 - ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: 'Over ₹5,000', min: 5000 },
];

export function PriceFilter({
  minPrice: initialMin,
  maxPrice: initialMax,
  onPriceChange,
  presets = DEFAULT_PRESETS,
  className = '',
  children,
}: PriceFilterProps) {
  const [minVal, setMinVal] = useState<string>(initialMin !== undefined ? String(initialMin) : '');
  const [maxVal, setMaxVal] = useState<string>(initialMax !== undefined ? String(initialMax) : '');

  useEffect(() => {
    setMinVal(initialMin !== undefined ? String(initialMin) : '');
  }, [initialMin]);

  useEffect(() => {
    setMaxVal(initialMax !== undefined ? String(initialMax) : '');
  }, [initialMax]);

  const debouncedNotify = useDebouncedCallback((minStr: string, maxStr: string) => {
    const min = minStr ? Number(minStr) : undefined;
    const max = maxStr ? Number(maxStr) : undefined;
    onPriceChange?.(
      min !== undefined && !isNaN(min) ? min : undefined,
      max !== undefined && !isNaN(max) ? max : undefined
    );
  }, 400);

  if (children) {
    return <div className={className}>{children}</div>;
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMinVal(val);
    debouncedNotify(val, maxVal);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMaxVal(val);
    debouncedNotify(minVal, val);
  };

  const applyPreset = (presetMin?: number, presetMax?: number) => {
    const newMin = presetMin !== undefined ? String(presetMin) : '';
    const newMax = presetMax !== undefined ? String(presetMax) : '';
    setMinVal(newMin);
    setMaxVal(newMax);
    onPriceChange?.(presetMin, presetMax);
  };

  const handleReset = () => {
    setMinVal('');
    setMaxVal('');
    onPriceChange?.(undefined, undefined);
  };

  const hasFilter = minVal !== '' || maxVal !== '';

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Price Range
        </h3>
        {hasFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="number"
            min={0}
            value={minVal}
            onChange={handleMinChange}
            placeholder="Min"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-8 pr-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-600 font-medium">–</span>
        <div className="relative flex-1">
          <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="number"
            min={0}
            value={maxVal}
            onChange={handleMaxChange}
            placeholder="Max"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-8 pr-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, idx) => {
            const isSelected =
              (preset.min === undefined ? minVal === '' : String(preset.min) === minVal) &&
              (preset.max === undefined ? maxVal === '' : String(preset.max) === maxVal);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset.min, preset.max)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PriceFilter;
