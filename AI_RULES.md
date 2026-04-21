# 🛑 AI BEHAVIOR RULES (STRICTLY FOLLOW)

This file contains MANDATORY rules for the AI assistant working on "OmniTools AI".

## 1. SCOPE RESTRICTION (लक्ष्मण रेखा)
- **DO NOT** edit, delete, or modify any file NOT explicitly mentioned in the user's prompt.
- **RESTRICTED ZONES:** Do not touch `src/app/layout.tsx`, `firebase.json`, `next.config.js`, or root configuration files unless explicitly asked.
- Focus ONLY on the specific component or feature requested (e.g., if asked about CV, only touch `cv-builder` files).

## 2. PERMISSION PROTOCOL (पहिले सोध्ने)
- Before writing code to any existing file, you must **STATE YOUR PLAN** first.
- Example: "I plan to update `functions/index.js` to add the CV logic. Shall I proceed?"
- Wait for user confirmation before applying destructive changes.

## 3. NO DELETIONS
- NEVER delete existing functions or logic without a direct order.
- Always append (add to bottom) or comment out old code instead of removing it.

## 4. MODULARITY
- Use `functions/aiController.js` for all new AI logic. Do not clutter `index.js`.
- Keep the `src/ai/genkit.ts` file secure (check for API keys).

## 5. LANGUAGE & TONE
- The user speaks Nepali. Explain complex changes in simple Nepali.
- Be concise and direct.
