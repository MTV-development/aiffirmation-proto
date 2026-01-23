# Epic Context: [wl7] FO-03: Onboarding Steps 5-7 with Open Text + Chips

## Relevant Code

### Core Files to Modify
- **`app/fo-03/components/fo-experience.tsx`** - Main state manager. Steps 5-7 are currently placeholders (lines 155-195). Must wire up new components here.
- **`app/fo-03/components/step-topics.tsx`** - Reference for chip pattern. Shows toggleable chips with `canvas-confetti` + `framer-motion` animations.

### Files to Create
- `app/fo-03/components/text-with-chips.tsx` - Reusable textarea + chips component
- `app/fo-03/components/heart-animation.tsx` - Transition animation between steps

### Key Interfaces

```typescript
// From fo-experience.tsx:12-19
export interface FO03OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  situation: { text: string; chips: string[] };  // Step 5
  feelings: { text: string; chips: string[] };   // Step 6
  whatHelps: { text: string; chips: string[] };  // Step 7
}
```

### Existing Component Patterns

**Props pattern** (from step-topics.tsx:7-14):
```typescript
interface StepTopicsProps {
  currentStep: number;
  name: string;
  topics: string[];
  onTopicsChange: (topics: string[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}
```

**Chip toggle pattern** (from step-topics.tsx:74-81):
```typescript
const toggleTopic = (topic: string) => {
  const isSelected = topics.includes(topic);
  if (isSelected) {
    onTopicsChange(topics.filter((t) => t !== topic));
  } else {
    onTopicsChange([...topics, topic]);
  }
};
```

**Animation pattern** (from step-familiarity.tsx:56-94):
- Uses `AnimatePresence mode="wait"` for smooth transitions
- `motion.div` with `initial/animate/exit` props
- Auto-advance via `setTimeout` after animation

## Architecture Notes

### State Flow
1. `FOExperience` holds all state via `useState<OnboardingState>`
2. `updateState()` callback passed to child components
3. `nextStep()` increments `currentStep`
4. Each step component checks `if (currentStep !== X) return null`

### Step Integration Pattern
```typescript
// In fo-experience.tsx renderStep()
case 5:
  return (
    <StepSituation
      currentStep={state.currentStep}
      name={state.name}
      value={state.situation}
      onChange={(situation) => updateState({ situation })}
      onContinue={nextStep}
      onSkip={nextStep}
    />
  );
```

## Libraries

- **framer-motion** `^12.23.26` - Use `motion`, `AnimatePresence` from `framer-motion`
- **canvas-confetti** `^1.9.3` - `confetti({ particleCount, spread, origin })` 

## Styling Conventions

### Tailwind Classes (from existing components)
- Container: `max-w-md mx-auto p-8 text-center`
- Headline: `text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200`
- Subtext: `text-gray-600 dark:text-gray-400 mb-6`
- Primary button: `w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`
- Secondary button: `w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors`
- Selected chip: `bg-purple-600 text-white border-purple-600`
- Unselected chip: `border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400`
- Chip container: `flex flex-wrap gap-2 mb-8 justify-center`

## Chip Data (from spec)

### Step 5 - Situation
- Primary: `Feeling stuck, Relationship issues, Career issues, Life changes, Want growth, Self-care reset, Just curious`
- More: `Burnout, Big change, Loneliness, Work pressure, Sleep problems, Motivation loss, Need calm, Need clarity, Want support, Hard day, Hard week, Something happened, No clear reason, Stress, Balance, Time pressure, Energy, Motivation, Purpose, Direction, Expectations, Changes, Decisions, Responsibility, Personal growth, Rest, Sleep, Focus, Boundaries, Overthinking, Emotions, Mental health`

### Step 6 - Feelings
- Primary: `Stressed, Motivated, Anxious, Sad, Restless, Vulnerable, Tired, Excited, Lonely, Frustrated`
- More: `Hopeful, Calm, Tired, Overwhelmed, Confident, Grateful, Happy, Irritable, Peaceful, Content, Focused, Burned out, Joyful, Insecure, Relaxed, Angry`

### Step 7 - What Helps
- Primary: `Rest, Music, Movement, Nature, Being alone, Being with others, Feeling understood, Being reassured, Taking a break`
- More: `Routine, Creativity, Deep breaths, Kind words, Quiet time, Laughter, Letting go, Slowing down, Small wins, Feeling safe`

## Heart Animation Transitions
- After Step 5: "You are doing great - the more you write the better affirmations!"
- After Step 6: "You have been doing great, {name}! We are creating your personalized affirmations."
- Step 7: No heart animation after (proceeds directly to swipe phase)

## Testing

E2E tests use Playwright. Run with: `node --import tsx e2e/fo-01.test.ts`

No specific unit tests for FO-03 components yet - follow existing patterns if adding.