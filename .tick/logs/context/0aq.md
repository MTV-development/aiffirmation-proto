# Epic Context: 0aq - fo-07: Server Actions

## Relevant Code
- `app/fo-04/actions.ts` - Reference implementation for chip-based discovery
- `app/fo-06/actions.ts` - Reference for summary generation patterns
- `src/mastra/agents/fo-07/` - FO-07 agents created in previous epic

## Architecture
- Server actions are in `app/fo-07/actions.ts` with 'use server' directive
- FO-07 uses chip-based input (like FO-04) not fragment-based (like FO-06)
- Three main actions needed:
  1. `generateDynamicScreen` - Same as FO-04
  2. `generateAffirmations20` - Generate all 20 at once (no feedback loop)
  3. `generateReviewSummary` - Single summary for review screen header

## Key Differences from FO-04
- No batch numbers (single call for all 20)
- No feedback loop (no approved/skipped tracking for affirmation generation)
- New summary action for review screen (simpler than FO-06's pre/post)

## Files to Create
- `app/fo-07/actions.ts`

## Interfaces Needed
```typescript
// Same as FO-04
export interface GatheringContext {
  name: string;
  familiarity: 'new' | 'some' | 'very';
  initialTopic: string;
  exchanges: Array<{
    question: string;
    answer: {
      text: string;
      selectedChips: string[];
    };
  }>;
  screenNumber: number;
}

export interface DynamicScreenResponse {
  reflectiveStatement: string;
  question: string;
  initialChips: string[];
  expandedChips: string[];
  readyForAffirmations: boolean;
  error?: string;
}

// NEW for FO-07
export interface GenerateAffirmations20Result {
  affirmations: string[];
  error?: string;
}
```

## Testing
- Run `npx tsc --noEmit` to verify TypeScript compilation

## Conventions
- Use console.log with `[fo-07]` prefix for debugging
- Return error objects with graceful degradation (empty arrays, empty strings)
- Import agents from `@/src/mastra/agents/fo-07/`
