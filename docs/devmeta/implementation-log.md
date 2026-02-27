# Implementation Log

Chronological record of what was built in each version.

## Epoch 01 — Full Onboarding Exploration

### FO-01 — 2026-01-16
**First full onboarding prototype**
- Basic AI-powered affirmation flow
- Key files: `app/fo-01/`, `docs/projects/2026-01-16-full-onboarding-01/SPEC.md`

### FO-02 — 2026-01-17
**Refined onboarding flow**
- Iterated on FO-01's approach
- Key files: `app/fo-02/`, `docs/projects/2026-01-17-FO-02/SPEC.md`

### FO-03 — 2026-01-23
**Alternative interaction pattern**
- Explored different discovery interactions
- Key files: `app/fo-03/`, `docs/projects/2026-01-23-FO-03/`

### FO-04 — 2026-01-23
**Design-informed iteration**
- Incorporated Trine's design feedback
- Key files: `app/fo-04/`, `docs/projects/2026-01-23-FO-04/`

### FO-05 — 2026-01-24/25
**Two iterations: summary and full version**
- Summary spec (Jan 24): `docs/projects/2026-01-24-fo-05-summary/`
- Full spec (Jan 25): `docs/projects/2026-01-25-fo-05/`
- Key files: `app/fo-05/`

### FO-06 — 2026-01-26
**Continued refinement + Mastra upgrade**
- Developed alongside Mastra 1.0 upgrade
- Key files: `app/fo-06/`, `docs/projects/2026-01-26-fo-06/`

### FO-07 — 2026-01-27
**Flow design iteration**
- Key files: `app/fo-07/`, `docs/projects/2026-01-27-fo-07/`

### FO-08 — 2026-01-28
**Flow design iteration**
- Key files: `app/fo-08/`, `docs/projects/2026-01-28-fo-08/`

### FO-09 — 2026-01-30
**Chip-based discovery**
- Introduced chip-based interaction patterns
- Key files: `app/fo-09/`, `docs/projects/2026-01-30-fo-09/`

### FO-10 — 2026-02-09
**Copy-modify-iterate established**
- Chip discovery interactions refined
- Established the copy-modify-iterate development pattern
- Key files: `app/fo-10/`, `docs/projects/2026-02-09-fo-10/`

### FO-11 — 2026-02-11
**Intent-based guided discovery**
- LLM-generated questions instead of hardcoded arrays
- Skip logic for optional discovery steps (context step 5 skippable based on goal length)
- FragmentInput mode="words" for tone selection
- 14 steps (0-13), 2 or 3 discovery exchanges
- Discovery agent: `fo-11-discovery` namespace, affirmation agent: `fo-11-affirmation`
- Comprehensive E2E with skip and non-skip flow coverage
- Key files:
  - `app/fo-11/components/fo-experience.tsx` — state machine
  - `app/fo-11/components/step-context.tsx` — LLM question + fragments (skippable)
  - `app/fo-11/components/step-tone.tsx` — LLM question + single-word chips
  - `app/fo-11/actions.ts` — `generateDiscoveryStep()` with skip signal
  - `src/mastra/agents/fo-11/` — discovery + affirmation agents
  - `src/db/seeds/fo-11.ts` — 12 seed entries
  - `e2e/fo-11.test.ts` — E2E covering skip and non-skip flows
  - `docs/projects/2026-02-11-fo-11/implementation-notes.md`

