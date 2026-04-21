'use server';

/**
 * @fileOverview A flow to generate a Europass CV summary.
 *
 * - generateEuropassCV - A function that generates a Europass CV summary.
 * - GenerateEuropassCVInput - The input type for the generateEuropassCV function.
 * - GenerateEuropassCVOutput - The return type for the generateEuropassCV function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkHistorySchema = z.object({
    jobTitle: z.string(),
    company: z.string(),
    dates: z.string(),
    duties: z.string(),
});

const EducationSchema = z.object({
    degree: z.string(),
    university: z.string(),
    year: z.string(),
});

const GenerateEuropassCVInputSchema = z.object({
  fullName: z.string().describe("The user's full name."),
  targetJobTitle: z.string().describe("The job title the user is targeting."),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string(),
    linkedin: z.string().optional(),
  }).describe("User's contact information."),
  summaryOfSelf: z.string().describe("A brief summary about the user. If the value is 'AI_GENERATE', the AI should write this section."),
  workHistory: z.array(WorkHistorySchema).describe("The user's work history."),
  education: z.array(EducationSchema).describe("The user's education history."),
  keySkills: z.array(z.string()).describe("A list of the user's key skills."),
  photoDataUri: z.string().optional().describe("A passport-sized photo of the user, as a data URI."),
});
export type GenerateEuropassCVInput = z.infer<typeof GenerateEuropassCVInputSchema>;

const GenerateEuropassCVOutputSchema = z.object({
  cvContent: z.string().describe('The content of the generated Europass CV, specifically the "About Me" summary.'),
  declaration: z.string().describe('A formal declaration statement for the CV, confirming the authenticity of the provided information.'),
});
export type GenerateEuropassCVOutput = z.infer<typeof GenerateEuropassCVOutputSchema>;

export async function generateEuropassCV(input: GenerateEuropassCVInput): Promise<GenerateEuropassCVOutput> {
  return generateEuropassCVFlow(input);
}

const generateEuropassCVPrompt = ai.definePrompt({
  name: 'generateEuropassCVPrompt',
  input: {schema: GenerateEuropassCVInputSchema},
  output: {schema: GenerateEuropassCVOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an expert CV writer specializing in creating compelling professional summaries for Europass CVs. Your task is to generate two distinct pieces of content: a professional "About Me" summary and a formal declaration.

1.  **Professional "About Me" Summary:**
    *   **Objective:** Based on the user's detailed profile, write a concise, impactful, and professional summary (3-4 sentences).
    *   **CRITICAL INSTRUCTION:** If the 'summaryOfSelf' field is set to 'AI_GENERATE', you MUST write a personalized summary. Use the provided Work History, Education, and Key Skills to make the summary relevant and personalized, highlighting the applicant's most significant achievements and career goals, directly connecting them to the **{{{targetJobTitle}}}**. If 'summaryOfSelf' contains user-provided text, use that text directly as the 'cvContent' output.
    *   **Tone:** Professional, confident, and achievement-oriented.
    *   **Output:** Return the generated or provided summary in the 'cvContent' field.

2.  **Formal Declaration:**
    *   **Objective:** Generate a standard, formal declaration statement.
    *   **Content:** The declaration must state that the information provided in the CV is true, complete, and correct to the best of the applicant's knowledge.
    *   **Output:** Return the generated declaration in the 'declaration' field.

**APPLICANT'S DATA:**
*   **Full Name:** {{{fullName}}}
*   **Target Job Title:** {{{targetJobTitle}}}
*   **Summary Input:** {{{summaryOfSelf}}}

{{#if workHistory}}
**Work History:**
{{#each workHistory}}
- **Title:** {{this.jobTitle}} at {{this.company}} ({{this.dates}})
  **Duties:** {{this.duties}}
{{/each}}
{{/if}}

{{#if education}}
**Education:**
{{#each education}}
- **Degree:** {{this.degree}} from {{this.university}} ({{this.year}})
{{/each}}
{{/if}}

{{#if keySkills}}
**Key Skills:**
{{#each keySkills}}
- {{this}}
{{/each}}
{{/if}}

Based on all the information above, generate the 'cvContent' and 'declaration'.`,
});


const generateEuropassCVFlow = ai.defineFlow(
  {
    name: 'generateEuropassCVFlow',
    inputSchema: GenerateEuropassCVInputSchema,
    outputSchema: GenerateEuropassCVOutputSchema,
  },
  async input => {
    const {output} = await generateEuropassCVPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate CV content.");
    }
    return output;
  }
);
