/**
 * FO-08 Types and Constants
 *
 * Shared types and constants for the FO-08 onboarding flow.
 * These are separated from actions.ts because 'use server' files
 * can only export async functions in Next.js 16+.
 */

/**
 * Fixed opening question for screen 1.
 * This is asked before any dynamic discovery.
 */
export const FIXED_OPENING_QUESTION =
  "What's going on in your life right now that made you seek out affirmations?";

/**
 * Context accumulated during the dynamic gathering screens.
 * FO-08 simplifies this: no familiarity, no initialTopic, simpler answer structure.
 */
export interface GatheringContext {
  name: string;
  exchanges: Array<{
    question: string;
    answer: { text: string };
  }>;
  screenNumber: number; // 1-indexed, used for min/max enforcement
}

/**
 * Response structure from the discovery agent.
 * FO-08 includes optional reflectiveStatement for backward compatibility with agents
 * that may or may not return it.
 */
export interface DynamicScreenResponse {
  reflectiveStatement?: string; // Optional - may be included by discovery agent
  question: string;
  initialFragments: string[]; // 5 fragments, shown by default
  expandedFragments: string[]; // 8 fragments, shown on "show more"
  readyForAffirmations: boolean;
  error?: string;
}

/**
 * Response for first screen fragments only.
 * Screen 1 uses the fixed opening question, so we only need fragments.
 */
export interface FirstScreenFragmentsResponse {
  initialFragments: string[];
  expandedFragments: string[];
  error?: string;
}

/**
 * Options for generating affirmation batches in FO-08.
 */
export interface FO08GenerateBatchOptions {
  context: GatheringContext;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
}

/**
 * Result from affirmation batch generation.
 */
export interface FO08GenerateBatchResult {
  affirmations: string[];
  error?: string;
}
