# Epic Context: t7n - FO-05: Onboarding Flow

## Relevant Code
- `app/fo-04/components/fo-experience.tsx` - Main state manager (~2200 lines)
- `app/fo-04/components/step-*.tsx` - Step components to copy
- `app/fo-04/components/swipe-phase.tsx` - Swipe component
- `app/fo-04/components/heart-animation.tsx` - Transition animation
- `app/fo-04/components/dynamic-input.tsx` - Reference for step-dynamic
- `app/fo-05/components/fragment-input.tsx` - New fragment input (to be created in l33)
- `app/fo-05/actions.ts` - FO-05 server actions (already created)

## Architecture
- FOExperience is the main state manager with 12 steps
- Each step component receives callbacks and state from parent
- Steps: Welcome (0-2), Familiarity (3), Topics (4), Dynamic (5+), Swipe, Checkpoint, Mockups, Completion
- Framer Motion for animations, canvas-confetti for celebrations

## Key Differences from FO-04
- Use FragmentInput instead of DynamicInput in step-dynamic
- DynamicScreenData uses initialFragments/expandedFragments
- Value is just { text: string } (no selectedChips)

## Testing
- Build command: `npm run build`

## Conventions
- Copy step components as-is (they work the same)
- Only modify step-dynamic.tsx to use FragmentInput
- Update imports in fo-experience.tsx to use FO-05 actions
