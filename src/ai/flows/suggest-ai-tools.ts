'use server';

/**
 * @fileOverview Provides AI-powered suggestions for AI tools based on user input.
 *
 * - suggestAiTools - A function that suggests AI tools based on user input.
 * - SuggestAiToolsInput - The input type for the suggestAiTools function.
 * - SuggestAiToolsOutput - The return type for the suggestAiTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAiToolsInputSchema = z.object({
  userInput: z.string().describe('The user input to generate AI tool suggestions for.'),
});
export type SuggestAiToolsInput = z.infer<typeof SuggestAiToolsInputSchema>;

const SuggestAiToolsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of AI tool suggestions.'),
});
export type SuggestAiToolsOutput = z.infer<typeof SuggestAiToolsOutputSchema>;

export async function suggestAiTools(input: SuggestAiToolsInput): Promise<SuggestAiToolsOutput> {
  return suggestAiToolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAiToolsPrompt',
  input: {schema: SuggestAiToolsInputSchema},
  output: {schema: SuggestAiToolsOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant AI tools based on user input. Here are some of the key capabilities of OmniTools AI:

  - AI-Powered CV Creation
  - 8K Photo Upscaling
  - Video Creation Tools
  - PDF Tools
  - AI Writing
  - Background Remover
  - 100+ other AI tools

  Given the user input: {{{userInput}}}, suggest a list of AI tools that the user might find helpful. Provide the output as a JSON array of strings.
  Example: ['Resume Builder', 'AI Photo Enhancer', 'Video Generator']`,
});

const suggestAiToolsFlow = ai.defineFlow(
  {
    name: 'suggestAiToolsFlow',
    inputSchema: SuggestAiToolsInputSchema,
    outputSchema: SuggestAiToolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
