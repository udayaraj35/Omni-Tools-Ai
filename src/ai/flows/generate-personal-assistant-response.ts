'use server';

/**
 * @fileOverview A personalized AI flow for the Personal AI assistant.
 *
 * - generatePersonalAssistantResponse - A function that takes a user prompt and returns an AI-generated response.
 * - GeneratePersonalAssistantResponseInput - The input type for the function.
 * - GeneratePersonalAssistantResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePersonalAssistantResponseInputSchema = z.object({
  prompt: z.string().describe('The user\'s query or instruction.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation history.'),
});
export type GeneratePersonalAssistantResponseInput = z.infer<typeof GeneratePersonalAssistantResponseInputSchema>;

const GeneratePersonalAssistantResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});
export type GeneratePersonalAssistantResponseOutput = z.infer<typeof GeneratePersonalAssistantResponseOutputSchema>;

export async function generatePersonalAssistantResponse(input: GeneratePersonalAssistantResponseInput): Promise<GeneratePersonalAssistantResponseOutput> {
  return generatePersonalAssistantResponseFlow(input);
}

const generatePersonalAssistantResponseFlow = ai.defineFlow(
  {
    name: 'generatePersonalAssistantResponseFlow',
    inputSchema: GeneratePersonalAssistantResponseInputSchema,
    outputSchema: GeneratePersonalAssistantResponseOutputSchema,
  },
  async (input) => {
    
    const history = (input.chatHistory || []).map(msg => ({
        role: msg.role,
        content: [{text: msg.content}]
    }));

    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: "You are a helpful and friendly personal AI assistant. Your name is Omni. Be conversational and provide detailed, supportive answers.",
        history,
        prompt: input.prompt,
    });

    const responseText = output?.text;

    if (!responseText) {
      throw new Error("AI failed to generate a response.");
    }
    
    return { response: responseText };
  }
);
