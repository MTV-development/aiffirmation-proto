/**
 * FO-10 Types and Constants
 *
 * Shared types and constants for the FO-10 onboarding flow.
 * FO-10 uses a fixed 4-question sequence instead of dynamic discovery.
 */

/**
 * Fixed 4-question sequence for FO-10 discovery phase (steps 4-7).
 * These questions are hardcoded, while chips are AI-generated.
 * Questions include [name] placeholder for personalization.
 */
export const FO10_QUESTIONS = [
  "What is your primary goal with affirmations today, [name]?",
  "Why does this goal feel important to you?",
  "In which situation is your goal especially important?",
  "What kind of support would be most helpful for you right now?",
] as const;

/**
 * Onboarding data accumulated during FO-10 flow.
 * Reuses the same exchange structure as FO-09 for compatibility with affirmation agent.
 */
export interface FO10OnboardingData {
  name: string;
  familiarityLevel: "new" | "somewhat" | "very";
  exchanges: Array<{
    question: string;
    answer: { text: string };
  }>;
}

/**
 * Response structure from the FO-10 chip generation agent.
 */
export interface FO10ChipResponse {
  initialChips: string[];
  expandedChips: string[];
  error?: string;
}

/**
 * Options for generating affirmation batches in FO-10.
 */
export interface FO10GenerateBatchOptions {
  context: FO10OnboardingData;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
}

/**
 * Result from affirmation batch generation.
 */
export interface FO10GenerateBatchResult {
  affirmations: string[];
  error?: string;
}
