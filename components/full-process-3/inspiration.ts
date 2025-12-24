export type InspirationTone = 'Gentle & Compassionate' | 'Powerful & Commanding' | 'Practical & Grounded' | 'Spiritual & Reflective';

export const DEFAULT_TONES: InspirationTone[] = [
  'Gentle & Compassionate',
  'Practical & Grounded',
  'Powerful & Commanding',
  'Spiritual & Reflective',
];

export type FocusPreset =
  | 'Confidence'
  | 'Self-Worth'
  | 'Career Growth'
  | 'Health & Wellness'
  | 'Relationships'
  | 'Creativity'
  | 'Calm & Anxiety'
  | 'Focus & Discipline';

export const FOCUS_PRESETS: FocusPreset[] = [
  'Confidence',
  'Self-Worth',
  'Career Growth',
  'Health & Wellness',
  'Relationships',
  'Creativity',
  'Calm & Anxiety',
  'Focus & Discipline',
];

export const CHALLENGE_PRESETS: string[] = [
  'Self-doubt',
  'Overthinking',
  'Procrastination',
  'Perfectionism',
  'Burnout',
  'Imposter feelings',
  'People-pleasing',
  'Low energy',
];

type InspirationBank = Record<FocusPreset, string[]>;

const BANK: InspirationBank = {
  Confidence: [
    'I trust my voice in the room.',
    'I take up space with ease.',
    'I act with quiet confidence.',
    'I meet challenges with steady courage.',
    'My presence is enough.',
    'I choose confidence over doubt.',
  ],
  'Self-Worth': [
    'I am worthy as I am.',
    'My needs matter.',
    'I treat myself with respect.',
    'I deserve gentle care today.',
    'I honor my feelings without judgment.',
    'I belong in my own life.',
  ],
  'Career Growth': [
    'I bring value through my work.',
    'I learn quickly and apply it well.',
    'I take the next right step.',
    'I lead with clarity and kindness.',
    'My work reflects my standards.',
    'I trust my professional judgment.',
  ],
  'Health & Wellness': [
    'I choose what supports my body.',
    'My body deserves steady care.',
    'I listen to my energy with respect.',
    'I move with patience and consistency.',
    'I nourish myself without pressure.',
    'I keep promises to my health.',
  ],
  Relationships: [
    'I communicate with honesty and warmth.',
    'I set boundaries with respect.',
    'I am safe to be myself.',
    'I welcome connection that feels mutual.',
    'I give and receive with balance.',
    'My relationships can be steady and kind.',
  ],
  Creativity: [
    'I create without needing perfection.',
    'Ideas flow when I begin.',
    'I make space for play and curiosity.',
    'I trust my creative instincts.',
    'My creativity is worth my time.',
    'I finish what matters to me.',
  ],
  'Calm & Anxiety': [
    'My breath brings me back.',
    'I can handle this moment.',
    'I soften my mind with kindness.',
    'I return to calm, one step at a time.',
    'I am safe in my body right now.',
    'I choose steadiness over urgency.',
  ],
  'Focus & Discipline': [
    'I do one thing at a time.',
    'I begin, even when it feels messy.',
    'I keep my attention on what matters.',
    'Small steps count today.',
    'I follow through with care.',
    'My consistency builds trust in me.',
  ],
};

export function getInspirationExamples(focus: FocusPreset): string[] {
  return BANK[focus];
}





