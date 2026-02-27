# Epoch 02 — Production Onboarding

**Status:** COMPLETE (2026-02-27)
**Depends on:** Epoch 01 (Full Onboarding Exploration)
**Goal:** Build FO-13 as an independent, production-ready onboarding flow using FO-12 as baseline, with feedback-driven affirmation batches and a 2-phase (20+20) review structure.

---

## What This Epoch Produces

### On screen
- FO-13 onboarding flow: 14 screens + 8 thinking transitions
- Discovery flow (Screens 1–6): Welcome → Name → Familiarity → Goal → What's Going On → Tone
- Phase 1 affirmation review (Screens 7–8.4): 4 rounds of 5 cards with feedback-driven regeneration between each, counter "X of 20"
- Create-List interstitial (Screen 9): option to continue or "Add more later"
- Phase 2 affirmation review (Screen 10): 20 cards straight through, counter "X of 40"
- Post-review (Screens 11–14): Theme → Notifications → Premium → Feed
- 8 thinking screens with pulsing heart and sequential personalized messages

### Under the hood
- Independent `fo-13` KV namespace with own seeds, agents, and actions
- Discovery agent: copy FO-12 prompts as-is (same skip logic, chip formats, echo-anchoring prevention)
- Affirmation agent: FO-12 prompts adapted for variable batch sizes (5 for phase 1, 20 for phase 2)
- Feedback-driven generation loop: after each batch of 5, pass loved/discarded to inform next batch
- `app/fo-13/` route with own state machine, components, layout

### Testing delivered
- **Playwright E2E tests written AND executed in a real browser, all passing** — this is a hard gate; the epoch cannot close without green E2E runs
- E2E test covering full happy path (all 40 cards)
- E2E test covering skip-context flow variant
- E2E test covering "Add more later" skip path
- FO-12 E2E regression pass (existing `e2e/fo-12.test.ts` still green)

---

## What This Epoch Does NOT Include

| Deferred | Why | Which Epoch |
|----------|-----|-------------|
| Persistence / user accounts | No backend user model yet | Future |
| Real notification scheduling | Onboarding mock only | Future |
| Real payment integration | Premium screen is a mock | Future |
| Feed screen with actual affirmation display | Requires post-onboarding architecture | Future |
| Theme selection that persists | No theme storage backend | Future |

---

## Key Decisions (Resolved)

