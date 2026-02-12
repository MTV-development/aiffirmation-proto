/**
 * FO-11 Types and Constants
 *
 * Shared types and constants for the FO-11 onboarding flow.
 * FO-11 uses a hybrid discovery approach: step 4 has a fixed question,
 * while steps 5-6 have LLM-adapted questions with skip logic.
 */

/**
 * The fixed goal question for step 4.
 * Steps 5-7 have LLM-generated questions (no hardcoded array).
 * Includes [name] placeholder for personalization.
 */
export const FO11_GOAL_QUESTION =
  "What's your main goal with affirmations today, [name]?";

/**
 * Response structure from the FO-11 discovery agent.
 * Includes a skip signal for step 5 (context step can be skipped
 * if the goal answer already provides sufficient life context).
 */
export interface FO11DiscoveryResponse {
  skip: boolean;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  error?: string;
}

/**
 * Onboarding data accumulated during FO-11 flow.
 * The exchanges array has variable length:
 * - 2 exchanges: goal + tone (step 5 skipped, step 7 empty)
 * - 3 exchanges: goal + context + tone OR goal + tone + additional
 * - 4 exchanges: goal + context + tone + additional
 *
 * familiarityLevel is kept for UI purposes but is NOT passed to agents.
 */
export interface FO11OnboardingData {
  name: string;
  familiarityLevel: 'new' | 'somewhat' | 'very';
  exchanges: Array<{
    question: string;
    answer: { text: string };
  }>;
}

/**
 * Options for generating affirmation batches in FO-11.
 */
export interface FO11GenerateBatchOptions {
  context: FO11OnboardingData;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
}

/**
 * Result from affirmation batch generation.
 */
export interface FO11GenerateBatchResult {
  affirmations: string[];
  error?: string;
}
