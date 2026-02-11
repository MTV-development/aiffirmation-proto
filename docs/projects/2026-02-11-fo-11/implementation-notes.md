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

---

### Epic: UI (Components, State Machine, Pages) — 69h

**Completed:** 2026-02-11

**Files created:**
- `app/fo-11/components/step-welcome.tsx` — Steps 0-2, copied from FO-10
- `app/fo-11/components/step-familiarity.tsx` — Step 3, copied from FO-10 (cosmetic only)
- `app/fo-11/components/step-goal.tsx` — Step 4, uses FO11_GOAL_QUESTION instead of FO10_QUESTIONS[0]
- `app/fo-11/components/heart-animation.tsx` — Transition animation, copied from FO-10
- `app/fo-11/components/affirmation-card-flow.tsx` — Card review, copied from FO-10
- `app/fo-11/components/affirmation-card.tsx` — Single card, copied from FO-10
- `app/fo-11/components/affirmation-summary.tsx` — Summary screen, copied from FO-10
- `app/fo-11/components/step-background.tsx` — Step 10, copied from FO-10
- `app/fo-11/components/step-notifications.tsx` — Step 11, copied from FO-10
- `app/fo-11/components/step-paywall.tsx` — Step 12, copied from FO-10
- `app/fo-11/components/step-completion.tsx` — Step 13, copied from FO-10
- `app/fo-11/components/fragment-input.tsx` — Extended with mode="words" and helperText prop
- `app/fo-11/components/step-context.tsx` — NEW: Step 5, LLM question + fragments (skippable)
- `app/fo-11/components/step-tone.tsx` — NEW: Step 6, LLM question + single-word chips
- `app/fo-11/components/fo-experience.tsx` — NEW: Main state machine with skip logic (steps 0-13)
- `app/fo-11/page.tsx` — Page entry point
- `app/fo-11/layout.tsx` — Server layout
- `app/fo-11/fo-11-layout-client.tsx` — Client layout with TopSubmenu
- `app/fo-11/info/page.tsx` — Info page describing Guided Discovery Hybrid

**Files modified:**
- `nav.config.ts` — Added FO-11 entry after FO-10
- `app/overview/page.tsx` — Added FO-11 card and comparison table row

**Patterns established:**
- FragmentInput mode="words": removes max-w-[200px] and whitespace-normal/text-left, adds text-center for compact single-word pills
- FragmentInput helperText prop: optional subtitle text below the question
- State machine uses separate input fields (goalInput, contextInput, toneInput) instead of indexed array
- Skip logic chains: handleGoalContinue calls generateDiscoveryStep(5), if skip=true immediately chains to generateDiscoveryStep(6)
- heartAnimationCompleted + useEffect pattern handles case where animation finishes before data loads

**Key decisions:**
- step-context and step-tone get their question from props (LLM-generated), not from constants
- State machine simplified vs FO-10: no discoveryStep index or discoveryInputs array, uses named fields
- StepCompletion uses HTML entities (&#x1F49C; and &#x2726;) instead of literal emoji to avoid encoding issues
- FO-11 total steps: 14 (0-13) vs FO-10's 15 (0-14)
