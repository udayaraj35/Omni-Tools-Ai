
'use server';

/**
 * @fileOverview A flow to translate text into a specified language.
 *
 * - translateText - A function that handles the text translation.
 * - TranslateTextInput - The input type for the function.
 * - TranslateTextOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This is now defined in the client component, but kept here for flow validation
const languageCodes = {
  'Arabic': 'ar',
  'Chinese (Simplified)': 'zh-CN',
  'Chinese (Traditional)': 'zh-TW',
  'Danish': 'da',
  'Dutch': 'nl',
  'English': 'en',
  'Finnish': 'fi',
  'French': 'fr',
  'German': 'de',
  'Greek': 'el',
  'Hindi': 'hi',
  'Hungarian': 'hu',
  'Indonesian': 'id',
  'Italian': 'it',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Nepali': 'ne',
  'Norwegian': 'no',
  'Polish': 'pl',
  'Portuguese': 'pt',
  'Romanian': 'ro',
  'Russian': 'ru',
  'Spanish': 'es',
  'Swedish': 'sv',
  'Thai': 'th',
  'Turkish': 'tr',
  'Vietnamese': 'vi',
};


const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.enum(Object.values(languageCodes) as [string, ...string[]]).describe('The language code to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}


const translateTextPrompt = ai.definePrompt({
    name: 'translateTextPrompt',
    model: 'googleai/gemini-pro',
    input: { schema: TranslateTextInputSchema },
    output: { schema: TranslateTextOutputSchema },
    prompt: `You are an expert translator specializing in the transliteration of names and the professional translation of text.
Your primary task is to translate the given text into the target language specified by the language code.

**Crucial Rule for Names and Proper Nouns:**
If the input text appears to be a proper name (e.g., a person's name like "Udaya Raj Khanal", a company name, or a specific place name), you MUST transliterate it phonetically into the script of the target language. Do NOT translate the meaning of the name.
- Example 1: If the input is "Udaya Raj Khanal" and the target language is Nepali (ne), the output MUST be "उदय राज खनाल".
- Example 2: If the input is "John Smith" and the target language is Hindi (hi), the output should be "जॉन स्मिथ".

**Rule for General Text:**
For all other text that is not a proper noun, provide a professional, accurate, and contextually appropriate translation.

**Input Text to Translate:**
"{{{text}}}"

**Target Language Code:** "{{targetLanguage}}"

**Output Instruction:**
Provide ONLY the translated or transliterated text as your response. Do not include any extra commentary, formatting, or explanations.`,
});

const translateTextFlow = ai.defineFlow(
    {
        name: 'translateTextFlow',
        inputSchema: TranslateTextInputSchema,
        outputSchema: TranslateTextOutputSchema,
    },
    async (input) => {
        const { output } = await translateTextPrompt(input);
        if (!output) {
            throw new Error("AI failed to translate the text.");
        }
        return output;
    }
);
