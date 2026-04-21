'use server';
/**
 * @fileOverview AI flow to suggest missing profile data based on existing information.
 * 
 * - smartFillProfile - Predicts languages, skills, and summary based on partial data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartFillInputSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nationality: z.string().optional(),
  currentJob: z.string().optional(),
  experience: z.array(z.any()).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.any()).optional(),
});

const LanguageSchema = z.object({
    language: z.string(),
    listening: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2'),
    reading: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2'),
    writing: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2'),
    spokenInteraction: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2'),
    spokenProduction: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2'),
});

const SmartFillOutputSchema = z.object({
  suggestedMotherLanguage: z.string().optional(),
  suggestedLanguages: z.array(LanguageSchema).optional(),
  suggestedSkills: z.array(z.string()).optional(),
  suggestedSummary: z.string().optional(),
});

export type SmartFillOutput = z.infer<typeof SmartFillOutputSchema>;

export async function smartFillProfile(input: z.infer<typeof SmartFillInputSchema>): Promise<SmartFillOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    system: `You are a Smart Profile Assistant for OmniTools AI. 
    Your task is to analyze a user's partial profile and suggest highly relevant completions.
    
    GUIDELINES:
    1. LANGUAGES: If nationality is 'Nepalese', suggest 'Nepali' as mother tongue and 'English' or 'Hindi' as secondary languages with B2/C1 levels.
    2. SKILLS: Based on 'currentJob' and 'experience', suggest 5-8 professional skills.
    3. SUMMARY: If missing, write a 2-sentence professional intro.
    4. Format the output as JSON.`,
    prompt: `Complete this profile: ${JSON.stringify(input)}`,
    output: { schema: SmartFillOutputSchema }
  });

  if (!output) throw new Error("AI failed to generate suggestions.");
  return output;
}
