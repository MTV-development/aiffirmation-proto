# Epic Context: ikj - FO-06: Agents & KV Store

## Relevant Code
- `src/mastra/agents/fo-05/agent.ts` - Reference discovery agent (FO-06 needs simplified version)
- `src/mastra/agents/fo-05/affirmation-agent.ts` - Reference affirmation agent (can mostly copy)
- `src/mastra/agents/fo-05/summary-agent.ts` - Reference summary agents (can mostly copy)
- `src/mastra/agents/fo-05/index.ts` - Reference exports
- `src/db/seed.ts` - KV store seed script to extend

## Architecture
- Agents are created using `new Agent()` from `@mastra/core/agent`
- Each agent has DEFAULT_INSTRUCTIONS and a factory function for KV-backed versions
- Factory functions use `getAgentSystemPrompt()` and `getAgentModelName()` from services
- KV keys follow pattern: `versions.{agent-id}.{keyName}.{implementation}`

## Key Changes from FO-05

### Discovery Agent (`agent.ts`)
**FO-05 has:**
- Rich prompt with 5 dimensions (Emotional Baseline, Inner Dialogue, Needs & Longings, Believability Threshold, Life Context)
- Response: `{ reflectiveStatement, question, initialFragments, expandedFragments, readyForAffirmations }`

**FO-06 needs:**
- Minimal prompt: "2-5 exchanges to understand why user wants affirmations"
- Response: `{ question, initialFragments, expandedFragments, readyForAffirmations }` (NO reflectiveStatement)
- Question should incorporate reflection: "one sentence reflecting what we know + asking what matters most"

### Affirmation Agent
- Can mirror FO-05, just update agent ID to `fo-06-affirmation-agent`

### Summary Agent
- Can mirror FO-05 pre/post summary agents, update agent IDs to `fo-06-*`

## KV Store Entries to Add

Following FO-05 pattern in seed.ts:
- `versions.fo-06-discovery._info.default`
- `versions.fo-06-discovery._model_name.default`
- `versions.fo-06-discovery._temperature.default`
- `versions.fo-06-discovery.system.default`
- Similar entries for fo-06-affirmation, fo-06-pre-summary, fo-06-post-summary

## Testing
- TypeScript check: `npx tsc --noEmit`
- Lint: `npm run lint`
- Seed: `npm run db:seed`

## Spec Reference
Full spec at: `docs/projects/2026-01-26-fo-06/2026-01-26-fo-06-spec.md`
