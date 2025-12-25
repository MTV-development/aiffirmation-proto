import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { generateText } from 'ai';
import { getModel } from '@/src/services';
import {
  type ConversationMessage,
  type UserProfile,
  userProfileSchema,
  tonePreferenceSchema,
} from '../types';

const extractionResponseSchema = z.object({
  themes: z.array(z.string()),
  challenges: z.array(z.string()),
  tone: tonePreferenceSchema,
  insights: z.array(z.string()),
  conversationSummary: z.string(),
});

export const profileBuilderStep = createStep({
  id: 'profile-builder',
  inputSchema: z.object({
    conversationHistory: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string().optional(),
    })),
    isComplete: z.boolean(),
    summary: z.string().optional(),
  }),
  outputSchema: userProfileSchema,
  execute: async ({ inputData }) => {
    const conversationHistory: ConversationMessage[] = inputData?.conversationHistory || [];

    if (conversationHistory.length === 0) {
      // Return default profile for exploration mode
      return {
        themes: ['self-worth', 'growth', 'peace'],
        challenges: [],
        tone: 'balanced' as const,
        insights: [],
        conversationSummary: 'No discovery conversation - exploration mode',
      };
    }

    // Build conversation text for extraction
    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const extractionPrompt = `Analyze this conversation and extract a structured user profile for affirmation generation.

## Conversation
${conversationText}

## Instructions
Extract:
1. **themes**: 1-5 life areas or topics the user wants to focus on (e.g., "self-worth", "career confidence", "relationships", "health", "stress management")
2. **challenges**: Specific obstacles or difficulties they mentioned (can be empty)
3. **tone**: Which tone would resonate best with this user? Choose ONE:
   - "gentle" - soft, nurturing, self-compassionate language
   - "assertive" - strong, direct, empowering statements
   - "balanced" - mix of gentle and assertive
   - "spiritual" - contemplative, mindful, deeper meaning
4. **insights**: Any specific personal details or context that should inform affirmations
5. **conversationSummary**: A brief (max 500 chars) summary of what you learned about this person

Return ONLY a JSON object with these fields:
{
  "themes": ["theme1", "theme2"],
  "challenges": ["challenge1"],
  "tone": "balanced",
  "insights": ["insight1"],
  "conversationSummary": "Brief summary..."
}`;

    const response = await generateText({
      model: getModel(),
      prompt: extractionPrompt,
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    // Parse extraction response
    let profile: UserProfile;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = extractionResponseSchema.parse(JSON.parse(jsonMatch[0]));
        profile = {
          themes: parsed.themes.length > 0 ? parsed.themes : ['self-worth'],
          challenges: parsed.challenges,
          tone: parsed.tone,
          insights: parsed.insights,
          conversationSummary: parsed.conversationSummary.slice(0, 500),
        };
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (error) {
      // Fallback profile if extraction fails
      console.error('Profile extraction failed:', error);
      profile = {
        themes: ['self-worth', 'growth'],
        challenges: [],
        tone: 'balanced',
        insights: [],
        conversationSummary: 'Profile extraction failed - using defaults',
      };
    }

    return profile;
  },
});
