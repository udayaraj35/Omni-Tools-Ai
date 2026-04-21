'use server';
/**
 * @fileOverview AI flow for the QR Studio Pro.
 * 
 * - editQrWithAi - Handles natural language instructions to modify QR code design.
 * Uses Gemini 1.5 Flash for high-speed structured design suggestions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QrStudioInputSchema = z.object({
    instruction: z.string().describe("User's instruction (e.g., 'Make it look like a flower', 'Use gold and red colors', 'Iron Man style')"),
    currentState: z.object({
        pattern: z.string(),
        fgColor: z.string(),
        bgColor: z.string(),
        logoSize: z.number(),
        enableBranding: z.boolean(),
    }),
});

const QrStudioOutputSchema = z.object({
    updatedSettings: z.object({
        pattern: z.string().optional().describe("The ID of the suggested pattern: square, dots, rounded, matrix, arc-reactor, spider-man, galaxy, mandala, lotus, rhododendron, blossom"),
        fgColor: z.string().optional().describe("Hex color for the pattern"),
        bgColor: z.string().optional().describe("Hex color for the background"),
        logoSize: z.number().optional().describe("Size of the center logo (10-30)"),
        enableBranding: z.boolean().optional().describe("Whether to enable branding footer"),
    }),
    aiResponse: z.string().describe("Friendly confirmation of the design changes in the user's language"),
});

export async function editQrWithAi(input: z.infer<typeof QrStudioInputSchema>) {
    return qrStudioFlow(input);
}

const qrStudioFlow = ai.defineFlow(
    {
        name: 'qrStudioFlow',
        inputSchema: QrStudioInputSchema,
        outputSchema: QrStudioOutputSchema,
    },
    async (input) => {
        const { output } = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            system: `You are a World-Class AI QR Code Designer for 'QR Studio Pro'. 
            Your goal is to transform the QR code's visual style based on user requests while ensuring it remains scannable and professional.
            
            AVAILABLE PATTERNS (ONLY USE THESE IDs): 
            - 'square': Standard corporate look.
            - 'dots': Modern digital dots.
            - 'rounded': Soft modern rounded modules.
            - 'matrix': Vertical digital rain look.
            - 'arc-reactor': Iron Man themed glowing rings.
            - 'spider-man': Spider-Man web pattern.
            - 'galaxy': Deep space cosmic pattern.
            - 'mandala': Sacred spiritual circular pattern.
            - 'lotus': Beautiful floral lotus pattern (Kamal ko buta).
            - 'rhododendron': Traditional Nepali Rhododendron (Laligurans) pattern.
            - 'blossom': Modern cherry blossom floral style.
            
            DESIGN LOGIC:
            1. If the user asks for flowers or "Full", use 'lotus', 'rhododendron', or 'blossom'.
            2. For "Laligurans" or "Nepal Style", use 'rhododendron' with Red (#DC143C) and White (#FFFFFF) colors.
            3. For "Superhero" or "Iron Man", use 'arc-reactor' with Cyan (#00E5FF) or Gold (#FFD700) colors.
            4. For "Spider-Man", use 'spider-man' with Red and Blue colors.
            5. For "Premium" or "Gold", use '#D4AF37' or '#FFD700' as fgColor and a dark background.
            6. Ensure high contrast between 'fgColor' and 'bgColor' for scannability.
            
            CURRENT STATE: ${JSON.stringify(input.currentState)}
            
            Respond with a JSON object containing 'updatedSettings' (only fields that should change) and 'aiResponse' (a friendly message in the user's language explaining why you chose this design).`,
            prompt: input.instruction,
            output: { schema: QrStudioOutputSchema }
        });

        if (!output) throw new Error("AI failed to generate a design response.");
        return output;
    }
);
