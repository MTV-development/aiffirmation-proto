# Epic Context: [yc4] FO-03: Post-Swipe Mockups

## Relevant Code

### Files to Create
| File | Purpose |
|------|---------|
| `app/fo-03/components/step-background.tsx` | Background selection mockup (Step 10) |
| `app/fo-03/components/step-notifications.tsx` | Notification frequency mockup (Step 11) |
| `app/fo-03/components/step-paywall.tsx` | Light paywall mockup (Step 12) |
| `app/fo-03/components/step-completion.tsx` | Final completion screen (Step 13) |

### Files to Modify
| File | Purpose |
|------|---------|
| `app/fo-03/components/fo-experience.tsx:568-619` | Replace placeholder steps 10-13 with actual components |

### Reference Files
| File | Key Patterns |
|------|--------------|
| `app/fo-02/components/step-illustrative.tsx` | Contains working StepBackground, StepNotifications, StepPaywall implementations to reference |
| `app/fo-02/components/step-completion.tsx` | Working completion screen with affirmation list display |
| `app/fo-03/components/step-checkpoint.tsx` | Current component styling patterns and props structure |

## Architecture Notes

### Component Pattern
All step components follow this structure:
```typescript
'use client';

export interface StepXProps {
  name?: string;  // User's name for personalization
  onContinue: () => void;  // Advances to next step
}

export function StepX({ name, onContinue }: StepXProps) {
  const [localState, setLocalState] = useState(...);  // Selection state (non-persistent)
  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">...</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">...</p>
      {/* UI content */}
      <button onClick={onContinue} className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg...">
        Continue
      </button>
    </div>
  );
}
```

### State Flow (fo-experience.tsx)
- State interface `OnboardingState` at line 136-157 includes:
  - `approvedAffirmations: string[]` - needed for Step 13
  - `name: string` - needed for personalized headlines
  - `currentStep: number` - 0-13 range
- `nextStep()` at line 214 increments step
- `goToStep(n)` at line 204 navigates to specific step

### Integration Points (fo-experience.tsx:568-619)
Current placeholders for Steps 10-13 need replacement:
- Step 10 (line 568-580): `<StepBackground onContinue={nextStep} />`
- Step 11 (line 582-594): `<StepNotifications onContinue={nextStep} />`
- Step 12 (line 596-608): `<StepPaywall onContinue={nextStep} />`
- Step 13 (line 610-619): `<StepCompletion name={state.name} approvedAffirmations={state.approvedAffirmations} />`

## UI Specifications (from spec)

### Step 10 - Background
- Headline: "Make your affirmations look beautiful"
- Text: "Choose a background for your affirmations — you can always explore more later."
- UI: Grid of 4-6 placeholder background images (gradients work)
- Selection highlights but does not persist
- CTA: Continue

### Step 11 - Notifications  
- Headline: "Set up reminders with your personal affirmations"
- Text: "Affirmations work best when they gently meet you again and again."
- Question: "How many times a day would you like one sent to you?"
- UI: Frequency buttons (1, 2, 3, 5 times)
- Non-functional selection
- CTA: Continue

### Step 12 - Light Paywall
- Headline: "More support, whenever you want"
- Text: "Get 3 days free of premium. With Premium, you can create hundreds of lists..."
- CTAs: "Try free for 3 days" / "Not now" (both proceed)

### Step 13 - Completion
- Headline: "You are all set, {name} - this is your list!"
- Display: List of all `approvedAffirmations`
- Scrollable list with cards
- CTA: "See my affirmations" (shows list inline per spec)

## Styling Conventions

### Colors (Tailwind)
- Primary: `bg-purple-600 hover:bg-purple-700` (buttons)
- Selected state: `ring-3 ring-purple-600`, `border-purple-600 bg-purple-50 dark:bg-purple-900/20`
- Text: `text-gray-800 dark:text-gray-200` (headings), `text-gray-600 dark:text-gray-400` (body)
- Secondary buttons: `text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`

### Layout
- Container: `max-w-md mx-auto p-8`
- Center text: `text-center`
- Spacing: `mb-2` (headline to subtext), `mb-8` (content to CTA)

### Reference Background Options (from FO-02)
```typescript
const BACKGROUND_OPTIONS = [
  { id: 'gradient-sunset', colors: 'from-orange-400 via-pink-500 to-purple-600', label: 'Sunset' },
  { id: 'gradient-ocean', colors: 'from-cyan-400 via-blue-500 to-blue-700', label: 'Ocean' },
  // ... see step-illustrative.tsx:11-21
];
```

### Reference Frequency Options (from FO-02)
```typescript
const FREQUENCY_OPTIONS = [
  { value: 1, label: '1x daily', description: 'One gentle reminder each day' },
  { value: 3, label: '3x daily', description: 'Morning, afternoon, and evening' },
  // ... see step-illustrative.tsx:24-29
];
```

## Testing

No E2E tests required for mockup screens. Manual verification:
1. Navigate through full flow from Step 0 to Step 13
2. Verify selections work (highlight on click)
3. Verify CTAs advance steps correctly
4. Verify Step 13 displays approvedAffirmations list

## Key Differences from FO-02

- FO-03 uses separate component files (step-background.tsx, etc.) vs FO-02's combined step-illustrative.tsx
- FO-03 Step 13 shows affirmation list directly (not behind button click like FO-02)
- FO-03 frequency options per spec: 1, 2, 3, 5 times (not 1, 3, 5, None like FO-02)