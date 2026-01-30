# Epic Context: [9gv] fo-09: UI Components

## 1. Relevant Code

### Source Files (FO-08 base to copy/modify)

| File | Lines | Purpose |
|------|-------|---------|
| `app/fo-08/types.ts` | 71 | Types, constants. Remove `reflectiveStatement`, rename FO08→FO09 |
| `app/fo-08/actions.ts` | ~614 | Server actions. Import FO-09 agents, 5 affirmations, feedback loop, no summary |
| `app/fo-08/components/fragment-input.tsx` | 200 | Fragment input. Add `mode` prop, remove `reflectiveStatement` prop |
| `app/fo-08/components/step-welcome.tsx` | 103 | Copy as-is, update imports |
| `app/fo-08/components/step-familiarity.tsx` | 97 | Copy as-is, update imports |
| `app/fo-08/components/step-topics.tsx` | 162 | Copy as-is, update imports |
| `app/fo-08/components/heart-animation.tsx` | 69 | Copy as-is (no fo-08 imports) |
| `app/fo-08/components/step-background.tsx` | 61 | Copy as-is (no fo-08 imports) |
| `app/fo-08/components/step-notifications.tsx` | 67 | Copy as-is (no fo-08 imports) |
| `app/fo-08/components/step-paywall.tsx` | 40 | Copy as-is (no fo-08 imports) |
| `app/fo-08/components/step-completion.tsx` | 71 | Copy, will be modified later for accumulated affirmations |

### FO-09 Agents (already exist)

| File | Exports |
|------|---------|
| `src/mastra/agents/fo-09/index.ts` | `fo09DiscoveryAgent`, `createFO09DiscoveryAgent`, `fo09AffirmationAgent`, `createFO09AffirmationAgent` |
| `src/mastra/agents/fo-09/agent.ts` | Discovery agent - complete sentences screen 1, hybrid fragments screens 2+ |
| `src/mastra/agents/fo-09/affirmation-agent.ts` | Generates 5 affirmations per batch (not 10) |

No summary agent exists for FO-09 (intentionally removed).

## 2. Key Types & Interfaces

### types.ts changes (FO-08 → FO-09)

```typescript
// KEEP unchanged:
FIXED_OPENING_QUESTION  // line 13-14
GatheringContext         // lines 20-27
FirstScreenFragmentsResponse  // lines 47-51

// MODIFY - remove reflectiveStatement:
DynamicScreenResponse {
  // reflectiveStatement?: string;  ← REMOVE this field (line 35)
  question: string;
  initialFragments: string[];
  expandedFragments: string[];
  readyForAffirmations: boolean;
  error?: string;
}

// RENAME FO08 → FO09:
FO09GenerateBatchOptions  // was FO08GenerateBatchOptions (lines 56-62)
FO09GenerateBatchResult   // was FO08GenerateBatchResult (lines 67-70)
```

### fragment-input.tsx changes

```typescript
// Current props (line 6-15):
interface FragmentInputProps {
  reflectiveStatement?: string;  // ← REMOVE
  question: string;
  initialFragments: string[];
  expandedFragments: string[];
  value: { text: string };
  onChange: (value: { text: string }) => void;
  onContinue: () => void;
  isLoading?: boolean;
  // ADD: mode?: 'sentences' | 'fragments';  (default: 'fragments')
}

// Key logic to modify (line 66-86):
handleFragmentClick(fragment) {
  // mode='fragments': fragment.replace(/\.{2,}$/, '').trim() + ' '  (existing)
  // mode='sentences': fragment + ' '  (no regex removal)
}
```

### actions.ts changes

```typescript
// Imports: FO-09 agents (no summary agent)
import { createFO09DiscoveryAgent } from '@/src/mastra/agents/fo-09/agent';
import { createFO09AffirmationAgent } from '@/src/mastra/agents/fo-09/affirmation-agent';

// isValidDynamicScreenResponse (lines 54-72): remove reflectiveStatement check
// generateFirstScreenFragments: add topics: string[] param
// generateAffirmationBatchFO09: 5 affirmations, feedback loop
// buildAffirmationPrompt: include loved/discarded/previous sections
// REMOVE: generateSummary function entirely
```

## 3. Architecture Notes

### Data Flow
1. **Discovery phase**: Same as FO-08 (2-5 dynamic screens building `GatheringContext`)
2. **Generation**: `generateAffirmationBatchFO09(context)` → 5 affirmations
3. **Card review**: `AffirmationCardFlow` presents 1 card at a time → user loves/discards
4. **Summary**: `AffirmationSummary` shows all loved, offers "done" or "more"
5. **Feedback loop**: On "more", calls `generateAffirmationBatchFO09` with loved/discarded/previous arrays
6. **Post-review**: Background → Notifications → Paywall → Completion (same as FO-08)

### Key Abstractions
- `mode` prop on `FragmentInput`: controls `'sentences'` (screen 1) vs `'fragments'` (screens 2+)
- Card flow is self-contained: receives 5 affirmations, returns `{ loved[], discarded[] }`
- Summary accumulates across batches (flat list, no batch distinction)

## 4. Conventions

### Styling
- Dark theme: `dark:bg-gray-900`, `dark:text-gray-200`, purple accents (`bg-purple-600`, `text-purple-400`)
- Max width: `max-w-md mx-auto`
- Framer Motion for all animations: `motion.div`, `AnimatePresence`
- `'use client'` directive on all component files

### Component Patterns
- Step components check `currentStep` and return `null` if not active
- Confetti via `canvas-confetti` on selection events
- `data-testid` attributes on interactive elements
- Icons from `lucide-react`

### Server Action Patterns
- `'use server'` directive at top
- Return objects with optional `error` field
- Console logs prefixed: `[fo-09]`, `[fo-09-affirmations]`
- KV template versions: `fo-09-discovery`, `fo-09-affirmation`
- Try-catch with `error instanceof Error ? error.message : 'Unknown error'`

### Import Conventions
```typescript
// External
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
// Internal
import { renderTemplate } from '@/src/services';
import { createFO09DiscoveryAgent } from '@/src/mastra/agents/fo-09/agent';
// Local
import { type GatheringContext } from './types';
import { generateAffirmationBatchFO09 } from '../actions';
```

## 5. New Components Spec

### affirmation-card.tsx
- Props: `{ affirmation: string, onLove: () => void, onDiscard: () => void }`
- Large centered card, "Love it" (purple) + "Discard" (neutral) buttons
- Slide-left exit animation via Framer Motion

### affirmation-card-flow.tsx
- Props: `{ affirmations: string[], onComplete: (loved: string[], discarded: string[]) => void }`
- Progress bar at top with "3/5" counter
- Renders one `AffirmationCard` at a time
- `AnimatePresence` for slide-left transitions

### affirmation-summary.tsx
- Props: `{ lovedAffirmations: string[], onDone: () => void, onMore: () => void }`
- Flat list of loved affirmations, count display
- Two buttons: "I am good with these" / "I want to create more"
- Empty state: "None of those resonated?" + single "Generate new" button

## 6. Testing

- E2E test location: `e2e/fo-09.test.ts`
- Run: `node --import tsx e2e/fo-09.test.ts`
- Patterns: See `docs/current/e2e-testing.md`
- Key test scenarios: sentence mode click, fragment mode click, card review flow, summary with/without loved affirmations, feedback loop cycle