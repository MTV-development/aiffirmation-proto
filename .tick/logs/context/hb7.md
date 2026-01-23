# Epic Context: [hb7] FO-03: Onboarding Steps 0-4

## Relevant Code

### Reference Components (FO-02 patterns to follow)

| File | Purpose |
|------|---------|
| `app/fo-02/components/fo-experience.tsx` | Main state manager - **key pattern** for state interface, updateState helper, goToStep/nextStep handlers |
| `app/fo-02/components/step-welcome.tsx` | Welcome steps (0-2) pattern - single component handling multiple steps via `currentStep` prop |
| `app/fo-02/components/step-intent.tsx` | **Chip selection pattern** - toggleTopic(), chip styling, multi-select behavior |
| `app/fo-02/components/swipe-phase.tsx` | Framer Motion animation patterns |

### Key Interfaces & Types

**FO-02 OnboardingState** (`fo-experience.tsx:22-42`):
```typescript
interface OnboardingState {
  currentStep: number;
  name: string;
  // ... batch/swipe state
}
```

**FO-03 Required State** (from spec):
```typescript
interface FO03OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very' | null;
  topics: string[];
  situation: { text: string; chips: string[] };
  feelings: { text: string; chips: string[] };
  whatHelps: { text: string; chips: string[] };
}
```

### Target Files to Create

| File | Task |
|------|------|
| `app/fo-03/components/fo-experience.tsx` | [h6b] Main state manager shell |
| `app/fo-03/components/step-welcome.tsx` | [ziv] Steps 0-2 |
| `app/fo-03/components/step-familiarity.tsx` | [8kg] Step 3 with confetti |
| `app/fo-03/components/step-topics.tsx` | [k9v] Step 4 multi-select |

### Update Required
`app/fo-03/page.tsx` - Import and render `FOExperience` (currently placeholder)

## Architecture Notes

### Data Flow
1. `page.tsx` renders `FOExperience`
2. `FOExperience` manages all state, passes props to step components
3. Step components call `onContinue`/`nextStep` to advance
4. State updates via `updateState({ field: value })`

### Step Component Pattern
```typescript
// Props interface
interface StepXProps {
  currentStep: number;
  name: string;
  // ... step-specific state
  onFieldChange: (value: T) => void;
  onContinue: () => void;
}

// Return null if not relevant step
if (currentStep !== X) return null;
```

### Chip Toggle Pattern (from step-intent.tsx:44-58)
```typescript
const toggleTopic = (topic: string) => {
  const isSelected = selectedTopics.includes(topic);
  if (isSelected) {
    onTopicsChange(selectedTopics.filter((t) => t !== topic));
  } else {
    onTopicsChange([...selectedTopics, topic]);
  }
};
```

### Chip Styling
```css
/* Selected */
bg-purple-600 text-white border-purple-600

/* Unselected */
border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
```

## External References

### Confetti Animation
- Package: `canvas-confetti` (needs install: `npm install canvas-confetti @types/canvas-confetti`)
- Basic usage:
```typescript
import confetti from 'canvas-confetti';
confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
```

### Framer Motion (already installed v12.23.26)
```typescript
import { motion, AnimatePresence } from 'framer-motion';
// Fade in/out pattern from swipe-phase.tsx:176-191
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
```

## Testing Patterns

E2E tests use Playwright. See `e2e/fo-01.test.ts` for pattern. For this epic, manual testing via `npm run dev` is expected per docs.

## Conventions

### Styling
- Tailwind CSS classes
- Purple primary: `bg-purple-600`, `hover:bg-purple-700`
- Dark mode: `dark:bg-gray-800`, `dark:text-gray-200`
- Button disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Container: `max-w-md mx-auto p-8`

### Components
- `'use client';` directive for client components
- Props interface above component
- JSDoc comment describing component purpose
- Conditional rendering via `if (currentStep !== X) return null;`

### State Management
- Single source of truth in `FOExperience`
- `useCallback` for handler functions
- Partial updates: `setState(prev => ({ ...prev, ...updates }))`

### Transitions
- Step 3 → confetti + "Super, {name}!" message → auto-advance
- Step 4 → confetti + "Great choices!" → advance on Continue

### Topic Chips (Step 4)
Full list from spec: Motivation, Focus, Inner peace, Energy boost, Better sleep, Body peace, Self-worth, Boundaries, Letting go, Healing, Gratitude, Positivity, Resilience, Anxiety relief, Stress relief, Courage, Hope, Joy, Patience, Mindfulness, Self-care, Forgiveness, Connection, Self-love, Breakup healing, Impulse control, Digital detox, Productivity, Morning boost, Night calm, Confidence, Calm, Self-discipline, Overthinking, Grief, Loneliness