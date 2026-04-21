import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * @fileOverview Genkit Initialization Node
 * 
 * This singleton 'ai' instance is the primary entry point for all LLM interactions.
 * Configured to use Google AI (Gemini) as the underlying engine.
 */
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
});

/**
 * Helper to fetch system-wide AI configuration from Firestore.
 * This can be used inside Server Actions to dynamically override API keys
 * and models based on admin settings.
 */
export async function getDynamicAiConfig() {
    try {
        const { db } = await import('@/lib/firebaseAdmin.server');
        if (!db) throw new Error("Database not initialized");

        const configSnap = await db.doc('systemConfig/global').get();
        const data = configSnap.data();

        return {
            apiKey: data?.googleAiKey || process.env.GOOGLE_GENAI_API_KEY,
            model: data?.aiModel || 'gemini-1.5-flash',
            temperature: data?.aiTemperature || 0.7,
            masterPrompt: data?.masterPrompt || ""
        };
    } catch (error) {
        console.error("Dynamic AI Config Sync Failed:", error);
        return {
            apiKey: process.env.GOOGLE_GENAI_API_KEY,
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            masterPrompt: ""
        };
    }
}