| Decision | Answer | Rationale |
|----------|--------|-----------|
| Skip logic for Screen 5 (What's Going On) | **Keep** — same as FO-12 | If goal answer is rich enough, skip to tone |
| Phase 2 batch structure | **One batch of 20**, no intermediate thinking screens | Spec shows 21–40 as continuous |
| "Add more later" target | **Skip to Theme** (Screen 11) | Skip phase 2 entirely |
| Phase 1 regeneration | **Real** — each batch of 5 uses love/discard feedback | Thinking screens are real processing |
| Confetti | **Remove** | No design exists for it |

---

## Prompt Reuse Strategy (FO-12 → FO-13)

FO-13 copies FO-12's prompts to a new `fo-13` namespace. Maximize reuse, minimize drift.

### Copy as-is (no changes except namespace)
| FO-12 Key | Purpose | Why unchanged |
|-----------|---------|---------------|
| `system` | Discovery agent system prompt | Same steps (4/5), same skip logic, same chip formats |
| `prompt_step_4` | Context step prompt | Same intent, skip rule, fragment chip format |
| `prompt_step_5` | Tone step prompt | Same intent, single-word chip format, never-skip |
| `_model_name` | Discovery model (gpt-4o) | Same model |
| `_model_name_affirmation` | Affirmation model (gpt-4o) | Same model |
| `_temperature` | Discovery temperature (0.8) | Same |
| `_temperature_affirmation` | Affirmation temperature (0.9) | Same |
| `prompt_affirmation_with_feedback` | Feedback-aware generation prompt | Already uses `{{ batch_size }}` — works for both 5 and 20 |

### Adapted (minimal changes)
| FO-12 Key | Change for FO-13 | Why |
|-----------|-------------------|-----|
| `prompt_affirmation` | "10" → "5" | Initial batch (after tone) is 5, not 10 |
| `system_affirmation` | Output format: hardcoded "10" → flexible count matching `{{ batch_size }}`. Balance rule: "1 of 10" → "1 of the batch" | Variable batch sizes (5 in phase 1, 20 in phase 2) |
| `_info` | Updated description | Describes FO-13 structure (4×5 + 20) |

### New
None. No new prompt types needed — the feedback template already handles everything.

---

## FO-12 → FO-13 Screen Mapping

| FO-13 Screen | FO-12 Equivalent | Change |
|--------------|-------------------|--------|
| 1. Welcome | Steps 0–1 (Welcome) | Same |
| 2. Name | Steps 0–1 (Name) | Same |
| 3. Familiarity | Step 2 | Same |
| 4. Goal | Step 3 | Same |
| Thinking A | Heart animation | New: sequential messages with `{firstName}` |
| 5. What's Going On | Step 4 (Context) | Same (skip logic preserved) |
| Thinking B | Heart animation | New: sequential messages |
| 6. Tone | Step 5 | Same |
| Thinking C | Heart animation | New: sequential messages, generates first batch of 5 |
| 7. 0-20-aff-ready | Step 6 (StepStart) | **New copy**: different headline and body text |
| 8.1–8.4 (4×5 cards) | Step 7 (Phase 1: 10 cards) | **New structure**: 4 rounds of 5, "X of 20" counter |
| Thinking D–F | N/A (no equivalent) | **New**: between each batch of 5 |
| Thinking G | N/A | **New**: saves preferences, creates feed |
| 9. Create-List | N/A (no equivalent) | **New**: interstitial with "Add more later" skip |
| 10. 21–40 (20 cards) | Steps 9/11 (Phase 2+3) | **Simplified**: one batch of 20, "X of 40" counter |
| Thinking H | N/A | **New**: post-phase-2 transition |
| 11. Theme | Step 12 (Background) | **Modified**: different framing text |
| 12. Notifications | Step 13 | Same |
| 13. Premium | Step 14 (Paywall) | Same |
| 14. Feed | Step 15 (Completion) | **Replaced**: "Welcome to your personal affirmation feed" |

### FO-12 screens NOT in FO-13 (left out)
- Step 8 (Check-in 1) — replaced by thinking transitions
- Step 10 (Check-in 2) — replaced by thinking transitions
- Step 15 (StepCompletion showing all 30 affirmations) — replaced by Feed screen

---

## Iteration Map

| # | Title | What Gets Built |
|:--:|-------|-----------------|
| 02.1 | Foundation + Discovery | Types, agents, seeds, actions, discovery UI (Screens 1–6), thinking screens A–C, skip logic, page scaffolding, nav registration |
| 02.2 | Phase 1 Affirmation Review | Screen 7 (ready), AffirmationCardFlow for batches of 5, thinking screens D–G, feedback-driven regeneration loop, "X of 20" counter |
| 02.3 | Phase 2, Post-Review, E2E | Screen 9 (Create-List), Screen 10 (21–40), thinking H, Screens 11–14, "Add more later" skip, complete state machine, full E2E test suite |

---

## Detailed Iterations

### Iteration 02.1 — Foundation + Discovery

**Deliverables:**
- `app/fo-13/types.ts` — Constants: `PHASE1_TARGET=20`, `PHASE2_TARGET=40`, `PHASE1_BATCH_SIZE=5`, `PHASE2_BATCH_SIZE=20`, goal question, interfaces
- `src/mastra/agents/fo-13/discovery-agent.ts` — Copy FO-12, namespace `fo-13`
- `src/mastra/agents/fo-13/affirmation-agent.ts` — Copy FO-12, adapt for variable batch sizes
- `src/db/seeds/fo-13.ts` — All KV entries under `fo-13` namespace (copy FO-12, adapt as noted in prompt reuse strategy)
- Register seeds in `src/db/seeds/index.ts`
- `app/fo-13/actions.ts` — `generateDiscoveryStep(4|5)` (copy FO-12), `generateAffirmationBatchFO13()` adapted for batch size 5/20
- Discovery UI components (copy FO-12): step-welcome, step-familiarity, step-goal, step-context, step-tone, fragment-input, heart-animation
- **New: ThinkingScreen component** — pulsing heart with sequential message display (messages pulse in sequence: sentence 1 appears, replaced by sentence 2, etc.). Parameterized: takes `messages: string[]` prop
- Page scaffolding: page.tsx, layout.tsx, layout-client, info/page.tsx
- Navigation: nav.config.ts, overview/page.tsx
- Partial state machine (fo-experience.tsx) covering steps through tone + thinking C + first batch generation

**Verify on screen:**
- Navigate to /fo-13, complete discovery (Welcome → Name → Familiarity → Goal → Thinking A → What's Going On → Thinking B → Tone → Thinking C)
- Skip logic works: rich goal answer skips Screen 5
- Thinking screens show sequential messages with pulsing heart
- First batch of 5 affirmations generated after Thinking C

### Iteration 02.2 — Phase 1 Affirmation Review

**Deliverables:**
- Screen 7 (0-20-aff-ready): new component with FO-13-specific copy
- Adapted AffirmationCardFlow: batches of 5 with "X of 20" counter, love/discard actions
- Thinking screens D–G between batches: sequential messages, feedback-driven regeneration (pass loved/discarded to `generateAffirmationBatchFO13` with `batchSize=5`)
- State machine extended: Screen 7 → review 1–5 → Thinking D → review 6–10 → Thinking E → review 11–15 → Thinking F → review 16–20 → Thinking G
- Accumulate loved/discarded affirmations across all 4 batches

**Verify on screen:**
- After Thinking C, Screen 7 shows ready message with `{firstName}`
- Review 5 cards (love/discard), counter shows "1 of 20" through "5 of 20"
- Thinking D appears with sequential messages, then next 5 cards (6 of 20 through 10 of 20)
- Repeat through all 20 cards
- Thinking G shows 3 sequential messages ("Saving your preferences…" etc.)

### Iteration 02.3 — Phase 2, Post-Review, Full E2E

**Deliverables:**
- Screen 9 (Create-List): headline, body text, Continue button, "Add more later" link
- Screen 10 (21–40): AffirmationCardFlow with 20 cards, "X of 40" counter, single batch generation with feedback from phase 1
- Thinking H: post-phase-2 transition with sequential messages
- Screen 11 (Theme): adapted from FO-12's StepBackground with new framing text
- Screen 12 (Notifications): copy from FO-12
- Screen 13 (Premium): copy from FO-12
- Screen 14 (Feed): adapted from FO-12's StepCompletion — "Welcome to your personal affirmation feed"
- "Add more later" skip: Screen 9 → Screen 11 directly
- Complete state machine wiring
- No confetti anywhere
- Full Playwright E2E test suite (`e2e/fo-13.test.ts`):
  - Happy path: all 40 cards reviewed
  - Skip-context variant: rich goal → skip Screen 5
  - "Add more later" variant: skip phase 2
- **HARD GATE: All 3 FO-13 E2E tests must be run via `node --import tsx e2e/fo-13.test.ts` in a real Chromium browser and pass. The iteration cannot close without this.**
- **FO-12 regression: run `node --import tsx e2e/fo-12.test.ts` and confirm it still passes.**

**Verify on screen:**
- After Thinking G, Create-List screen offers Continue or "Add more later"
- Continue: 20 more cards (21 of 40 through 40 of 40) → Thinking H → Theme
- "Add more later": jumps directly to Theme
- Theme → Notifications → Premium → Feed with updated text
- `node --import tsx e2e/fo-13.test.ts` — all tests green
- `node --import tsx e2e/fo-12.test.ts` — regression green

---

## Exit Criteria

- [ ] FO-13 fully navigable end-to-end (/fo-13)
- [ ] Discovery flow identical to FO-12 (including skip logic)
- [ ] Phase 1: 4 rounds of 5 cards with real feedback-driven regeneration
- [ ] Phase 2: 20 cards in one batch (or skipped via "Add more later")
- [ ] 8 thinking screens with sequential personalized messages
- [ ] All FO-12 prompts preserved in `fo-13` namespace (adapted only where noted)
- [ ] No confetti
- [ ] **HARD GATE — Playwright E2E:** `e2e/fo-13.test.ts` executed via `node --import tsx e2e/fo-13.test.ts`, all tests pass in a real Chromium browser. Covers: happy path (40 cards), skip-context variant, "Add more later" variant
- [ ] **HARD GATE — FO-12 regression:** `node --import tsx e2e/fo-12.test.ts` still passes (shared files like nav.config.ts, seeds/index.ts must not break FO-12)
- [ ] Seeds registered, `npm run db:seed` populates `fo-13` namespace
- [ ] `npm run lint` and `npm run build` pass
- [ ] Navigation entry and overview card present
- [ ] Living docs updated

---

## Blocked Items

- None — all dependencies (FO-12 codebase, flow spec, env vars) are available

---

## Source Material

- **Flow specification:** [onboardingflow.md](onboardingflow.md)
- **FO-12 baseline:** [../../projects/2026-02-16-fo-12/](../../projects/2026-02-16-fo-12/)
- **FO-12 implementation notes:** [../../projects/2026-02-16-fo-12/implementation-notes.md](../../projects/2026-02-16-fo-12/implementation-notes.md)

## Previous Epochs

- [Epoch 01 — Full Onboarding Exploration](../epoch-01/_overview.md) (COMPLETE)
