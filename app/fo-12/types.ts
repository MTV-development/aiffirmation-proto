/**
 * FO-12 Types and Constants
 *
 * Shared types and constants for the FO-12 onboarding flow.
 * FO-12 uses a hybrid discovery approach: step 3 has a fixed question,
 * while steps 4-5 have LLM-adapted questions with skip logic.
 *
 * Key differences from FO-11:
 * - No step 7 (Additional Context removed)
 * - Discovery steps are 4 (context) and 5 (tone)
 * - Batch size 10 instead of 5
 * - Structured 3-phase selection flow targeting exactly 30 loved affirmations
 */

/**
 * Target number of loved affirmations for the complete journey.
 */
export const TARGET_LOVED = 30;

/**
 * Number of affirmations in phase 1.
 */
export const PHASE1_SIZE = 10;

/**
 * Number of affirmations in phase 2.
 */
export const PHASE2_SIZE = 10;

/**
 * The fixed goal question for step 3.
 * Steps 4-5 have LLM-generated questions (no hardcoded array).
 * Includes [name] placeholder for personalization.
 */
export const FO12_GOAL_QUESTION =
  "What's your main goal with affirmations today, [name]?";

/**
 * Response structure from the FO-12 discovery agent.
 * Includes a skip signal for step 4 (context step can be skipped
 * if the goal answer already provides sufficient life context).
 */
export interface FO12DiscoveryResponse {
  skip: boolean;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  error?: string;
}

/**
 * Onboarding data accumulated during FO-12 flow.
 * The exchanges array has variable length:
 * - 2 exchanges: goal + tone (step 4 skipped)
 * - 3 exchanges: goal + context + tone
 *
 * familiarityLevel is kept for UI purposes but is NOT passed to agents.
 */
export interface FO12OnboardingData {
  name: string;
  familiarityLevel: 'new' | 'somewhat' | 'very';
  exchanges: Array<{
    question: string;
    answer: { text: string };
  }>;
}

/**
 * Options for generating affirmation batches in FO-12.
 * batchSize is optional and used for phase 3 dynamic sizing.
 */
export interface FO12GenerateBatchOptions {
  context: FO12OnboardingData;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
  batchSize?: number;
}

/**
 * Result from affirmation batch generation.
 */
export interface FO12GenerateBatchResult {
  affirmations: string[];
  error?: string;
}
