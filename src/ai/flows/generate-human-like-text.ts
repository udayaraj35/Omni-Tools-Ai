'use server';
/**
 * @fileOverview An AI flow for detecting AI-written content and humanizing it.
 *
 * - analyzeAiContent - A function that analyzes text and provides an AI-generated score.
 * - humanizeText - A function that rewrites text to sound more human.
 * - HumanizerInput - The input type for both functions.
 * - AnalysisOutput - The return type for the analysis function.
 * - HumanizerOutput - The return type for the humanization function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const HumanizerInputSchema = z.object({
  text: z.string().describe("The text content to be analyzed or humanized."),
});
export type HumanizerInput = z.infer<typeof HumanizerInputSchema>;

const AnalysisOutputSchema = z.object({
  aiScore: z.number().min(0).max(100).describe('A score from 0 to 100 indicating the likelihood of the text being AI-generated.'),
  explanation: z.string().describe('A brief explanation of the score, e.g., "Highly AI generated" or "Likely human-written".'),
});
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

const HumanizerOutputSchema = z.object({
  humanizedText: z.string().describe('The rewritten text, designed to be undetectable by AI detectors.'),
});
export type HumanizerOutput = z.infer<typeof HumanizerOutputSchema>;

const analyzePrompt = ai.definePrompt({
    name: 'analyzeAiContentPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: HumanizerInputSchema },
    output: { schema: AnalysisOutputSchema },
    prompt: `You are an AI detection expert. Analyze the following text and determine the probability that it was written by an AI.
    
    Provide a score from 0 (definitely human) to 100 (definitely AI).
    Also, provide a short, one-sentence explanation for your score. For example: "Highly likely to be AI-generated due to its formal tone and complex sentence structures." or "Appears to be human-written with natural language flow."

    Text to analyze:
    "{{{text}}}"`,
});

export async function analyzeAiContent(input: HumanizerInput): Promise<AnalysisOutput> {
    const { output } = await analyzePrompt(input);
    if (!output) {
        throw new Error("AI failed to analyze the content.");
    }
    return output;
}

const humanizePrompt = ai.definePrompt({
    name: 'humanizeTextPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: HumanizerInputSchema },
    output: { schema: HumanizerOutputSchema },
    prompt: `Rewrite the following text to make it sound 100% human-written and undetectable by AI detectors.
    
    Key instructions:
    - Keep the exact original meaning.
    - Vary sentence length and structure.
    - Use simpler, more natural language where appropriate.
    - Add a subtle personal touch or tone if possible, without adding new information.
    - Avoid overly complex vocabulary and formal sentence structures typical of AI.
    
    Original Text:
    "{{{text}}}"`,
});

export async function humanizeText(input: HumanizerInput): Promise<HumanizerOutput> {
    const { output } = await humanizePrompt(input);
    if (!output) {
        throw new Error("AI failed to humanize the text.");
    }
    return output;
}
