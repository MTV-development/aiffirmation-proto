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

### FO-13 Card Components — 2026-02-27 (Iteration 02.2, Epic A)
**Card review components and cleanup**
- `app/fo-13/components/affirmation-card.tsx` — Copy of FO-12 single card (Love it / Discard buttons with spring animation)
- `app/fo-13/components/affirmation-card-flow.tsx` — Adapted from FO-12: removed `onRequestMore` (not needed for fixed 4×5 batches), default target changed to PHASE1_TARGET (20)
- `app/fo-13/components/step-ready.tsx` — NEW Screen 7: transition screen before card review. Shows personalized headline with user's name and explanation of what comes next
- Deleted `app/fo-13/components/heart-animation.tsx` — dead code carried over from FO-12 (ThinkingScreen replaces it in FO-13)

### FO-13 State Machine Extension — 2026-02-27 (Iteration 02.2, Epic B)
**Phase 1 card review flow (steps 7-12)**
- Extended `app/fo-13/components/fo-experience.tsx` from steps 0-6 to steps 0-12:
  - Step 7: StepReady — transition screen with personalized headline
  - Steps 8-11: AffirmationCardFlow × 4 batches of 5 with thinking screens D-G between
  - Step 12: Placeholder for Phase 2 (iteration 02.3)
- Feedback-driven regeneration: each batch completion passes accumulated loved/discarded to next batch generation
- Thinking screen messages: D (resonance), E (refining), F (polishing), G (saving/creating feed, 3 messages)
- Same transition coordination pattern: `.then()` callbacks check `thinkingCompleted` in functional state updaters
- `BATCH_THINKING_MESSAGES` extracted as module-level constant to satisfy exhaustive-deps

### FO-13 Phase 2, Post-Review, Complete State Machine — 2026-02-27 (Iteration 02.3, Epics A+B)
**All remaining screens and complete state machine wiring**
- `app/fo-13/components/step-create-list.tsx` — Screen 9: Continue to Phase 2 or "Add more later" skip
- `app/fo-13/components/step-theme.tsx` — Screen 11: gradient picker (copy of FO-12's StepBackground)
- `app/fo-13/components/step-notifications.tsx` — Screen 12: notification frequency (copy of FO-12)
- `app/fo-13/components/step-premium.tsx` — Screen 13: premium/paywall mockup (copy of FO-12)
- `app/fo-13/components/step-feed.tsx` — Screen 14: "Welcome to your personal affirmation feed" (adapted from FO-12's StepCompletion, no confetti)
- Extended `app/fo-13/components/fo-experience.tsx` to steps 0-19:
  - Step 12: Create-List with "Add more later" → step 16 (Theme)
  - Step 13: Generation thinking (Phase 2 batch of 20 with feedback)
  - Step 14: Phase 2 card review (20 cards, X of 40 counter)
  - Step 15: Thinking H ("Beautiful, {name}." → "Bringing your personal set together…")
  - Steps 16-19: Theme → Notifications → Premium → Feed
- State additions: `phase2Affirmations`, `phase1LovedCount` for Phase 2 counter baseline

### FO-13 E2E Test Suite — 2026-02-27 (Iteration 02.3, Epic C)
**Comprehensive Playwright E2E covering all flow variants**
- `e2e/fo-13.test.ts` — 3 test cases, 1367 lines:
  1. Happy path: all 40 cards reviewed (Phase 1 + Phase 2), context NOT skipped
  2. Skip-context variant: rich goal triggers context skip, "Add more later" skips Phase 2
  3. "Add more later" variant: brief goal, Phase 1 only, Phase 2 skipped
- ThinkingScreen detection: heart SVG (`viewBox="0 0 24 24"`) presence/absence
- Reusable composable helpers: `runDiscoveryFlow`, `runPhase1CardReview`, `runPhase2CardReview`, `runPostReviewSteps`
- All 3 tests pass on first run (274s total)

## Epoch 03 — FO-14 (Delta from FO-13)

### FO-14 Copy & Foundation — 2026-03-07 (Iteration 03.1, Epic A)
**Full copy of FO-13 to FO-14 with namespace rename**
- Copied `app/fo-13/` → `app/fo-14/` (22 files)
- Copied `src/fo-13/` → `src/fo-14/` (3 files)
- Copied `src/mastra/agents/fo-13/` → `src/mastra/agents/fo-14/` (3 files)
- All internal references renamed: fo-13→fo-14, FO13→FO14, Fo13→Fo14
- Agent IDs: `fo-14-discovery`, `fo-14-affirmation`
- KV namespace: `versions.fo-14.*`
- Layout file renamed: `fo-13-layout-client.tsx` → `fo-14-layout-client.tsx`
- Added FO-14 to `nav.config.ts`
- Build passes cleanly, `/fo-14` route present

### FO-14 Phase 2 Sub-batches — 2026-03-07 (Iteration 03.2)
**Split Phase 2 into 3 sub-batch card review screens with thinking transitions**
- `app/fo-14/types.ts` — Added `PHASE2_SUB_BATCH_SIZES=[8,8,4]` and `PHASE2_SUB_BATCH_COUNT=3`
- `app/fo-14/components/fo-experience.tsx` — Major state machine refactor:
  - Steps 14/16/18: Phase 2 sub-batch card reviews (8+8+4 cards), sliced from single 20-affirmation array
  - Steps 15/17/19: Thinking H/I/J with spec-matching messages
  - Steps 20-23: Theme → Notifications → Premium → Feed (shifted from 16-19)
  - "Add more later" skip updated to go to step 20
  - Added `phase2SubBatchIndex` to state, `PHASE2_THINKING_MESSAGES` constant
  - No prompt changes — all 20 affirmations still generated in one batch, sliced at render time
