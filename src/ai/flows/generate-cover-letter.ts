'use server';

/**
 * @fileOverview A flow to generate a cover letter based on user input and career goals.
 *
 * - generateCoverLetter - A function that generates a cover letter.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  cvContent: z.string().describe('The content of the user\'s CV.'),
  jobDescription: z.string().describe('The job description the user is applying for.'),
  companyName: z.string().describe('The name of the company.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetterContent: z.string().describe('The content of the generated cover letter.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const generateCoverLetterPrompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert career advisor. Create a professional and compelling cover letter for a job application. The cover letter should be tailored to the provided job description and highlight the most relevant skills and experiences from the user's CV.

User's CV:
{{{cvContent}}}

Job Description for role at {{{companyName}}}:
{{{jobDescription}}}

Generate a cover letter that is persuasive, professional, and tailored to the specific role and company.`,
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await generateCoverLetterPrompt(input);
    return output!;
  }
);
