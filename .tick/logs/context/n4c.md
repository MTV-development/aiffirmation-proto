# Epic Context: n4c - FO-04: Onboarding Flow

## Relevant Code
- `app/fo-03/components/` - Components to copy/adapt
  - `step-welcome.tsx` (Steps 0-2)
  - `step-familiarity.tsx` (Step 3)
  - `step-topics.tsx` (Step 4)
  - `heart-animation.tsx`
  - `swipe-phase.tsx`
  - `step-checkpoint.tsx`
  - `step-background.tsx`, `step-notifications.tsx`, `step-paywall.tsx`
  - `step-completion.tsx`
  - `fo-experience.tsx` - Main orchestrator
- `app/fo-03/actions.ts` - Server actions pattern
- `app/fo-04/components/dynamic-input.tsx` - New component
- `docs/projects/2026-01-23-FO-04/2026-01-23-FO-04-spec.md` - Full spec

## Architecture
- Single fo-experience component manages all state
- Step components render based on currentStep
- Server actions for AI calls (discovery + affirmation generation)
- GatheringContext accumulates conversation history

## Flow (from spec)
1. Steps 0-2: Welcome (identical to FO-03)
2. Step 3: Familiarity selection
3. Step 4: Topic selection
4. Steps 5+: Dynamic screens (2-5 AI-generated)
5. Swipe phase with batch generation
6. Post-swipe mockups
7. Completion screen

## Testing
- E2E test in e2e/fo-04.test.ts
- Manual flow verification

## Conventions
- OnboardingState interface for all state
- updateState() for partial updates
- nextStep(), prevStep() for navigation
