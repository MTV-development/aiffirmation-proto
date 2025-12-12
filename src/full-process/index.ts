// Types
export type {
  UserPreferences,
  AdjustedPreferences,
  OnboardingPhase,
  DiscoveryStepNumber,
  WizardState,
  GenerateOptions,
  GenerateResult,
  PresetOption,
} from './types';

export { initialWizardState } from './types';

// Constants
export {
  FOCUS_AREAS,
  CHALLENGE_BADGES,
  TONE_CARDS,
  STEP_TITLES,
  STEP_DESCRIPTIONS,
} from './constants';

/**
 * Determine if the mid-journey check-in should be shown
 * Triggers at 5, 10, and every 5 liked affirmations thereafter
 */
export function shouldShowCheckIn(likedCount: number): boolean {
  if (likedCount === 5 || likedCount === 10) return true;
  if (likedCount > 10 && (likedCount - 10) % 5 === 0) return true;
  return false;
}
