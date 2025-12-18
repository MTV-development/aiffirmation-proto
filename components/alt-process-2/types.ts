export type AP2Phase = 'stream' | 'tune' | 'saved';

export type TonePreference = 'neutral' | 'gentle' | 'strong' | null;

export interface AP2State {
  phase: AP2Phase;
  currentIndex: number;
  affirmationQueue: string[];
  savedAffirmations: string[];
  skippedAffirmations: string[];
  shownAffirmations: string[];
  tonePreference: TonePreference;
  isLoading: boolean;
  error: string | null;
}

export const initialAP2State: AP2State = {
  phase: 'stream',
  currentIndex: 0,
  affirmationQueue: [],
  savedAffirmations: [],
  skippedAffirmations: [],
  shownAffirmations: [],
  tonePreference: 'neutral',
  isLoading: false,
  error: null,
};

export type SwipeDirection = 'left' | 'right';

export interface SwipeResult {
  direction: SwipeDirection;
  affirmation: string;
}
