# Epic Context: [9ix] FO-03: Swipe Phase

## 1. Relevant Code

### Reference Files (FO-02)
- **`app/fo-02/components/swipe-phase.tsx`** - Base swipe card component to copy
  - `SwipePhase` component with props: `affirmation`, `index`, `total`, `onSwipe`, `isLoading`
  - `SwipeDirection` type: `'up' | 'down'` (up=discard, down=keep)
  - Uses Framer Motion: `motion`, `useMotionValue`, `useTransform`, `useAnimation`, `AnimatePresence`
  - `SWIPE_THRESHOLD = 100` for drag detection
  - Inner `SwipeCard` component handles drag and keyboard (Arrow keys)
  - Toast notifications on swipe (`Successfully saved` / `Discarded`)

- **`app/fo-02/components/step-checkpoint.tsx`** - Reference checkpoint UI
  - Props: `name`, `batchNumber`, `approvedCount`, `onContinue`, `onFinish`
  - Three variants: batch 1, batch 2, batch 3 (final)
  - Pattern: headline, text, CTA buttons

- **`app/fo-02/components/generation-loading.tsx`** - Loading states between batches
  - Props: `name`, `batchNumber`, `error`, `onRetry`
  - Copy varies by batch number

- **`app/fo-02/components/fo-experience.tsx:283-353`** - Swipe flow integration pattern
  - Step 5 renders swipe phase
  - Checks `hasMoreInBatch()` to show checkpoint
  - Calls `generateBatch()` on continue

### Target Files (FO-03)
- **`app/fo-03/actions.ts`** - Server action ready to use
  - `generateAffirmationBatchFO03(options)` - already implemented
  - `FO03GenerateBatchOptions` interface includes all onboarding fields
  - Returns `{ affirmations: string[], error?: string }`

- **`app/fo-03/components/fo-experience.tsx`** - Current state
  - Steps 0-7 implemented (onboarding questions)
  - Steps 8-9 are placeholders (`TODO`) for swipe phase
  - Has `OnboardingState` with swipe fields ready but unused
  - Has chip constants defined for situation/feelings/whatHelps

### Existing FO-03 Components
- `step-welcome.tsx`, `step-familiarity.tsx`, `step-topics.tsx` - onboarding
- `text-with-chips.tsx` - combined text + chip input
- `heart-animation.tsx` - transition animation between steps

## 2. Architecture Notes

### Data Flow
1. User completes Steps 0-7 → `FO03OnboardingData` populated
2. After Step 7 → trigger `generateAffirmationBatchFO03({ ...onboardingData, batchNumber: 1 })`
3. Swipe through 10 cards → track `approvedAffirmations` / `skippedAffirmations`
4. Show checkpoint → user chooses continue or stop
5. If continue → `generateAffirmationBatchFO03({ ..., batchNumber: 2, approvedAffirmations, skippedAffirmations })`
6. Max 3 batches or user stops → show transition → Step 10

### State Shape (already in fo-experience.tsx)
```typescript
interface OnboardingState {
  currentBatch: string[];           // Current 10 affirmations
  currentBatchNumber: number;       // 1, 2, or 3
  isGenerating: boolean;
  generationError: string | null;
  currentCardIndex: number;         // 0-9 within batch
  approvedAffirmations: string[];   // Accumulated across batches
  skippedAffirmations: string[];    // Accumulated across batches
}
```

### FO-03 Swipe Messaging (from spec)
- **First card intro**: `"Save this affirmation if it feels right — or discard it if it doesn't. You are forming your personal list now."`
- **After first action**: `"Keep going {name} - every time you like or discard an affirmation we prepare even better affirmations for you."`

### FO-03 Checkpoint Content (from spec)
- **Step 8** (after batch 1): "Perfect, {name}!" / "The ones you liked are now on your personal affirmation list..." / CTAs: Continue | "I'm good with the affirmations I chose"
- **Step 9** (after batch 2+): "Great job, {name}!" / "Your list is getting stronger..." / CTAs: Yes, please | No, continue
- **Transition to post-swipe**: "Perfect, {name}! You now have a strong list of personal affirmations..."

## 3. Key Patterns

### Swipe Handler Pattern (from FO-02)
```typescript
const handleSwipe = (direction: SwipeDirection, affirmation: string) => {
  if (direction === 'down') {
    approveAffirmation(affirmation);  // down = keep
  } else {
    skipAffirmation(affirmation);     // up = discard
  }
};
```

### Batch Completion Check
```typescript
if (!hasMoreInBatch()) {
  // Show checkpoint
} else {
  // Show SwipePhase
}
```

### Server Action Call
```typescript
await generateAffirmationBatchFO03({
  name: state.name,
  familiarity: state.familiarity ?? 'new',
  topics: state.topics,
  situation: state.situation,
  feelings: state.feelings,
  whatHelps: state.whatHelps,
  batchNumber,
  approvedAffirmations: state.approvedAffirmations,
  skippedAffirmations: state.skippedAffirmations,
});
```

## 4. Conventions

- Components are `'use client'` with Tailwind styling
- Color scheme: purple-600 primary, gray-50/gray-900 bg, gray-400/gray-600 text
- Button patterns: primary (`bg-purple-600`), secondary (text-only with hover)
- Framer Motion for animations
- Toast notifications for swipe feedback
- No emoji in component copy unless in spec

## 5. Files to Create

1. **`app/fo-03/components/swipe-phase.tsx`** - Copy from FO-02, add intro/feedback messaging
2. **`app/fo-03/components/step-checkpoint.tsx`** - New with Step 8, Step 9, and transition variants

## 6. Files to Modify

1. **`app/fo-03/components/fo-experience.tsx`**
   - Import new components
   - Add `generateBatch` function using `generateAffirmationBatchFO03`
   - Update Steps 8-9 case to render swipe/checkpoint flow
   - Add transition screen before Step 10