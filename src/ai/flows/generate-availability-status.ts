'use server';

/**
 * @fileOverview A flow to generate a professional availability status for a CV.
 *
 * - generateAvailability - A function that generates an availability statement.
 * - GenerateAvailabilityInput - The input type for the function.
 * - GenerateAvailabilityOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExperienceSchema = z.object({
    title: z.string(),
    company: z.string(),
    country: z.string(),
    years: z.string(),
    duties: z.string(),
});

const GenerateAvailabilityInputSchema = z.object({
  currentJob: z.string().optional().describe("The user's current job title."),
  experience: z.array(ExperienceSchema).optional().describe("The user's work history."),
});
export type GenerateAvailabilityInput = z.infer<typeof GenerateAvailabilityInputSchema>;

const GenerateAvailabilityOutputSchema = z.object({
  availability: z.string().describe('A concise availability statement for a CV (e.g., "Immediately available", "Available with two weeks notice").'),
});
export type GenerateAvailabilityOutput = z.infer<typeof GenerateAvailabilityOutputSchema>;


export async function generateAvailability(input: GenerateAvailabilityInput): Promise<GenerateAvailabilityOutput> {
    return generateAvailabilityFlow(input);
}


const availabilityPrompt = ai.definePrompt({
    name: 'generateAvailabilityPrompt',
    input: { schema: GenerateAvailabilityInputSchema },
    output: { schema: GenerateAvailabilityOutputSchema },
    prompt: `You are an expert CV writer. Based on the user's current professional status, generate a concise and professional availability statement.

**User's Data:**
{{#if currentJob}}
- **Current Job:** {{{currentJob}}}
{{else}}
- **Current Job:** Not specified, likely unemployed or student.
{{/if}}
{{#if experience}}
- **Experience:** User has provided work history.
{{/if}}

**Your Task:**
- If the user seems to be currently employed (has a "current job" or recent experience), suggest availability like "Available upon providing a reasonable notice period (e.g., two weeks to one month)."
- If the user seems to be unemployed or a student, suggest "Immediately available for a new role."
- The output should be a short, professional phrase.

**Example Outputs:**
- "Immediately available."
- "Available with a two-week notice period."
- "Available for immediate joining."
- "Seeking new opportunities and can join promptly."
`,
});

const generateAvailabilityFlow = ai.defineFlow(
    {
        name: 'generateAvailabilityFlow',
        inputSchema: GenerateAvailabilityInputSchema,
        outputSchema: GenerateAvailabilityOutputSchema,
    },
    async (input) => {
        const { output } = await availabilityPrompt(input);
        if (!output) {
            throw new Error("AI failed to generate an availability status.");
        }
        return output;
    }
);
