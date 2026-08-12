import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).default(1),
  // Optional client-provided snapshot details
  title: z.string().optional(),
  price: z.number().optional(),
  imageUrl: z.string().optional(),
  storeId: z.string().optional(),
  storeName: z.string().optional(),
  variantTitle: z.string().optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(0),
});

export const removeCartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
});

export const validateCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
export type ValidateCartInput = z.infer<typeof validateCartSchema>;