### FO-12 — 2026-02-16
**3-phase affirmation architecture**
- 3-phase flow: Phase 1 (10) → Check-in 1 → Phase 2 (10) → Check-in 2 → Phase 3 (continuous)
- Global counter targeting 30 loved affirmations
- Dynamic emergency batch generation: `max(2*remaining, 20)` when phase 3 pool exhausted
- 16 steps (0-15), renumbered discovery at steps 3-5
- Check-in screens with loading states between phases
- No types.ts imports in components — props-only pattern
- Trinev2-adapted prompts with "supportive voice" framing
- AnimatePresence spring animation timing for E2E (text-change detection required)
- Key files:
  - `app/fo-12/components/fo-experience.tsx` — 16-step state machine
  - `app/fo-12/components/step-start.tsx` — new static motivational screen
  - `app/fo-12/components/step-checkin.tsx` — parameterized for phase 1/2
  - `app/fo-12/components/affirmation-card-flow.tsx` — global counter, phase-aware
  - `app/fo-12/actions.ts` — batch generation with dynamic sizing
  - `src/mastra/agents/fo-12/` — discovery + affirmation agents (`fo-12` namespace)
  - `src/db/seeds/fo-12.ts` — 11 seed entries from Trinev2 reference
  - `e2e/fo-12.test.ts` — full 16-step E2E test
  - `docs/projects/2026-02-16-fo-12/implementation-notes.md`
  - `docs/projects/2026-02-16-fo-12/2026-02-16-fo-12-trinev2-reference.md`

## Epoch 02 — Production Onboarding

### FO-13 Foundation — 2026-02-27 (Iteration 02.1, Epic A)
**Types, agents, seeds, and server actions**
- `app/fo-13/types.ts` — Constants: PHASE1_TARGET=20, PHASE2_TARGET=40, PHASE1_BATCH_SIZE=5, PHASE2_BATCH_SIZE=20, FO13 interfaces
- `src/mastra/agents/fo-13/discovery-agent.ts` — Copy of FO-12, namespace `fo-13`
- `src/mastra/agents/fo-13/affirmation-agent.ts` — Adapted from FO-12: flexible output count (not hardcoded 10)
- `src/db/seeds/fo-13.ts` — 11 KV entries under `fo-13` namespace. `prompt_affirmation` uses batch size 5, `system_affirmation` has flexible output format, `prompt_affirmation_with_feedback` reused as-is (already uses `{{ batch_size }}`)
- `src/db/seeds/index.ts` — Registered `fo13Seeds`
- `app/fo-13/actions.ts` — `generateDiscoveryStep(4|5)`, `generateAffirmationBatchFO13()` with default batch size 5

### FO-13 Discovery UI — 2026-02-27 (Iteration 02.1, Epic B)
**Discovery components and ThinkingScreen**
- Copied 7 components from FO-12: step-welcome, step-familiarity, step-goal, step-context, step-tone, fragment-input, heart-animation
- Updated all FO-12 references to FO-13 in comments
- Step guards unchanged (same numbering: familiarity=2, goal=3, context=4, tone=5)
- `app/fo-13/components/thinking-screen.tsx` — NEW: reusable sequential message component with pulsing heart. Takes `messages: string[]` prop and pulses through them in order. Used for all 8 thinking screens (A–H)

### FO-13 Page Scaffolding + State Machine — 2026-02-27 (Iteration 02.1, Epic C)
**State machine, page scaffold, navigation**
- `src/fo-13/` — Implementation provider (context, selector, index) — copy of FO-12 with `fo-13` namespace
- `app/fo-13/components/fo-experience.tsx` — Partial state machine covering steps 0-6:
  - Steps 0-1: Welcome (name entry)
  - Step 2: Familiarity selection
  - Step 3: Goal → Thinking A → discovery step 4 call
  - Step 4: Context (or silently skipped) → Thinking B → discovery step 5 call
  - Step 5: Tone → Thinking C → first batch of 5 affirmations
  - Step 6: Placeholder for phase 1 (wired in iteration 02.2)
  - Uses ThinkingScreen (sequential messages) instead of HeartAnimation for transitions
  - Refactored transition logic: data-loading callbacks check `thinkingCompleted` flag to advance step, avoiding `setState-in-useEffect` lint error that FO-12 has
- `app/fo-13/page.tsx` — Page component wrapping FOExperience
- `app/fo-13/layout.tsx` + `fo-13-layout-client.tsx` — Layout with ImplementationProvider and ImplementationSelector
- `app/fo-13/info/page.tsx` — Info page with FO-12→FO-13 comparison table
- `nav.config.ts` — Added FO-13 entry with Demo and Info children
- `app/overview/page.tsx` — Added FO-13 card and comparison table row
