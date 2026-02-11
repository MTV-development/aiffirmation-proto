# Implementation Notes — FO-11

> Epic workers: read this before starting. Append your section when done.
> Captures patterns established, gotchas discovered, and decisions made across epics.

---

### Epic: Foundation (Types, Agents, Seeds, Actions) — ybk

**Completed:** 2026-02-11

**Files created:**
- `app/fo-11/types.ts` — FO11DiscoveryResponse (with skip), FO11OnboardingData (variable-length exchanges), FO11GenerateBatchOptions/Result, FO11_GOAL_QUESTION constant
- `src/mastra/agents/fo-11/discovery-agent.ts` — Intent-based discovery agent with DEFAULT_INSTRUCTIONS covering skip logic, question adaptation, chip format per step
- `src/mastra/agents/fo-11/affirmation-agent.ts` — Based on FO-10 but without familiarity references, supports 2 or 3 exchange flows
- `src/mastra/agents/fo-11/index.ts` — Re-exports both agents
- `src/db/seeds/fo-11.ts` — 12 seed entries (6 discovery + 6 affirmation)
- `app/fo-11/actions.ts` — generateDiscoveryStep() and generateAffirmationBatchFO11()

**Files modified:**
- `src/db/seeds/index.ts` — Added fo11Seeds import and spread

**Patterns established:**
- Discovery agent version namespace: `fo-11-discovery` (different from FO-10's `fo-10-chip`)
- Affirmation agent version namespace: `fo-11-affirmation`
- Server action `generateDiscoveryStep(stepNumber: 5|6, context)` returns `FO11DiscoveryResponse` with skip signal
- Step 6 has a safety guard: even if agent returns skip=true, it is forced to false
- No familiarity passed to any agent — kept in types for UI only
- KV store templates use `conversation_history` variable (formatted as Q/A pairs) and `name`

**Key decisions:**
- No FO10_QUESTIONS-style array — only step 4 has a fixed question (FO11_GOAL_QUESTION)
- Discovery response parsing validates skip (boolean) + question (string) + initialChips/expandedChips (string arrays)
- Affirmation action is nearly identical to FO-10's but uses fo-11-affirmation templates and omits familiarity from prompts
