'use server';
/**
 * @fileOverview A flow to generate a background image for a greeting card.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateBackgroundImageInputSchema = z.object({
  eventType: z.string().describe("The type of event (e.g., 'birthday', 'anniversary')."),
  mood: z.string().optional().describe("The desired mood for the card (e.g., 'inspirational', 'funny')."),
});
export type GenerateBackgroundImageInput = z.infer<typeof GenerateBackgroundImageInputSchema>;

const GenerateBackgroundImageOutputSchema = z.object({
  imageUrl: z.string().describe("The generated background image as a data URI."),
});
export type GenerateBackgroundImageOutput = z.infer<typeof GenerateBackgroundImageOutputSchema>;

const generateBackgroundFlow = ai.defineFlow(
  {
    name: 'generateBackgroundFlow',
    inputSchema: GenerateBackgroundImageInputSchema,
    outputSchema: GenerateBackgroundImageOutputSchema,
  },
  async (input) => {
    const bgPrompt = `A beautiful, high-quality, professional background for a social media post about a "${input.eventType}" event. The mood is "${input.mood || 'celebratory'}". The image should be abstract, elegant, and visually appealing, without any text.`;
    const { media } = await ai.generate({ model: 'googleai/imagen-4.0-fast-generate-001', prompt: bgPrompt });
    
    if (!media?.url) {
      throw new Error('AI failed to generate a background image.');
    }
    
    return {
      imageUrl: media.url,
    };
  }
);

// Wrapper function to be exported
export async function generateBackgroundImage(input: GenerateBackgroundImageInput): Promise<GenerateBackgroundImageOutput> {
  return generateBackgroundFlow(input);
}
