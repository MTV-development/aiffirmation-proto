# Epic Context: ywq - FO-06: UI Components

## Relevant Code
- `app/fo-05/components/` - Reference UI components
- `app/fo-06/actions.ts` - FO-06 server actions (already created)

## Architecture
- Components are client-side ('use client')
- FOExperience is the main state container
- State machine with currentStep controlling which component renders
- Fragment UI uses Framer Motion for animations

## Key Changes from FO-05

### NO PROGRESS BAR
The progress bar in FO-05 (lines 527-540 in fo-experience.tsx) should be REMOVED entirely.

### Simplified Flow (no welcome/familiarity/topic selection)
FO-05 steps:
- 0-2: Welcome screens
- 3: Familiarity selection
- 4: Topic selection
- 5: Dynamic screens
- 6: Unused
- 7-8: Swipe phase
- 9-11: Mockups
- 12: Completion

FO-06 steps:
- 0: Name input ONLY (not welcome screens)
- 1-5: Dynamic investigation screens (2-5)
- 6: Ready screen
- 7-8: Swipe phase
- 9-11: Mockups
- 12: Completion

### GatheringContext (simplified)
```typescript
interface GatheringContext {
  name: string;
  exchanges: Array<{ question: string; answer: { text: string } }>;
  screenNumber: number;
}
```
NO familiarity, NO initialTopic

### DynamicScreenResponse (no reflectiveStatement)
```typescript
interface DynamicScreenResponse {
  question: string;
  initialFragments: string[];
  expandedFragments: string[];
  readyForAffirmations: boolean;
}
```

### Fixed Opening Question
Screen 1: "What's going on in your life right now that made you seek out affirmations?"
- Use `generateFirstScreenFragments(name)` to get fragments for this question
- Screens 2+: Use `generateDynamicScreen(context)` which returns dynamic question

### fragment-input.tsx Changes
- Remove reflectiveStatement prop or make it optional
- Question-only display (no separate reflective statement section)

### step-dynamic.tsx Changes
- Screen 1: Use fixed question + generateFirstScreenFragments
- Screens 2+: Use generateDynamicScreen (no reflectiveStatement)
- Simpler answer object: `{ text: string }` not `{ text, selectedFragments }`

## Files to Create/Copy

1. `fragment-input.tsx` - Adapt from FO-05 (make reflectiveStatement optional)
2. `step-dynamic.tsx` - New logic for fixed screen 1 + dynamic screens 2+
3. `swipe-phase.tsx` - Copy from FO-05
4. `step-ready.tsx` - Copy from FO-05
5. `step-checkpoint.tsx` - Copy from FO-05
6. `step-background.tsx` - Copy from FO-05
7. `step-notifications.tsx` - Copy from FO-05
8. `step-paywall.tsx` - Copy from FO-05
9. `step-completion.tsx` - Copy from FO-05
10. `heart-animation.tsx` - Copy from FO-05 if used
11. `fo-experience.tsx` - Major rewrite: no progress bar, simplified flow

## Testing
- TypeScript check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Manual: Navigate to /fo-06
