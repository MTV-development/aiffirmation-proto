# Epic Context: tz2 - FO-05 Summary: UI Integration

## Relevant Code
- `app/fo-05/components/step-completion.tsx` - Completion screen to update
- `app/fo-05/components/fo-experience.tsx` - Main state manager
- `app/fo-05/actions.ts` - Server actions (will have generateCompletionSummary)

## Architecture
- FOExperience manages all state including gatheringContext
- StepCompletion receives props from FOExperience
- State updates via useState and callback pattern
- Summary should be generated when entering completion step

## Testing
- Build command: `npm run build`
- E2E test: `node --import tsx e2e/fo-05.test.ts`

## Conventions
- Components are client components ('use client')
- Use Tailwind for styling
- Purple accent colors for feature boxes
- OnboardingState interface for all state fields
