'use server';

import { suggestAiTools, SuggestAiToolsInput } from '@/ai/flows/suggest-ai-tools';
import { generateCoverLetter, GenerateCoverLetterInput } from '@/ai/flows/generate-cover-letter';
import { generateEuropassCV, GenerateEuropassCVInput, GenerateEuropassCVOutput } from '@/ai/flows/generate-europass-cv';
import { generateVisaCoverLetter, GenerateVisaCoverLetterInput } from '@/ai/flows/generate-visa-cover-letter';
import { extractInfoFromDocument as extractInfoFromDocumentFlow, ExtractInfoInput, ExtractInfoOutput } from '@/ai/flows/extract-doc-info';
import { generateAvailability, GenerateAvailabilityInput, GenerateAvailabilityOutput } from '@/ai/flows/generate-availability-status';
import { generateOmniResponse as generateOmniResponseFlow, GenerateOmniResponseInput, GenerateOmniResponseOutput } from '@/ai/flows/generate-omni-response';
import { generatePersonalAssistantResponse as generatePersonalAssistantResponseFlow, GeneratePersonalAssistantResponseInput, GeneratePersonalAssistantResponseOutput } from '@/ai/flows/generate-personal-assistant-response';
import { createSocialContent as createSocialContentFlow, CreateSocialContentOutput } from '@/ai/flows/generate-social-content';
import { translateText as translateTextFlow, TranslateTextInput, TranslateTextOutput } from '@/ai/flows/translate-text';
import { generateImage as generateImageFlow, GenerateImageInput, GenerateImageOutput } from '@/ai/flows/generate-image';
import { generateStoryPost as generateStoryPostFlow, GenerateStoryPostInput, GenerateStoryPostOutput } from '@/ai/flows/generate-story-post';
import { generateStory as generateStoryFlow, GenerateStoryInput, GenerateStoryOutput } from '@/ai/flows/generate-story-flow';
import { removeBackground as removeBackgroundFlow, RemoveBackgroundInput } from '@/ai/flows/remove-background';
import { generateBackgroundImage as generateBackgroundImageFlow, type GenerateBackgroundImageInput, type GenerateBackgroundImageOutput } from '@/ai/flows/generate-greeting-card';
import { changeDress as changeDressFlow, type ChangeDressInput, type ChangeDressOutput } from '@/ai/flows/change-dress';
import { generateCardContent, type GenerateCardContentInput, type GenerateCardContentOutput } from '@/ai/flows/generate-card-content';
import { generateStudioSuggestions, editInvitationWithAi, type StudioInput, type StudioOutput } from '@/ai/flows/invitation-studio-flow';
import { smartFillProfile as smartFillProfileFlow, type SmartFillOutput } from '@/ai/flows/smart-fill-profile';
import { editQrWithAi } from '@/ai/flows/qr-studio-flow';

export async function getAiToolSuggestions(input: SuggestAiToolsInput) {
    try {
        const result = await suggestAiTools(input);
        return result.suggestions;
    } catch (error) {
        console.error("Error getting AI tool suggestions:", error);
        return [];
    }
}

export async function createEuropassCV(input: GenerateEuropassCVInput): Promise<GenerateEuropassCVOutput> {
    try {
        const result = await generateEuropassCV(input);
        return result;
    } catch (error: any) {
        console.error("Error generating Europass CV:", error);
        return { cvContent: `Error: ${error.message}`, declaration: "Error: Could not generate declaration." };
    }
}

export async function createCoverLetter(input: GenerateCoverLetterInput) {
    try {
        const result = await generateCoverLetter(input);
        return result;
    } catch (error) {
        console.error("Error generating cover letter:", error);
        return { coverLetterContent: "Error: Could not generate cover letter." };
    }
}

export async function createVisaCoverLetter(input: GenerateVisaCoverLetterInput) {
    try {
        const result = await generateVisaCoverLetter(input);
        return result;
    } catch (error: any) {
        console.error("Error generating Visa Cover Letter:", error);
        return { coverLetterText: `Error: ${error.message}` };
    }
}

export async function extractInfoFromDocument(input: ExtractInfoInput): Promise<ExtractInfoOutput | { error: string }> {
    try {
        const result = await extractInfoFromDocumentFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error extracting info from document:", error);
        return { error: `Could not extract info. Details: ${error.message}` };
    }
}

