'use server';

/**
 * @fileOverview An AI flow for the Omni AI Code Assistant.
 *
 * - generateCodeResponse - A function that takes a user prompt and returns an AI-generated response, specialized for coding questions.
 * - GenerateCodeResponseInput - The input type for the function.
 * - GenerateCodeResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCodeResponseInputSchema = z.object({
  prompt: z.string().describe("The user's query or instruction, typically related to coding, algorithms, or software development."),
  language: z.enum(['en', 'ne']).optional().describe("The user's preferred language."),
});
export type GenerateCodeResponseInput = z.infer<typeof GenerateCodeResponseInputSchema>;

const GenerateCodeResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response, which may include code snippets, explanations, or examples.'),
});
export type GenerateCodeResponseOutput = z.infer<typeof GenerateCodeResponseOutputSchema>;

export async function generateCodeResponse(input: GenerateCodeResponseInput): Promise<GenerateCodeResponseOutput> {
  return generateCodeResponseFlow(input);
}

const generateCodeResponseFlow = ai.defineFlow(
  {
    name: 'generateCodeResponseFlow',
    inputSchema: GenerateCodeResponseInputSchema,
    outputSchema: GenerateCodeResponseOutputSchema,
  },
  async (input) => {
    let systemPrompt: string;
    
    // Use the explicitly provided language, or fallback to auto-detection
    const language = input.language || ( /[\u0900-\u097F]/.test(input.prompt) ? 'ne' : 'en');
    
    if (language === 'ne') {
        systemPrompt = "तपाईं Omni AI, एक शक्तिशाली AI कोड सहायक हुनुहुन्छ। नेपाली र अंग्रेजी दुवैमा स्पष्ट, उपयोगी जवाफ दिनुहोस्।";
    } else {
        systemPrompt = "You are Omni AI, a powerful AI Code Assistant.";
    }

    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: systemPrompt,
        prompt: input.prompt,
        config: {
            temperature: 0.5,
        },
    });

    const responseText = output?.text;

    if (!responseText) {
      throw new Error("AI failed to generate a response.");
    }
    
    return { response: responseText };
  }
);
