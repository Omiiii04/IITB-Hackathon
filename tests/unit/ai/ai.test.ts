import { describe, it, expect, vi } from 'vitest';
import { AIService } from '@/modules/ai/ai.service';
import { generateDescriptionSchema } from '@/modules/ai/schemas';

describe('AI Module Unit Tests', () => {
  describe('generateDescriptionSchema', () => {
    it('validates required title and default tone', () => {
      const valid = generateDescriptionSchema.parse({
        title: 'Ergonomic Wireless Keyboard',
      });
      expect(valid.title).toBe('Ergonomic Wireless Keyboard');
      expect(valid.tone).toBe('persuasive');
      expect(valid.features).toEqual([]);
      expect(valid.keywords).toEqual([]);
    });

    it('rejects empty title', () => {
      const result = generateDescriptionSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('AIService.generateProductDescription', () => {
    it('generates fallback description with features and keywords if API key is missing or mock', async () => {
      const result = await AIService.generateProductDescription({
        title: 'Wireless Mechanical Keyboard',
        category: 'Electronics',
        features: ['RGB Backlight', 'Hot-swappable switches', 'Bluetooth 5.2'],
        keywords: ['mechanical', 'wireless', 'ergonomic'],
        tone: 'persuasive',
      });

      expect(result).toBeDefined();
      expect(result.description).toContain('Wireless Mechanical Keyboard');
      expect(result.shortDescription).toBeDefined();
      expect(result.bulletPoints.length).toBeGreaterThanOrEqual(3);
      expect(result.suggestedTags.length).toBeGreaterThanOrEqual(3);
    });
  });
});
