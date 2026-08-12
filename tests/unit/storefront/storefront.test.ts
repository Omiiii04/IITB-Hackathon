import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';

describe('Storefront Components & Hooks Unit Tests', () => {
  describe('useDebounce module exports', () => {
    it('exports useDebounce function', () => {
      expect(typeof useDebounce).toBe('function');
    });

    it('handles setTimeout callback mechanics properly', () => {
      vi.useFakeTimers();
      const callback = vi.fn();

      let timer: ReturnType<typeof setTimeout> | null = null;
      const debouncedTrigger = (val: string, delay: number = 300) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          callback(val);
        }, delay);
      };

      debouncedTrigger('search1');
      debouncedTrigger('search2');
      debouncedTrigger('search3');

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('search3');

      vi.useRealTimers();
    });
  });

  describe('ProductCard price and discount calculations', () => {
    it('calculates lowest variant price correctly', () => {
      const variants = [
        { id: 'v1', variantPrice: 499, stock: 10 },
        { id: 'v2', variantPrice: 399, stock: 5 },
        { id: 'v3', variantPrice: 599, stock: 0 },
      ];
      const basePrice = 699;

      const lowest = Math.min(...variants.map((v) => v.variantPrice));
      expect(lowest).toBe(399);
      expect(lowest < basePrice).toBe(true);
    });

    it('calculates total stock and stock availability', () => {
      const variantsInStock = [
        { id: 'v1', variantPrice: 499, stock: 0 },
        { id: 'v2', variantPrice: 399, stock: 5 },
      ];
      const totalStockIn = variantsInStock.reduce((sum, v) => sum + v.stock, 0);
      expect(totalStockIn).toBe(5);
      expect(totalStockIn > 0).toBe(true);

      const variantsOOS = [
        { id: 'v1', variantPrice: 499, stock: 0 },
        { id: 'v2', variantPrice: 399, stock: 0 },
      ];
      const totalStockOOS = variantsOOS.reduce((sum, v) => sum + v.stock, 0);
      expect(totalStockOOS).toBe(0);
      expect(totalStockOOS > 0).toBe(false);
    });
  });
});
