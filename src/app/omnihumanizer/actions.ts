'use server';

import { analyzeAiContent as analyzeAiContentFlow, humanizeText as humanizeTextFlow, type HumanizerInput, type AnalysisOutput, type HumanizerOutput } from '@/ai/flows/generate-human-like-text';
import { db } from '@/lib/firebaseAdmin.server';

export async function analyzeAiContent(input: HumanizerInput): Promise<AnalysisOutput | { error: string }> {
    try {
        const result = await analyzeAiContentFlow(input);
        return result;
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function humanizeText(input: HumanizerInput): Promise<HumanizerOutput | { error: string }> {
    try {
        const result = await humanizeTextFlow(input);
        return result;
    } catch (error: any) {
        return { error: error.message };
    }
}

interface HistoryData {
    inputText: string;
    humanizedText: string;
    aiScore: number;
    userId: string;
}

export async function saveHumanizerHistory(data: HistoryData): Promise<{ success: boolean; error?: string }> {
    try {
        if (!db) {
            throw new Error("Firestore Admin is not initialized.");
        }
        await db.collection('humanizerHistory').add({
            ...data,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
