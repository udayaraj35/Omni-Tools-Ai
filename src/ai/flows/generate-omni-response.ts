'use server';

/**
 * @fileOverview A general-purpose AI flow for the Omni AI assistant.
 *
 * - generateOmniResponse - A function that takes a user prompt and returns an AI-generated response.
 * - GenerateOmniResponseInput - The input type for the function.
 * - GenerateOmniResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateOmniResponseInputSchema = z.object({
  prompt: z.string().describe('The user\'s query or instruction.'),
});
export type GenerateOmniResponseInput = z.infer<typeof GenerateOmniResponseInputSchema>;

const GenerateOmniResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type GenerateOmniResponseOutput = z.infer<typeof GenerateOmniResponseOutputSchema>;

export async function generateOmniResponse(input: GenerateOmniResponseInput): Promise<GenerateOmniResponseOutput> {
  return generateOmniResponseFlow(input);
}

const omniPrompt = ai.definePrompt({
  name: 'omniPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: GenerateOmniResponseInputSchema },
  output: { schema: GenerateOmniResponseOutputSchema },
  prompt: `You are Omni AI, a helpful and versatile AI assistant. Your goal is to provide accurate, helpful, and concise responses to user queries on a wide range of topics.

User Prompt:
{{{prompt}}}

Your Response:
`,
});

const generateOmniResponseFlow = ai.defineFlow(
  {
    name: 'generateOmniResponseFlow',
    inputSchema: GenerateOmniResponseInputSchema,
    outputSchema: GenerateOmniResponseOutputSchema,
  },
  async (input) => {
    const { output } = await omniPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
