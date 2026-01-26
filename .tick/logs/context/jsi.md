# Epic Context: jsi - FO-06: Server Actions

## Relevant Code
- `app/fo-05/actions.ts` - Reference server actions (559 lines)
- `src/mastra/agents/fo-06/` - FO-06 agent definitions

## Architecture
- Server actions are marked with 'use server' directive
- Actions use factory functions to create agents (e.g., `createFO06DiscoveryAgent`)
- Responses are JSON parsed from agent text output
- GatheringContext holds user profile and conversation history

## Key Changes from FO-05

### GatheringContext Type (simplified)
FO-05 has:
```typescript
interface GatheringContext {
  name: string;
  familiarity: 'new' | 'some' | 'very';
  initialTopic: string;
  exchanges: Array<{...}>;
  screenNumber: number;
}
```

FO-06 simplified (no familiarity, no initialTopic):
```typescript
interface GatheringContext {
  name: string;
  exchanges: Array<{ question: string; answer: { text: string } }>;
  screenNumber: number;
}
```

### DynamicScreenResponse (no reflectiveStatement)
FO-05: `{ reflectiveStatement, question, initialFragments, expandedFragments, readyForAffirmations }`
FO-06: `{ question, initialFragments, expandedFragments, readyForAffirmations }`

### New Action: generateFirstScreenFragments
- For screen 1 with fixed opening question
- Takes just the name
- Calls agent with the fixed question to get fragments
- Returns: `{ initialFragments, expandedFragments }`

### Modified Action: generateDynamicScreen
- Returns response WITHOUT reflectiveStatement
- Used for screens 2+ only

## Fixed Opening Question
"What's going on in your life right now that made you seek out affirmations?"

## Testing
- TypeScript check: `npx tsc --noEmit`
- Lint: `npm run lint`
