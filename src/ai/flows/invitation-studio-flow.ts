'use server';
/**
 * @fileOverview AI flow for the Smart Invitation Studio.
 * 
 * - generateStudioSuggestions - Recommends themes, fonts, and refines message based on cultural context.
 * - editInvitationWithChat - Handles conversational instructions to modify the canvas/form.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FamilyMemberSchema = z.object({
    name: z.string(),
    relation: z.string(),
});

const StudioInputSchema = z.object({
  eventType: z.string().describe("The type of event (wedding, bratabandha, nuworan, mehendi, reception, etc.)"),
  groomName: z.string().optional(),
  brideName: z.string().optional(),
  boyName: z.string().optional(),
  babyName: z.string().optional(),
  parents: z.array(FamilyMemberSchema).optional(),
  extendedFamily: z.array(FamilyMemberSchema).optional(),
  language: z.string().describe("The preferred language code (ne, en, bilingual)"),
  currentMessage: z.string().optional().describe("The current invitation text if any"),
});
export type StudioInput = z.infer<typeof StudioInputSchema>;

const StudioOutputSchema = z.object({
  suggestedTheme: z.string().describe("The ID of the best matching theme from the studio list"),
  suggestedFont: z.string().describe("The best matching font name from the available options"),
  refinedMessage: z.string().describe("A beautiful, long, and culturally appropriate invitation message"),
  shloka: z.string().describe("A relevant Sanskrit shloka or blessing line"),
  recommendedSymbol: z.string().optional().describe("The ID of a recommended symbol/buta from the list"),
});
export type StudioOutput = z.infer<typeof StudioOutputSchema>;

export async function generateStudioSuggestions(input: StudioInput): Promise<StudioOutput> {
  return generateStudioSuggestionsFlow(input);
}

const studioPrompt = ai.definePrompt({
    name: 'studioPrompt',
    model: 'googleai/gemini-1.5-flash',
    input: { schema: StudioInputSchema },
    output: { schema: StudioOutputSchema },
    prompt: `You are a world-class Nepali and Indian Cultural Invitation Designer. 
    Your task is to transform a simple invitation into a royal, high-end masterpiece.
    
    CONTEXT:
    - Event: {{eventType}}
    - Main Subjects: {{#if groomName}}{{groomName}} & {{brideName}}{{else}}{{#if babyName}}{{babyName}}{{else}}{{boyName}}{{/if}}{{/if}}
    - Preferred Language: {{language}}
    
    INSTRUCTIONS FOR DESIGN:
    1. THEME: Choose a 'suggestedTheme' ONLY from: dhaka-pattern, newari-heritage, vintage-lokta, mithila-vibrant, temple-gold, marwari-heavy, jaipur-silk, mughal-emerald, ivory-pearl, luxury-midnight, janai-saffron, baby-nursery.
    2. FONT: Choose 'suggestedFont' from: Poppins, Cinzel, Great Vibes, Pinyon Script, Dancing Script, Noto Sans Devanagari.
    3. MESSAGE: Write a sophisticated, emotional, and formal invitation message. If language is 'ne', use high-level Nepali (shuddha Nepali).
    4. SHLOKA: Provide a powerful Sanskrit shloka that blesses the specific event.
    5. SYMBOL: Recommend one 'recommendedSymbol' ID: 'ganesh-gold', 'kalash-holy', 'doli-wedding', 'swastik-gold', 'om-divine', 'royal-elephant'.
    
    Return the response in valid JSON format matching the output schema.`,
});

const generateStudioSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateStudioSuggestionsFlow',
    inputSchema: StudioInputSchema,
    outputSchema: StudioOutputSchema,
  },
  async (input) => {
    const { output } = await studioPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate invitation suggestions.");
    }
    return output;
  }
);

// --- New Chat Edit Flow ---

const ChatEditInputSchema = z.object({
    instruction: z.string().describe("User's natural language instruction (e.g., 'Make it gold', 'Add a heart symbol')"),
    currentState: z.any().describe("The current state of the invitation card elements and form values"),
});

const ChatEditOutputSchema = z.object({
    updatedFormValues: z.any().optional().describe("Modified form fields if instruction refers to text/data"),
    updatedCanvasElements: z.array(z.any()).optional().describe("Modified or new canvas elements"),
    aiResponse: z.string().describe("Friendly confirmation of what was changed"),
    suggestedThemeId: z.string().optional().describe("New theme ID if user wants to change style"),
});

export async function editInvitationWithAi(input: z.infer<typeof ChatEditInputSchema>) {
    return chatEditFlow(input);
}

const chatEditFlow = ai.defineFlow(
    {
        name: 'chatEditFlow',
        inputSchema: ChatEditInputSchema,
        outputSchema: ChatEditOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            system: `You are an AI Design Assistant for 'Invitation Studio Pro'. 
            Your goal is to modify the invitation card state based on user instructions.
            
            YOU CAN:
            1. Update text content (names, dates, messages).
            2. Add/Remove/Move symbols or text layers.
            3. Change themes (ID: dhaka-pattern, newari-heritage, vintage-lokta, mithila-vibrant, temple-gold, marwari-heavy, jaipur-silk, mughal-emerald, ivory-pearl, luxury-midnight, janai-saffron, baby-nursery).
            4. Toggle 'isGold' for text elements.
            
            AVAILABLE SYMBOLS: 'ganesh-gold', 'kalash-holy', 'doli-wedding', 'swastik-gold', 'om-divine', 'royal-elephant'.
            
            CURRENT STATE: ${JSON.stringify(input.currentState)}
            
            Return a JSON object with only the fields that need updating. Always provide 'aiResponse' in the language used by the user.`,
            prompt: input.instruction,
            output: { schema: ChatEditOutputSchema }
        });

        if (!output) throw new Error("AI failed to process chat instruction.");
        return output;
    }
);
