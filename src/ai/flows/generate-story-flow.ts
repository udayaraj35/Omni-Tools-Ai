'use server';

/**
 * @fileOverview A flow to generate a story based on a user's prompt.
 *
 * - generateStory - A function that generates a story.
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateStoryInputSchema = z.object({
  prompt: z.string().describe("The user's prompt or idea for the story."),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The AI-generated story.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const storyPrompt = ai.definePrompt({
    name: 'generateStoryPrompt',
    input: { schema: GenerateStoryInputSchema },
    output: { schema: GenerateStoryOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are a master storyteller. Based on the user's prompt, write a creative and engaging story.

User Prompt:
{{{prompt}}}

Your Story:
`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async (input) => {
    const { output } = await storyPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a story.");
    }
    return output;
  }
);
