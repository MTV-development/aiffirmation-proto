export type ChatRole = 'assistant' | 'user';

export type QuickReply = {
  id: string;
  label: string;
  value: string;
  selected?: boolean;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  quickReplies?: QuickReply[];
};

export type FP3Phase =
  | 'intro'
  | 'focus'
  | 'friction'
  | 'tone'
  | 'inspiration'
  | 'confirm'
  | 'generating'
  | 'review'
  | 'checkin'
  | 'adjust'
  | 'done';

export type FP3Draft = {
  focus: string | null;
  challenges: string[];
  tone: string | null;
  likedExamples: string[];
  avoid: string[];
  notes: string;
};

export type FP3State = {
  phase: FP3Phase;
  messages: ChatMessage[];
  draft: FP3Draft;
  generatedAffirmations: string[];
  savedAffirmations: string[];
  shownAffirmations: string[];
  skippedAffirmations: string[];
  batchCount: number;
  currentIndex: number;
  error: string | null;
};

export const initialFP3State: FP3State = {
  phase: 'intro',
  messages: [],
  draft: {
    focus: null,
    challenges: [],
    tone: null,
    likedExamples: [],
    avoid: [],
    notes: '',
  },
  generatedAffirmations: [],
  savedAffirmations: [],
  shownAffirmations: [],
  skippedAffirmations: [],
  batchCount: 0,
  currentIndex: 0,
  error: null,
};