export async function generateAvailabilityStatus(input: GenerateAvailabilityInput): Promise<GenerateAvailabilityOutput | { error: string }> {
    try {
        const result = await generateAvailability(input);
        return result;
    } catch (error: any) {
        console.error("Error generating availability status:", error);
        return { error: `Could not generate status. Details: ${error.message}` };
    }
}

export async function generateOmniResponse(input: GenerateOmniResponseInput): Promise<GenerateOmniResponseOutput | { error: string }> {
    try {
        const result = await generateOmniResponseFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating Omni AI response:", error);
        return { error: `Could not get a response. Details: ${error.message}` };
    }
}

export async function generatePersonalAssistantResponse(input: GeneratePersonalAssistantResponseInput): Promise<GeneratePersonalAssistantResponseOutput | { error: string }> {
    try {
        const result = await generatePersonalAssistantResponseFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating Personal Assistant response:", error);
        return { error: `Could not get a response. Details: ${error.message}` };
    }
}

export async function createSocialContent(input: any): Promise<CreateSocialContentOutput | { error: string }> {
    try {
        const result = await createSocialContentFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating social content:", error);
        return { error: `Could not generate content. Details: ${error.message}` };
    }
}

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput | { error: string }> {
    try {
        const result = await translateTextFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error translating text:", error);
        return { error: `Could not translate text. Details: ${error.message}` };
    }
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput | { error: string }> {
    try {
        const result = await generateImageFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating image:", error);
        return { error: `Could not generate image. Details: ${error.message}` };
    }
}

export async function generateStoryPost(input: GenerateStoryPostInput): Promise<GenerateStoryPostOutput | { error: string }> {
    try {
        const result = await generateStoryPostFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating story post:", error);
        return { error: `Could not generate story post. Details: ${error.message}` };
    }
}

export async function generateBackgroundImage(input: GenerateBackgroundImageInput): Promise<GenerateBackgroundImageOutput | { error: string }> {
    try {
        const result = await generateBackgroundImageFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating background image:", error);
        return { error: `Could not generate image. Details: ${error.message}` };
    }
}

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput | { error: string }> {
    try {
        const result = await generateStoryFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error generating story:", error);
        return { error: `Could not generate story. Details: ${error.message}` };
    }
}

export async function removeImageBackground(input: RemoveBackgroundInput) {
    try {
        const result = await removeBackgroundFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error removing image background:", error);
        return { photoDataUri: `Error: ${error.message}` };
    }
}

export async function changePhotoDress(input: ChangeDressInput): Promise<ChangeDressOutput | { error: string }> {
    try {
        const result = await changeDressFlow(input);
        return result;
    } catch (error: any) {
        console.error("Error changing photo dress:", error);
        return { error: error.message };
    }
}

export async function createAiCardContent(input: GenerateCardContentInput): Promise<GenerateCardContentOutput | { error: string }> {
    try {
        const result = await generateCardContent(input);
        return result;
    } catch (error: any) {
        console.error("Error creating AI card content:", error);
        return { error: error.message };
    }
}

export async function getStudioSuggestionsAction(input: StudioInput): Promise<StudioOutput | { error: string }> {
    try {
        const result = await generateStudioSuggestions(input);
        return result;
    } catch (error: any) {
        console.error("Error getting studio suggestions:", error);
        return { error: error.message };
    }
}

export async function editInvitationWithAiAction(input: { instruction: string, currentState: any }) {
    try {
        const result = await editInvitationWithAi(input);
        return result;
    } catch (error: any) {
        console.error("AI Chat Edit Failed:", error);
        return { error: error.message };
    }
}

export async function smartFillProfileAction(input: any): Promise<SmartFillOutput | { error: string }> {
    try {
        const result = await smartFillProfileFlow(input);
        return result;
    } catch (error: any) {
        console.error("Smart Fill Action Failed:", error);
        return { error: error.message };
    }
}

export async function editQrWithAiAction(input: { instruction: string, currentState: any }) {
    try {
        const result = await editQrWithAi(input);
        return result;
    } catch (error: any) {
        console.error("AI QR Edit Failed:", error);
        return { error: error.message };
    }
}
