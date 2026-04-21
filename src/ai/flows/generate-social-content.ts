'use server';
/**
 * @fileOverview A rule-based professional Social Media Content Generator.
 * This flow generates content using structured logic based on user input and platform.
 *
 * - createSocialContent - Generates social media content.
 * - CreateSocialContentOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SocialPlatformSchema = z.enum(['Facebook', 'Instagram', 'TikTok', 'YouTube']);

const CreateSocialContentInputSchema = z.object({
  userInput: z.string().describe('The user\'s core idea or topic. This should be treated as the source of truth and not be distorted.'),
  platform: SocialPlatformSchema.describe('The target social media platform.'),
});
type CreateSocialContentInput = z.infer<typeof CreateSocialContentInputSchema>;

const CreateSocialContentOutputSchema = z.object({
    toolName: z.string().default('OmniTools AI'),
    platform: SocialPlatformSchema,
    content: z.string().describe('Main generated status / caption / description.'),
    callToAction: z.string().describe('One clear call-to-action line.'),
    hashtags: z.string().describe('A single string of 4-8 space-separated hashtags.'),
});
export type CreateSocialContentOutput = z.infer<typeof CreateSocialContentOutputSchema>;


export async function createSocialContent(input: CreateSocialContentInput): Promise<CreateSocialContentOutput> {
  return generateSocialContentFlow(input);
}

const socialContentPrompt = ai.definePrompt({
    name: 'generateSocialContentPrompt',
    input: { schema: CreateSocialContentInputSchema },
    output: { schema: CreateSocialContentOutputSchema },
    prompt: `You are OmniTools AI, a professional social media content generator.

VERY IMPORTANT RULE:
- NEVER talk about yourself.
- NEVER say things like “I’ve crafted”, “With OmniTools AI”, or any AI-related sentence.
- Focus ONLY on what the user is trying to say.

USER INTENT DETECTION:
- If the user's input is a question about you, the tool, or "OmniTools AI", DO NOT treat it as a topic for a social media post. Instead, provide a friendly, predefined response explaining your purpose. For example: "Hello! I am OmniTools AI, your social media content assistant. Please provide me with a topic, and I will create an engaging post and hashtags for you." Then use relevant, generic hashtags.

INPUT HANDLING:
- Understand exactly what the user wants to communicate.
- Do NOT change the topic.
- Do NOT add promotional or unrelated lines.
- Improve clarity, tone, and grammar only.
- Keep the message relevant to the subject.

CONTENT RULES:
- If the input is an alert, warning, news, or information:
  → Write it clearly and responsibly.
  → Do NOT add jokes or marketing language.
- If the input is casual or fun:
  → You may add a light, engaging tone.

OUTPUT STRUCTURE (STRICT):
1. Main content related ONLY to the user input
2. Optional short awareness or safety line (if relevant)
3. Relevant hashtags ONLY (4-8 hashtags, with #OmniToolsAI in the middle if appropriate)

HASHTAG RULES:
- Hashtags must match the topic.
- No generic AI or writing hashtags unless the topic is about AI.
- No random trending tags.
- Location-based hashtags allowed if relevant.

PLATFORM BEHAVIOR:
- Facebook: clear, informative, shareable
- Instagram: short, alert-style caption
- TikTok: brief warning-style caption
- YouTube: informative description

FINAL CHECK BEFORE OUTPUT:
- Is this 100% about the user’s topic?
- Does it say exactly what the user intended?
- Are hashtags directly related?

Return content that sounds human, responsible, and trustworthy.

USER INPUT:
"{{{userInput}}}"

PLATFORM:
"{{platform}}"

Return ONLY the valid JSON output based on these strict rules.
`,
});


const generateSocialContentFlow = ai.defineFlow(
  {
    name: 'generateSocialContentFlow',
    inputSchema: CreateSocialContentInputSchema,
    outputSchema: CreateSocialContentOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await socialContentPrompt(input);
        
        if (!output || !output.content || !output.hashtags) {
           // This is a robust fallback that should rarely be hit if the prompt is good.
           // It uses the user's direct input to ensure something is always returned.
           return {
                toolName: "OmniTools AI",
                platform: input.platform || "Facebook",
                content: input.userInput,
                callToAction: "What are your thoughts on this?",
                hashtags: `#omnitoolsai #socialpost #discussion #${input.platform.toLowerCase()}`
            };
        }

        return output;

    } catch (error) {
        console.error("Social Content Generation Flow failed. Returning a safe, user-input-based fallback.", error);
        // This catch block handles unexpected errors during the AI call itself.
        return {
            toolName: "OmniTools AI",
            platform: input?.platform || "Facebook",
            content: input.userInput, // Return the user's raw input as content.
            callToAction: "Share your thoughts below!",
            hashtags: "#omnitoolsai #generalpost #community" // Provide generic but safe hashtags.
        };
    }
  }
);
