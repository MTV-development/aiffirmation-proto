// Client-side types for CS-01 Chat Survey

export interface SessionReference {
  runId: string;
  createdAt: string;
  phase: 'chat' | 'swipe';
}

export type Phase = 'loading' | 'chat' | 'swipe' | 'saved';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export type SwipeDirection = 'left' | 'right';

export interface ChatPhaseProps {
  messages: ChatMessage[];
  currentQuestion?: string;
  suggestedResponses?: string[];
  isLoading?: boolean;
  onSendMessage: (message: string) => void;
  onSkipToSwipe?: () => void;
}

export interface SwipePhaseProps {
  affirmation: string;
  index: number;
  savedCount: number;
  isLoading?: boolean;
  onSwipe: (direction: SwipeDirection, affirmation: string) => void;
  onViewSaved?: () => void;
}

export interface CSExperienceProps {
  initialRunId?: string;
}
