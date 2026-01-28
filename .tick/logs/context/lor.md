# Epic Context: lor - fo-08: Main Experience Flow

## Relevant Code

- `app/fo-07/components/fo-experience.tsx` - Main flow controller (preferred base)
- `app/fo-06/components/fo-experience.tsx` - Alternative with fragment mechanics
- `app/fo-08/components/` - Where FO-08 components live
- `app/fo-08/actions.ts` - Server actions for API calls
- `app/fo-08/page.tsx` - Entry point

## Architecture

- `fo-experience.tsx` is the main orchestrator component
- Uses React state for step tracking and data collection
- Renders different step components based on currentStep
- Heart animation between dynamic screens (not confetti)
- No progress bar

## Step Flow (per spec)

- Step 0: Welcome intro
- Step 1: Name input
- Step 2: Personalized welcome
- Step 3: Familiarity
- Step 4: Topics selection
- Step 5+: Dynamic screens (2-5 screens with hybrid fragments)
- Affirmation generation (loading state)
- Affirmation review (thumbs up/down)
- Background mockup
- Notifications mockup
- Paywall mockup
- Completion

## State Management

Track:
- currentStep
- name
- familiarity
- topics
- gatheringContext (exchanges)
- affirmations
- summary
- likedAffirmations

## Key Integrations

1. Import and use FO-08's components
2. Use heart animation between dynamic screens
3. NO progress bar
4. Use FO-08's actions for API calls
5. Pass `reflectiveStatement` to step-dynamic

## Testing

- Verify file exists
- Grep for step-topics import (confirms right structure)
- Grep for no 'progress' (confirms no progress bar)

## Conventions

- Client component ('use client')
- Use Tailwind for styling
- Framer Motion for animations
