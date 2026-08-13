import { z } from 'zod';

export const reserveItemSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
});

export const reserveStockInputSchema = z.object({
  items: z.array(reserveItemSchema).min(1, 'At least one item is required for reservation'),
  orderId: z.string().uuid().optional(),
  ttlMinutes: z.number().int().positive().default(15),
});

export const releaseReservationInputSchema = z.object({
  items: z.array(reserveItemSchema).min(1, 'At least one item is required to release reservation'),
});

export const commitStockInputSchema = z.object({
  items: z.array(reserveItemSchema).min(1, 'At least one item is required to commit stock'),
});

export type ReserveItem = z.infer<typeof reserveItemSchema>;
export type ReserveStockInput = z.infer<typeof reserveStockInputSchema>;
export type ReleaseReservationInput = z.infer<typeof releaseReservationInputSchema>;
export type CommitStockInput = z.infer<typeof commitStockInputSchema>;

export class InsufficientStockError extends Error {
  constructor(
    public readonly variantId: string,
    public readonly availableStock: number,
    public readonly requestedQuantity: number,
    public readonly variantTitle?: string
  ) {
    super(
      `Insufficient stock for variant "${variantTitle || variantId}". Available: ${availableStock}, Requested: ${requestedQuantity}`
    );
    this.name = 'InsufficientStockError';
  }
}
