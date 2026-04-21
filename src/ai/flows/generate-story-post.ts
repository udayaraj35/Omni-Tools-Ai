'use server';
/**
 * @fileOverview Generates a stylized story post from an image and text.
 *
 * - generateStoryPost - A function that handles the story post generation.
 * - GenerateStoryPostInput - The input type for the function.
 * - GenerateStoryPostOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateStoryPostInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe('The base image for the story post as a data URI.'),
  mainText: z.string().describe('The primary text to overlay on the image.'),
  subText: z.string().optional().describe('Secondary text or a subtitle.'),
  style: z.string().describe('A description of the desired style (e.g., "Winter Collection", "Professional Profile", "Music Promo").'),
});
export type GenerateStoryPostInput = z.infer<typeof GenerateStoryPostInputSchema>;

const GenerateStoryPostOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe('The generated story post image, as a data URI.'),
});
export type GenerateStoryPostOutput = z.infer<typeof GenerateStoryPostOutputSchema>;


export async function generateStoryPost(input: GenerateStoryPostInput): Promise<GenerateStoryPostOutput> {
  return generateStoryPostFlow(input);
}


const generateStoryPostFlow = ai.defineFlow(
  {
    name: 'generateStoryPostFlow',
    inputSchema: GenerateStoryPostInputSchema,
    outputSchema: GenerateStoryPostOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `
            Create a visually appealing story post based on the provided image and text.
            
            **Style:** ${input.style}
            **Main Text:** ${input.mainText}
            ${input.subText ? `**Sub Text:** ${input.subText}` : ''}
            
            **Instructions:**
            1.  Integrate the text onto the image in a stylish and professional way.
            2.  Choose a font, color, and placement that complements the image and the requested style. For example, a "Winter Collection" style might use elegant, script-like fonts, while a "Professional Profile" might use clean, modern sans-serif fonts.
            3.  The final output should be a single, complete image. Do not just return the text.
            4.  Ensure the text is legible and well-placed.
            5.  Maintain the original aspect ratio of the image. If possible, aim for a vertical 9:16 aspect ratio suitable for social media stories.
        `},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate an image.');
    }

    return { imageUrl: media.url };
  }
);
