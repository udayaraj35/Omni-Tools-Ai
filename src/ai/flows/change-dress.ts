'use server';
/**
 * @fileOverview Changes the clothing and facial expression of a person in a photo using AI.
 * 
 * CRITICAL: This flow is strictly instructed to preserve 100% of the facial identity,
 * hairstyle, and expression to ensure the photo remains valid for official passport use.
 *
 * - changeDress - A function that handles the dress changing and expression adjustment process.
 * - ChangeDressInput - The input type for the function.
 * - ChangeDressOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChangeDressInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  dressStyle: z.string().describe('The style of dress to apply (e.g., "Professional Black Suit", "Formal Blazer").'),
  expression: z.string().optional().describe('The desired facial expression (e.g., "Neutral", "Natural Smile", "Serious").'),
  customInstructions: z.string().optional().describe('User-provided specific instructions to refine the output (e.g., "remove glasses", "make the suit darker").'),
});
export type ChangeDressInput = z.infer<typeof ChangeDressInputSchema>;

const ChangeDressOutputSchema = z.object({
  photoDataUri: z
    .string()
    .describe('The photo with the new dress and expression applied, as a data URI.'),
});
export type ChangeDressOutput = z.infer<typeof ChangeDressOutputSchema>;

export async function changeDress(input: ChangeDressInput): Promise<ChangeDressOutput> {
  return changeDressFlow(input);
}

const changeDressFlow = ai.defineFlow(
  {
    name: 'changeDressFlow',
    inputSchema: ChangeDressInputSchema,
    outputSchema: ChangeDressOutputSchema,
  },
  async (input) => {
    const isFullBody = input.dressStyle.toLowerCase().includes('full body') || 
                       input.dressStyle.toLowerCase().includes('full look') || 
                       input.dressStyle.toLowerCase().includes('full set');
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: `
        TASK: 
        1. Change the clothing of the person in this image to: ${input.dressStyle}.
        2. Adjust the facial expression to: ${input.expression || 'Maintain original'}.
        ${input.customInstructions ? `3. SPECIAL USER INSTRUCTIONS: ${input.customInstructions}. (Follow these instructions strictly, especially if they ask to remove or modify specific elements like glasses, beards, or colors).` : ''}

        CRITICAL IDENTITY INSTRUCTIONS (STRICT COMPLIANCE REQUIRED):
        1. PRESERVE THE FACE 100%: You MUST NOT alter the person's bone structure, features, skin tone, eye color, or overall identity. The person must be 100% recognizable as the original subject.
        2. NO BEAUTIFICATION: Do not smooth the skin or change facial contours. It must be an exact biometric match to the original person.
        3. EXPRESSION ADJUSTMENT: If an expression is requested, modify the mouth and eyes SUBTLY to match the requested mood (${input.expression}) while keeping the unique facial features intact.
        4. HAIR INTEGRATION: Keep the original hairstyle and hair color exactly as it is. Ensure the new clothing integrates naturally around the hair.
        5. POSE & ANGLE: Maintain the exact head tilt and body orientation of the original subject.

        FRAMING INSTRUCTION:
        ${isFullBody ? 
          '- This is a FULL BODY request. Generate the complete outfit including matching trousers/pants and appropriate shoes.' : 
          '- This is a PASSPORT PHOTO / TOP-ONLY request. Maintain a "Chest Up" or "Bust" portrait framing. Focus only on the upper body clothing.'
        }
        
        The goal is a professional, official photo where the identity is verified against the original face, with the requested expression and custom instructions applied naturally.` },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('AI failed to process the image.');
    }

    return { photoDataUri: media.url };
  }
);

    