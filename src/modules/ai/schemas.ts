import { z } from 'zod';

export const generateDescriptionSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  category: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  keywords: z.array(z.string()).optional().default([]),
  tone: z.enum(['professional', 'casual', 'persuasive', 'technical']).default('persuasive'),
});

export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;

export interface GenerateDescriptionResult {
  description: string;
  shortDescription?: string;
  bulletPoints: string[];
  suggestedTags: string[];
}


