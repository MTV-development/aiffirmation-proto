import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { renderTemplate } from '@/src/services';
import { createProfileExtractorAgent } from '../../../agents/chat-survey/profile-extractor-agent';
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

    // Build extraction prompt from KV template
    const { output: extractionPrompt } = await renderTemplate({
      key: 'prompt_extract',
      version: 'cs-01',
      implementation: 'default',
      variables: {
        conversationHistory,
      },
    });

    // Create profile extractor agent and generate response
    // Using Mastra agent instead of direct generateText due to AI SDK version compatibility
    const agent = await createProfileExtractorAgent('default');
    const response = await agent.generate(extractionPrompt);

    // Parse extraction response
    let profile: UserProfile;
    try {
      const responseText = response.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
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
