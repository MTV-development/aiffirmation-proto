/**
 * FO-13 Types and Constants
 *
 * Shared types and constants for the FO-13 onboarding flow.
 * FO-13 uses the same hybrid discovery approach as FO-12: step 3 has a fixed question,
 * while steps 4-5 have LLM-adapted questions with skip logic.
 *
 * Key differences from FO-12:
 * - Phase 1: 4 batches of 5 (not 1 batch of 10) with feedback-driven regeneration between each
 * - Phase 2: 1 batch of 20 (not 10+continuous), optional via "Add more later" skip
 * - Total target: 20 (phase 1) + 20 (phase 2) = 40 affirmations reviewed
 * - 8 thinking screens with sequential personalized messages
 * - No check-in screens (replaced by thinking transitions)
 * - No confetti
 */

/**
 * Phase 1: 20 affirmations total, delivered in 4 batches of 5.
 */
export const PHASE1_TARGET = 20;

/**
 * Phase 2: 20 more affirmations, delivered in 1 batch of 20.
 * Total across both phases: 40.
 */
export const PHASE2_TARGET = 40;

/**
 * Batch size for phase 1 (each of the 4 rounds).
 */
export const PHASE1_BATCH_SIZE = 5;

/**
 * Batch size for phase 2 (single batch).
 */
export const PHASE2_BATCH_SIZE = 20;

/**
 * Number of batches in phase 1.
 */
export const PHASE1_BATCH_COUNT = 4;

/**
 * The fixed goal question for step 3.
 * Steps 4-5 have LLM-generated questions (no hardcoded array).
 * Includes [name] placeholder for personalization.
 */
export const FO13_GOAL_QUESTION =
  "What's your main goal with affirmations today, [name]?";

/**
 * Response structure from the FO-13 discovery agent.
 * Includes a skip signal for step 4 (context step can be skipped
 * if the goal answer already provides sufficient life context).
 */
export interface FO13DiscoveryResponse {
  skip: boolean;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  error?: string;
}

/**
 * Onboarding data accumulated during FO-13 flow.
 * The exchanges array has variable length:
 * - 2 exchanges: goal + tone (step 4 skipped)
 * - 3 exchanges: goal + context + tone
 *
 * familiarityLevel is kept for UI purposes but is NOT passed to agents.
 */
export interface FO13OnboardingData {
  name: string;
  familiarityLevel: 'new' | 'somewhat' | 'very';
  exchanges: Array<{
    question: string;
    answer: { text: string };
  }>;
}

/**
 * Options for generating affirmation batches in FO-13.
 * batchSize controls how many affirmations to generate:
 * - Phase 1: 5 per batch (4 batches)
 * - Phase 2: 20 in one batch
 */
export interface FO13GenerateBatchOptions {
  context: FO13OnboardingData;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
  batchSize?: number;
}

/**
 * Result from affirmation batch generation.
 */
export interface FO13GenerateBatchResult {
  affirmations: string[];
  error?: string;
}
