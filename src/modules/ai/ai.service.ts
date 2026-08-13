import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { GenerateDescriptionInput, GenerateDescriptionResult } from './schemas';

export class AIService {
  /**
   * Generates rich product descriptions, highlights, and tags using Gemini or fallback rule-based generation.
   */
  static async generateProductDescription(
    input: GenerateDescriptionInput
  ): Promise<GenerateDescriptionResult> {
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key') {
      logger.warn('Gemini API key not configured, returning template-generated description');
      return this.generateTemplateFallback(input);
    }

    try {
      const prompt = `You are an expert e-commerce copywriter. Write an engaging, high-converting product description for an online multi-vendor store.

Product Title: ${input.title}
${input.category ? `Category: ${input.category}` : ''}
${input.features && input.features.length > 0 ? `Key Features: ${input.features.join(', ')}` : ''}
${input.keywords && input.keywords.length > 0 ? `Target Keywords: ${input.keywords.join(', ')}` : ''}
Tone: ${input.tone}

Respond ONLY with valid JSON in this exact structure without markdown formatting or backticks:
{
  "description": "2-3 comprehensive paragraphs highlighting value and benefits",
  "shortDescription": "1-2 punchy summary sentences",
  "bulletPoints": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        logger.error('Gemini API request failed', { status: response.status, errorText });
        return this.generateTemplateFallback(input);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        return this.generateTemplateFallback(input);
      }

      // Clean potential JSON markdown blocks
      const cleanJson = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        description: parsed.description || `${input.title} is a premium product designed for superior quality and performance.`,
        shortDescription: parsed.shortDescription || `Elevate your experience with the all-new ${input.title}.`,
        bulletPoints: Array.isArray(parsed.bulletPoints) && parsed.bulletPoints.length > 0
          ? parsed.bulletPoints
          : (input.features || [`High quality build`, `Reliable performance`, `Modern design`]),
        suggestedTags: Array.isArray(parsed.suggestedTags) && parsed.suggestedTags.length > 0
          ? parsed.suggestedTags
          : (input.keywords || [input.title.toLowerCase()]),
      };
    } catch (err) {
      logger.error('Error generating description with AI', { error: err });
      return this.generateTemplateFallback(input);
    }
  }

  private static generateTemplateFallback(
    input: GenerateDescriptionInput
  ): GenerateDescriptionResult {
    const featureText = input.features && input.features.length > 0
      ? ` Engineered with ${input.features.join(', ')} to deliver exceptional convenience and durability.`
      : ' Engineered with high-grade components for unmatched durability and performance.';

    return {
      description: `Discover the power and craftsmanship of ${input.title}.${featureText} Whether you are looking for reliability, modern style, or everyday performance, this product is designed to exceed expectations.`,
      shortDescription: `Top-rated ${input.title} built for durability and premium experience.`,
      bulletPoints: input.features && input.features.length > 0
        ? input.features
        : ['Premium quality construction', 'Optimized for everyday use', 'Backed by customer satisfaction'],
      suggestedTags: input.keywords && input.keywords.length > 0
        ? input.keywords
        : [input.title.toLowerCase().replace(/\s+/g, '-'), 'trending', 'quality'],
    };
  }
}


