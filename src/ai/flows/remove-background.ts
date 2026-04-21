
'use server';
/**
 * @fileOverview Removes the background from a photo using AI.
 *
 * - removeBackground - A function that handles the background removal process.
 * - RemoveBackgroundInput - The input type for the removeBackground function.
 * - RemoveBackgroundOutput - The return type for the removeBackground function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RemoveBackgroundInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo to remove the background from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  imageUrl: z
    .string()
    .optional()
    .describe("A URL of the photo to remove the background from."),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

const RemoveBackgroundOutputSchema = z.object({
  photoDataUri: z
    .string()
    .describe('The photo with the background removed, as a data URI.'),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

export async function removeBackground(input: RemoveBackgroundInput): Promise<RemoveBackgroundOutput> {
  return removeBackgroundFlow(input);
}

const removeBackgroundFlow = ai.defineFlow(
  {
    name: 'removeBackgroundFlow',
    inputSchema: RemoveBackgroundInputSchema,
    outputSchema: RemoveBackgroundOutputSchema,
  },
  async (input) => {
    const mediaUrl = input.photoDataUri || input.imageUrl;
    
    if (!mediaUrl) {
      throw new Error('No image source provided. Either photoDataUri or imageUrl is required.');
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: mediaUrl } },
        { text: 'Detect the main subject (person) in this image. Remove the background completely, leaving only the main subject with a transparent background. The output must be a PNG with transparency.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to remove the background.');
    }

    return { photoDataUri: media.url };
  }
);
