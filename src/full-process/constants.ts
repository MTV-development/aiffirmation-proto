import type { PresetOption } from './types';

/** Focus areas for Step 1 (single-select) */
export const FOCUS_AREAS: PresetOption[] = [
  {
    id: 'career',
    label: 'Career Growth',
    description: 'Professional development and work success',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Connection with others and social bonds',
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    description: 'Physical and mental well-being',
  },
  {
    id: 'confidence',
    label: 'Confidence',
    description: 'Self-assurance and belief in yourself',
  },
  {
    id: 'creativity',
    label: 'Creativity',
    description: 'Creative expression and innovation',
  },
  {
    id: 'self-worth',
    label: 'Self-Worth',
    description: 'Recognizing your inherent value',
  },
];

/** Timing options for Step 2 (multi-select) */
export const TIMING_OPTIONS: PresetOption[] = [
  {
    id: 'morning',
    label: 'Morning',
    description: 'Start your day with intention',
  },
  {
    id: 'evening',
    label: 'Evening',
    description: 'Wind down and reflect',
  },
  {
    id: 'all-day',
    label: 'All-Day',
    description: 'Continuous reinforcement',
  },
];

/** Challenge badges for Step 3 (multi-select) */
export const CHALLENGE_BADGES: PresetOption[] = [
  {
    id: 'anxiety',
    label: 'Anxiety',
    description: 'Worry and nervousness',
  },
  {
    id: 'self-doubt',
    label: 'Self-Doubt',
    description: 'Questioning your abilities',
  },
  {
    id: 'imposter',
    label: 'Imposter Syndrome',
    description: 'Feeling like a fraud',
  },
  {
    id: 'procrastination',
    label: 'Procrastination',
    description: 'Difficulty starting tasks',
  },
  {
    id: 'perfectionism',
    label: 'Perfectionism',
    description: 'Unrealistic standards',
  },
  {
    id: 'burnout',
    label: 'Burnout',
    description: 'Exhaustion and overwhelm',
  },
];

/** Tone cards for Step 4 (single-select) */
export const TONE_CARDS: PresetOption[] = [
  {
    id: 'gentle',
    label: 'Gentle & Compassionate',
    description: 'Soft, nurturing, self-kind language',
  },
  {
    id: 'powerful',
    label: 'Powerful & Commanding',
    description: 'Strong, assertive, action-oriented',
  },
  {
    id: 'practical',
    label: 'Practical & Grounded',
    description: 'Realistic, down-to-earth, pragmatic',
  },
  {
    id: 'spiritual',
    label: 'Spiritual & Reflective',
    description: 'Contemplative, mindful, deeper meaning',
  },
];

/** Step titles for the discovery wizard */
export const STEP_TITLES = {
  1: 'Primary Focus',
  2: 'Timing',
  3: 'Challenges',
  4: 'Tone',
} as const;

/** Step descriptions for the discovery wizard */
export const STEP_DESCRIPTIONS = {
  1: 'What area of your life do you want your affirmations to focus on?',
  2: 'When do you plan to use these affirmations?',
  3: 'What challenges are you facing that you want to address?',
  4: 'What tone do you prefer for your affirmations?',
} as const;
