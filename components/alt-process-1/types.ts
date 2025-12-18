export type AP1Phase = 'input' | 'processing' | 'results' | 'done';

export interface AP1State {
  phase: AP1Phase;
  userInput: string;
  extractedTags: string[];
  generatedAffirmations: string[];
  savedAffirmations: string[];
  skippedAffirmations: string[];
  shownAffirmations: string[];
  shuffleCount: number;
  error: string | null;
}

export const initialAP1State: AP1State = {
  phase: 'input',
  userInput: '',
  extractedTags: [],
  generatedAffirmations: [],
  savedAffirmations: [],
  skippedAffirmations: [],
  shownAffirmations: [],
  shuffleCount: 0,
  error: null,
};
