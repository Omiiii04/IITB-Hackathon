'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { calculateCartTotals, StoreCartGroup } from '@/modules/cart/cart.service';

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  title: string;
  price: number;
  imageUrl?: string;
  storeId?: string;
  storeName?: string;
  variantTitle?: string;
  slug?: string;
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  total: number;
  storeGroups: StoreCartGroup[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = 'markethub_cart_items';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, isInitialized]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
      const qtyToAdd = newItem.quantity ?? 1;
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + qtyToAdd,
          };
          return updated;
        }

        return [
          ...prev,
          {
            productId: newItem.productId,
            variantId: newItem.variantId,
            quantity: qtyToAdd,
            title: newItem.title,
            price: newItem.price,
            imageUrl: newItem.imageUrl,
            storeId: newItem.storeId ?? 'default-store',
            storeName: newItem.storeName ?? 'Seller Store',
            variantTitle: newItem.variantTitle,
            slug: newItem.slug,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.productId === productId && item.variantId === variantId) {
            return { ...item, quantity };
          }
          return item;
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Compute live calculations
  const calc = useMemo(() => {
    return calculateCartTotals(
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
        title: i.title,
        imageUrl: i.imageUrl,
        storeId: i.storeId,
        storeName: i.storeName,
        variantTitle: i.variantTitle,
      }))
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    itemCount: calc.totalQuantity,
    subtotal: calc.subtotal,
    estimatedTax: calc.estimatedTax,
    estimatedShipping: calc.estimatedShipping,
    total: calc.total,
    storeGroups: calc.storeGroups,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Return a safe fallback for un-wrapped components or SSR
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      estimatedTax: 0,
      estimatedShipping: 0,
      total: 0,
      storeGroups: [],
      isOpen: false,
      openCart: () => {},
      closeCart: () => {},
      toggleCart: () => {},
      addItem: () => {},
      updateQuantity: () => {},
      removeItem: () => {},
      clearCart: () => {},
    };
  }
  return context;
}

export default useCart;
