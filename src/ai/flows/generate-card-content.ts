'use server';
/**
 * @fileOverview AI flow to generate greeting card content (title, message, and theme) based on user description.
 *
 * - generateCardContent - Handles the AI generation logic.
 * - GenerateCardContentInput - Input schema.
 * - GenerateCardContentOutput - Output schema.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCardContentInputSchema = z.object({
  description: z.string().describe("User's description of the card they want to create (e.g., 'Birthday card for a teacher')."),
  language: z.enum(['en', 'ne']).optional().default('ne').describe("The preferred language for the content."),
});
export type GenerateCardContentInput = z.infer<typeof GenerateCardContentInputSchema>;

const GenerateCardContentOutputSchema = z.object({
  title: z.string().describe("A short, catchy title for the card (e.g., 'HAPPY BIRTHDAY')."),
  name: z.string().optional().describe("The name of the recipient if found in the description."),
  message: z.string().describe("A beautiful, heartfelt message for the card."),
  themeKey: z.string().describe("The key of the suggested theme from the platform's theme list (e.g., 'classicGold', 'oceanBreeze')."),
});
export type GenerateCardContentOutput = z.infer<typeof GenerateCardContentOutputSchema>;

export async function generateCardContent(input: GenerateCardContentInput): Promise<GenerateCardContentOutput> {
  return generateCardContentFlow(input);
}

const generateCardContentFlow = ai.defineFlow(
  {
    name: 'generateCardContentFlow',
    inputSchema: GenerateCardContentInputSchema,
    outputSchema: GenerateCardContentOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `You are a creative Greeting Card Assistant for 'OmniTools AI'. 
      Your job is to generate a title, message, and suggest a theme based on user prompts.
      
      THEME KEYS AVAILABLE:
      classicGold, sunnyDay, goldLeaf, desertSun, mangoTango, silverLining, steelGray, oceanBreeze, deepSpace, royalAzure, emeraldForest, springMeadow, rubyRed, cherryBlossom, loveLetter, amethystGem, lavenderField, nepalFlag, himalayanSunrise, lumbiniPeace, rhododendronBloom.

      INSTRUCTIONS:
      1. If the language is 'ne', write the message in beautiful Nepali.
      2. Keep the title short (2-4 words).
      3. Make the message heartfelt and relevant to the description.
      4. Pick the most suitable themeKey from the list above.
      5. If a name is mentioned in the prompt, extract it.`,
      prompt: input.description,
      output: { schema: GenerateCardContentOutputSchema }
    });

    if (!output) {
      throw new Error("AI failed to generate card content.");
    }

    return output;
  }
);
