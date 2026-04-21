
'use server';

/**
 * @fileOverview A flow to generate a highly formal, legally compliant Cover Letter for a National Employment Visa application.
 *
 * - generateVisaCoverLetter - A function that handles the visa cover letter generation.
 * - GenerateVisaCoverLetterInput - The input type for the generateVisaCoverLetter function.
 * - GenerateVisaCoverLetterOutput - The return type for the generateVisaCoverLetter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateVisaCoverLetterInputSchema = z.object({
    consulate: z.string().describe("The recipient consulate or embassy, e.g., 'Consulate Section' or 'Embassy of Romania, Abu Dhabi'."),
    embassyCity: z.string().describe("The city of the embassy, e.g., 'Riyadh'."),
    embassyCountry: z.string().describe("The country of the embassy, e.g., 'Kingdom of Saudi Arabia'."),
    currentResidenceCity: z.string().describe("The city where the applicant currently resides."),
    currentResidenceCountry: z.string().describe("The country where the applicant currently resides."),
    currentStreetAddress: z.string().optional().describe("The applicant's current street address."),
    permanentCountry: z.string().optional().describe("The applicant's permanent country."),
    permanentCity: z.string().optional().describe("The applicant's permanent city."),
    permanentStreetAddress: z.string().optional().describe("The applicant's permanent street address."),
    
    visaCategory: z.string().describe("The specific visa category, e.g., 'National Employment Visa (D/AM)'."),
    fullName: z.string().describe("The applicant's full name."),
    passport: z.string().describe("The applicant's passport number."),
    nationality: z.string().describe("The applicant's nationality, e.g., 'Nepalese'."),
    permitType: z.string().describe("The type of permit or contract, e.g., 'Work Permit' or 'Employment Contract'.").default('Work Permit'),
    workPermit: z.string().describe("The official work permit or contract number."),
    dob: z.string().describe("The applicant's date of birth in YYYY-MM-DD format."),
    
    fullAddress: z.string().describe("The applicant's chosen residential address for the letter closing (current or permanent)."),
    
    phone: z.string().describe("The applicant's contact phone number."),
    email: z.string().email().describe("The applicant's email address."),
    
    employerName: z.string().describe("The full legal name of the hiring company."),
    employerFullAddress: z.string().describe("The full address of the employer, e.g., '123 Business St, Valletta'."),
    employerCountry: z.string().describe("The country of the employer, e.g., 'Malta'."),
    jobPosition: z.string().describe("The specific job title offered, e.g., 'Bucătar - Cook'."),
    
    insuranceProvider: z.string().optional().describe("The name of the travel medical insurance provider."),
    insuranceCoverage: z.string().optional().describe("The total coverage amount of the insurance, including currency, e.g., 'USD 50,000'."),
    insuranceDates: z.string().optional().describe("The validity period of the insurance, e.g., '2024-08-01 to 2025-07-31'."),
    
    currentJob: z.string().describe("Applicant's current job position and company."),
    visaStatus: z.string().describe("Applicant's current residence visa status."),
    
    idNumber: z.string().optional().describe("The applicant's official ID number for their current residence status. This is optional."),
    residenceIssueDate: z.string().optional().describe("The issue date of the residence ID. Optional."),
    residenceExpiryDate: z.string().optional().describe("The expiry date of the residence ID. Optional."),
    
    incomeDetails: z.string().describe("Details about the applicant's current salary or income."),
});

export type GenerateVisaCoverLetterInput = z.infer<typeof GenerateVisaCoverLetterInputSchema>;

const GenerateVisaCoverLetterOutputSchema = z.object({
  coverLetterText: z.string().describe('The full, formally generated text of the cover letter, excluding document lists.'),
});
export type GenerateVisaCoverLetterOutput = z.infer<typeof GenerateVisaCoverLetterOutputSchema>;

export async function generateVisaCoverLetter(input: GenerateVisaCoverLetterInput): Promise<GenerateVisaCoverLetterOutput> {
  return generateVisaCoverLetterFlow(input);
}

const visaCoverLetterPrompt = ai.definePrompt({
  name: 'generateVisaCoverLetterPrompt',
  input: { schema: GenerateVisaCoverLetterInputSchema },
  output: { schema: GenerateVisaCoverLetterOutputSchema },
  prompt: `You are an expert Visa and Immigration Documentation Specialist. Your task is to generate a highly formal, precise, and legally compliant Cover Letter for a National Employment Visa application, strictly following the provided format and data.

**OBJECTIVES & TONE:**
- **Primary Objective:** Formally request the issuance of the specified visa category for employment.
- **Tone:** Highly respectful, formal, direct, and authoritative.

**INSTRUCTIONS:**
- Combine the 'embassyCity' and 'embassyCountry' fields to form the full embassy location.
- The 'employerFullAddress' already contains the city, so just use it as is, but ensure the 'employerCountry' is mentioned as the country of employment.
- If the 'idNumber', 'residenceIssueDate', or 'residenceExpiryDate' are provided, include a sentence describing the current residence status with these details. If they are not provided, omit this sentence.

**MANDATORY STRUCTURE & DATA INTEGRATION (Use double newlines between each section):**

To:
**{{{consulate}}}**
**{{{embassyCity}}}, {{{embassyCountry}}}**

**Subject: Request for Granting {{{visaCategory}}} Visa**

Dear Sir/Madam,

I am writing to formally submit my application for a **{{{visaCategory}}}** to work in **{{{employerCountry}}}**. I am **{{{fullName}}}**, a citizen of **{{{nationality}}}**, holding Passport No. **{{{passport}}}**.

I have been officially granted a {{{permitType}}} (No. {{{workPermit}}}) for permanent employment with **{{{employerName}}}**, a company located at **{{{employerFullAddress}}}, {{{employerCountry}}}**.

My offered position is **{{{jobPosition}}}**. The contract guarantees accommodation, meals, medical insurance, and social insurance, fully covered by the employer.

I am currently residing in {{{currentResidenceCity}}}, {{{currentResidenceCountry}}} under a valid **{{{visaStatus}}}**.{{#if idNumber}} My ID Number is **{{{idNumber}}}**{{/if}}{{#if residenceIssueDate}}, issued on {{{residenceIssueDate}}}{{/if}}{{#if residenceExpiryDate}} and valid until {{{residenceExpiryDate}}}{{/if}}. I am employed as a **{{{currentJob}}}**.{{#if insuranceProvider}} I have also secured a travel medical insurance policy from **{{{insuranceProvider}}}**, valid from **{{{insuranceDates}}}**, with a coverage of **{{{insuranceCoverage}}}.{{/if}} My {{{incomeDetails}}}.

I am enthusiastic about the opportunity to contribute to the workforce in the destination country and am committed to complying with all legal and professional standards required. I respectfully request your favorable consideration of my visa application. Thank you for your time and attention. I remain at your disposal should you require any additional information.

Yours faithfully,

**{{{fullName}}}**
Date of Birth: {{{dob}}}
Passport No.: {{{passport}}}
Address: {{{fullAddress}}}
Phone: {{{phone}}}
Email: {{{email}}}

**FORMATTING RULES:**
- Generate **ONLY** the formal text of the cover letter as specified.
- Do **NOT** include any list of attached documents.
- Use double newlines between paragraphs and major sections (like after the recipient block and before the subject).
- Replace all placeholders like \\\`{{{fullName}}}\\\` with the actual data provided.`,
});

const generateVisaCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateVisaCoverLetterFlow',
    inputSchema: GenerateVisaCoverLetterInputSchema,
    outputSchema: GenerateVisaCoverLetterOutputSchema,
  },
  async (input) => {
    const { output } = await visaCoverLetterPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);
