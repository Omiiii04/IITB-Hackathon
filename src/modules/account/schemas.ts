import { z } from 'zod';

export const addressInputSchema = z.object({
  recipientName: z.string().trim().min(1, 'Recipient name is required'),
  line1: z.string().trim().min(1, 'Address line 1 is required'),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().min(1, 'Postal / PIN code is required'),
  country: z.string().trim().default('India'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
