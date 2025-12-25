import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { type UserProfile, userProfileSchema } from '../types';
import { generationAgent, buildGenerationPrompt } from '../../../agents/chat-survey';

const affirmationResponseSchema = z.object({
  affirmation: z.string(),
});

export const generateStreamStep = createStep({
  id: 'generate-stream',
  // Input is the profile from profile-builder step (matches userProfileSchema)
  inputSchema: userProfileSchema.extend({
    approvedAffirmations: z.array(z.string()).optional(),
    skippedAffirmations: z.array(z.string()).optional(),
    currentIndex: z.number().optional(),
    refinementNote: z.string().optional(),
  }),
  outputSchema: z.object({
    approvedAffirmations: z.array(z.string()),
    skippedAffirmations: z.array(z.string()),
    currentIndex: z.number(),
    lastAction: z.enum(['approve', 'skip']).optional(),
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    // Get state from resumeData (if resuming) or inputData (initial)
    const profile = (resumeData?.profile || inputData) as UserProfile | undefined;
    let approvedAffirmations = resumeData?.approvedAffirmations || inputData?.approvedAffirmations || [];
    let skippedAffirmations = resumeData?.skippedAffirmations || inputData?.skippedAffirmations || [];
    let currentIndex = resumeData?.currentIndex || inputData?.currentIndex || 0;
    const refinementNote = inputData?.refinementNote;

    // If resumeData has a swipe action, process it first
    if (resumeData?.action && resumeData?.affirmation) {
      if (resumeData.action === 'approve') {
        approvedAffirmations = [...approvedAffirmations, resumeData.affirmation];
      } else {
        skippedAffirmations = [...skippedAffirmations, resumeData.affirmation];
      }
      currentIndex = currentIndex + 1;
    }

    // Check if we have enough approved affirmations (e.g., 10)
    const TARGET_APPROVED = 10;
    if (approvedAffirmations.length >= TARGET_APPROVED) {
      return {
        approvedAffirmations,
        skippedAffirmations,
        currentIndex,
        lastAction: resumeData?.action,
      };
    }

    // Build prompt based on profile and feedback
    const prompt = buildGenerationPrompt({
      profile,
      approvedAffirmations,
      skippedAffirmations,
      isExplorationMode: !profile,
      refinementNote,
    });

    // Generate next affirmation with retry logic for duplicates
    const allExisting = [...approvedAffirmations, ...skippedAffirmations];
    let affirmation: string = '';
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      const response = await generationAgent.generate(prompt);

      // Parse response
      try {
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = affirmationResponseSchema.parse(JSON.parse(jsonMatch[0]));
          affirmation = parsed.affirmation;
        } else {
          // If no JSON, use the raw text
          affirmation = response.text.trim();
        }
      } catch {
        // Fallback to raw text
        affirmation = response.text.trim();
      }

      // Check if it's a duplicate
      const isDuplicate = allExisting.some(
        existing => existing.toLowerCase().trim() === affirmation.toLowerCase().trim()
      );

      if (!isDuplicate) {
        break; // Good affirmation, exit loop
      }

      console.log(`[generate-stream] Duplicate detected on attempt ${attempts}, retrying...`);
    }

    // Suspend and wait for swipe action - include all state for next resume
    return suspend({
      affirmation,
      index: currentIndex + 1,
      // Include state needed for next resume
      profile,
      approvedAffirmations,
      skippedAffirmations,
      currentIndex,
    });
  },
});
