/**
 * Types for the Full Process Affirmation Generator
 */

/** User's selections from the 4-step discovery wizard */
export interface UserPreferences {
  /** User's primary focus area (preset label or custom text) */
  focus: string;

  /** When user wants affirmations (array of preset labels and/or custom text) */
  timing: string[];

  /** Challenges user wants to address (array of preset labels and/or custom text) */
  challenges: string[];

  /** Preferred tone for affirmations (preset label or custom text) */
  tone: string;
}

/** Preference modifications made during mid-journey check-in */
export interface AdjustedPreferences {
  /** Updated challenges (replaces original if provided) */
  challenges?: string[];

  /** Updated tone (replaces original if provided) */
  tone?: string;

  /** Freeform feedback text */
  feedback?: string;
}

/** Current phase of the Full Process experience */
export type OnboardingPhase = 'discovery' | 'review' | 'checkin' | 'adjustment' | 'summary';

/** Current step within the discovery wizard (1-4) */
export type DiscoveryStepNumber = 1 | 2 | 3 | 4;

/** Complete state for the Full Process feature */
export interface WizardState {
  /** Current phase of the experience */
  phase: OnboardingPhase;

  /** Current step within discovery (1-4) */
  discoveryStep: DiscoveryStepNumber;

  /** User's finalized preferences */
  preferences: UserPreferences | null;

  /** Adjusted preferences from check-in (merged with original for generation) */
  adjustedPreferences: AdjustedPreferences | null;

  /** Current batch of affirmations from generation */
  affirmations: string[];

  /** Collection of affirmations user has liked */
  likedAffirmations: string[];

  /** Index of current affirmation being displayed */
  currentIndex: number;

  /** Whether the adjustment panel is open */
  isAdjusting: boolean;

  /** Loading state during affirmation generation */
  loading: boolean;

  /** Error message if generation fails */
  error: string | null;
}

/** Initial state for the wizard */
export const initialWizardState: WizardState = {
  phase: 'discovery',
  discoveryStep: 1,
  preferences: null,
  adjustedPreferences: null,
  affirmations: [],
  likedAffirmations: [],
  currentIndex: 0,
  isAdjusting: false,
  loading: false,
  error: null,
};

/** Options for generating affirmations */
export interface GenerateOptions {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;

  /** Optional: merged adjusted preferences */
  adjustedPreferences?: AdjustedPreferences;

  /** Implementation to use (default: 'default') */
  implementation?: string;
}

/** Result from affirmation generation */
export interface GenerateResult {
  /** Generated affirmations */
  affirmations: string[];

  /** Model used */
  model: string;
}

/** Preset option for discovery wizard steps */
export interface PresetOption {
  id: string;
  label: string;
  description?: string;
}
