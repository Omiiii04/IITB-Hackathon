'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  inputClassName?: string;
}

export function SearchBar({
  className = '',
  placeholder = 'Search products, brands, categories...',
  inputClassName = '',
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  // Sync the input when URL query param changes
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/products');
    }
  };

  const handleClear = () => {
    setQuery('');
    if (searchParams.get('q')) {
      router.push('/products');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex-1 max-w-xl ${className}`} role="search">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] pointer-events-none" />
        <input
          type="text"
          id="storefront-search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-16 py-2 text-sm text-[#191b23] placeholder-[#94A3B8] focus:border-[#0058be] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0058be] transition-colors ${inputClassName}`}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-1 rounded-md text-[#64748B] hover:text-[#191b23] hover:bg-[#E2E8F0] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search products"
            className="p-1.5 rounded-lg bg-[#0058be] hover:bg-[#004395] text-white transition-colors"
          >
            <Search className="h-3 w-3" />
          </button>
        </div>
      </div>
    </form>
  );
}

export default SearchBar;
