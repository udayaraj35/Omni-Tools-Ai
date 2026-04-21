'use server';

/**
 * @fileOverview A flow to extract structured information from document text or images.
 * Updated to handle the detailed language grid for CV Builders.
 *
 * - extractInfoFromDocument - A function that parses content and returns structured data.
 * - ExtractInfoInput - The input type for the function.
 * - ExtractInfoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractInfoInputSchema = z.object({
  documentText: z.string().optional().describe('The text content extracted from a user\'s document (e.g., passport, ID card, CV).'),
  documentImageDataUri: z.string().optional().describe("An image of a user's document as a data URI."),
}).refine(data => data.documentText || data.documentImageDataUri, {
    message: "Either documentText or documentImageDataUri must be provided.",
});


export type ExtractInfoInput = z.infer<typeof ExtractInfoInputSchema>;

const educationSchema = z.object({
    school: z.string().describe("The name of the school or college."),
    address: z.string().describe("The address of the school/college."),
    level: z.string().describe("The level or qualification obtained (e.g., SEE, +2, Bachelor)."),
    field: z.string().describe("The field of study."),
    year: z.string().describe("The passing year."),
});

const experienceSchema = z.object({
    title: z.string().describe("The user's job title."),
    company: z.string().describe("The company name."),
    country: z.string().describe("The country where the work was performed."),
    years: z.string().describe("The duration of the employment (e.g., '2023-2025')."),
    duties: z.string().describe("A brief description of the key responsibilities."),
});

const languageGridSchema = z.object({
    language: z.string().describe("The name of the language (e.g. 'English', 'Nepali')."),
    listening: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2').describe("CEFR Level for Listening."),
    reading: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2').describe("CEFR Level for Reading."),
    writing: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2').describe("CEFR Level for Writing."),
    spokenInteraction: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2').describe("CEFR Level for Spoken Interaction."),
    spokenProduction: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B2').describe("CEFR Level for Spoken Production."),
});


// This schema corresponds to the Normal CV Builder
const NormalCVExtractInfoOutputSchema = z.object({
    fullName: z.string().optional().describe("The applicant's full name."),
    phone: z.string().optional().describe("The applicant's contact phone number."),
    email: z.string().email().optional().describe("The applicant's email address."),
    permanentCountry: z.string().optional().describe("The applicant's permanent home country."),
    permanentAddress: z.string().optional().describe("The applicant's permanent full address (City, State, Street)."),
    currentCountry: z.string().optional().describe("The country where the applicant currently resides."),
    currentAddress: z.string().optional().describe("The applicant's current full address (City, Area, Street)."),
    education: z.array(educationSchema).optional().describe("The user's education history."),
    experience: z.array(experienceSchema).optional().describe("The user's work experience."),
    skills: z.array(z.string()).optional().describe("A list of the user's technical and soft skills."),
    motherLanguage: z.string().optional().describe("The user's native tongue."),
    languages: z.array(languageGridSchema).optional().describe("Structured language proficiency data."),
    availability: z.string().optional().describe("The user's availability status."),
    professionalSummary: z.string().optional().describe("A professional summary or objective statement from the CV."),
});

// This schema should correspond to the fields in the VisaBuilder form
const VisaExtractInfoOutputSchema = z.object({
    passport: z.string().optional().describe("The applicant's passport number."),
    nationality: z.string().optional().describe("The applicant's nationality."),
    dob: z.string().optional().describe("The applicant's date of birth in YYYY-MM-DD format."),
    idNumber: z.string().optional().describe("The applicant's national ID or residence ID number."),
    residenceIssueDate: z.string().optional().describe("The issue date of the residence ID in YYYY-MM-DD format."),
    residenceExpiryDate: z.string().optional().describe("The expiry date of the residence ID in YYYY-MM-DD format."),
});

const CombinedExtractInfoOutputSchema = NormalCVExtractInfoOutputSchema.merge(VisaExtractInfoOutputSchema);

export type ExtractInfoOutput = z.infer<typeof CombinedExtractInfoOutputSchema>;


export async function extractInfoFromDocument(input: ExtractInfoInput): Promise<ExtractInfoOutput> {
  return extractInfoFlow(input);
}


const extractInfoPrompt = ai.definePrompt({
    name: 'extractInfoPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: ExtractInfoInputSchema },
    output: { schema: CombinedExtractInfoOutputSchema },
    prompt: `You are an expert data extraction agent. Analyze the following content from a user's document (like a passport, national ID, or a pasted CV) and pull out the relevant information. 

CRITICAL INSTRUCTIONS FOR LANGUAGES:
- If you find any mention of languages (e.g. "I speak English, Nepali and Hindi"), extract them into the 'languages' array.
- If the document doesn't specify levels (A1-C2), use 'B2' as a default for foreign languages and 'C2' for the mother tongue.
- Identify the 'motherLanguage' clearly.

CRITICAL INSTRUCTIONS FOR SKILLS:
- Extract specific technical skills (e.g. "AutoCAD", "Excel", "Driving") into the 'skills' array.

Format the output as a JSON object matching the defined schema. If a piece of information is not found, omit the key. Pay close attention to date formats and ensure they are YYYY-MM-DD where applicable.

{{#if documentText}}
Document Text:
{{{documentText}}}
{{/if}}
{{#if documentImageDataUri}}
Document Image:
{{media url=documentImageDataUri}}
{{/if}}
`,
});

const extractInfoFlow = ai.defineFlow(
    {
        name: 'extractInfoFlow',
        inputSchema: ExtractInfoInputSchema,
        outputSchema: CombinedExtractInfoOutputSchema,
    },
    async (input) => {
        const { output } = await extractInfoPrompt(input);
        if (!output) {
            throw new Error("AI failed to extract information from the document.");
        }
        return output;
    }
);
