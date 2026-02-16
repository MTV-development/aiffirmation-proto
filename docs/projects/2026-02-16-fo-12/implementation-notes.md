# Implementation Notes — FO-12

> Epic workers: read this before starting. Append your section when done.
> Captures patterns established, gotchas discovered, and decisions made across epics.

---

## UI Components Epic (vmp) — 2026-02-16

### Decisions Made

- **No types.ts imports in components**: All components use prop interfaces only. The state machine (fo-experience.tsx) wires everything. Constants like GOAL_QUESTION are inlined in step-goal.tsx rather than imported from types.ts.
- **Step number guards updated for FO-12 numbering**: step-goal checks `currentStep !== 3` (was 4 in FO-11), step-context checks `currentStep !== 4` (was 5), step-tone checks `currentStep !== 5` (was 6). The state machine must pass the correct currentStep values.
- **step-familiarity guards at step 2**: FO-12 has no personalized welcome step, so familiarity is at step 2 (was step 3 in FO-11).

### Key Patterns

- **affirmation-card-flow props**: `totalLovedSoFar` (number), `target` (default 30), `onRequestMore` (optional callback for phase 3 pool exhaustion). The global counter shows `totalLovedSoFar + lovedInThisBatch` of `target`. If pool is exhausted and onRequestMore exists, it calls that instead of onComplete.
- **step-checkin props**: `phase` (1 | 2), `onContinue`, `isLoading` (boolean). When isLoading is true, shows spinner instead of Continue button.
- **step-start props**: `onContinue`, `name`. Static component, no loading state.
- **step-welcome**: Only 2 sub-steps (0: welcome, 1: name). No step 2 personalized welcome.
- **step-completion**: Removed `summary` prop from FO-11. Shows dynamic count in heading.

### Files Created (15 components)

All in `app/fo-12/components/`:
1. fragment-input.tsx (copied from FO-11)
2. heart-animation.tsx (copied from FO-11)
3. affirmation-card.tsx (copied from FO-11)
4. step-background.tsx (copied from FO-11)
5. step-notifications.tsx (copied from FO-11)
6. step-paywall.tsx (copied from FO-11)
7. step-goal.tsx (copied, step guard changed to 3, GOAL_QUESTION inlined)
8. step-context.tsx (copied, step guard changed to 4)
9. step-tone.tsx (copied, step guard changed to 5)
10. step-welcome.tsx (modified: 2 sub-steps, new copy)
11. step-familiarity.tsx (modified: new question/options, step guard at 2)
12. step-completion.tsx (modified: dynamic count, no summary prop)
13. step-start.tsx (new: static motivational screen)
14. step-checkin.tsx (new: parameterized for phase 1/2, loading state)
15. affirmation-card-flow.tsx (new: global counter, phase-aware, onRequestMore)

---

## Foundation Epic (o8m) — 2026-02-16

### Architecture Decisions

- **Single namespace `fo-12`**: All KV keys use `versions.fo-12.*` prefix. Discovery and affirmation agents share this namespace (same pattern as FO-11's `fo-11`).
- **Discovery steps 4 and 5 only**: No step 7 (Additional Context removed). Step 4 = context (skippable), step 5 = tone (never skipped).
- **Batch size 10**: Default batch for phases 1-2. Phase 3 uses dynamic `batchSize` parameter.
- **`batch_size` template variable**: The `prompt_affirmation_with_feedback` template uses `{{ batch_size }}` for dynamic phase 3 sizing. The initial prompt (`prompt_affirmation`) hardcodes "10".
- **Exchange count 2-3**: Goal + tone (2, when context skipped) or goal + context + tone (3). No "additional context" exchange.

### Key Files

| File | Purpose |
|------|---------|
| `app/fo-12/types.ts` | TARGET_LOVED=30, PHASE1_SIZE=10, PHASE2_SIZE=10, FO12 interfaces |
| `app/fo-12/actions.ts` | `generateDiscoveryStep(4|5, ...)`, `generateAffirmationBatchFO12(...)` |
| `src/fo-12/` | ImplementationProvider (queries `fo-12` namespace), ImplementationSelector |
| `src/mastra/agents/fo-12/` | Discovery agent (steps 4-5), affirmation agent (batch size 10) |
| `src/db/seeds/fo-12.ts` | 11 KV seed entries based on Trinev2 reference |
| `src/db/seeds/index.ts` | Registered `fo12Seeds` in `allSeeds` array |

### Seed Adaptations from Trinev2

- Trinev2 `prompt_step_5` -> FO-12 `prompt_step_4` (context)
- Trinev2 `prompt_step_6` -> FO-12 `prompt_step_5` (tone, uses improved "supportive voice" framing)
- Trinev2 step 7 prompt -> removed entirely
- All "5 affirmations" -> "10 affirmations"
- All "2-4 exchanges" -> "2-3 exchanges"
- Removed "Additional context" references from exchange structure docs
- `prompt_affirmation_with_feedback` uses `{{ batch_size }}` variable (not hardcoded)

---

## Integration Epic (o3x) — 2026-02-16

### State Machine (fo-experience.tsx)

- **16 steps (0-15)**: welcome (0-1), familiarity (2), goal (3), context (4), tone (5), start (6), phase 1 (7), checkin 1 (8), phase 2 (9), checkin 2 (10), phase 3 (11), post-review (12-14), completion (15)
- **Discovery flow mirrors FO-11 but renumbered**: goal at step 3 triggers heart animation + call step 4; if skip, chain to step 5; context at step 4 triggers heart animation + call step 5; tone at step 5 triggers heart animation + generate first batch
- **First batch generated during tone heart animation**: after tone continue, heart animation shows "Creating your personalized affirmations..." while generateAffirmationBatchFO12 runs. When both animation and generation complete, advance to step 6 (Start screen)
- **Batch generation at check-ins**: handleCheckin1Continue and handleCheckin2Continue set isCheckinLoading=true, generate batch, then advance to next phase
- **Phase 3 pool management**: phase3Pool holds all affirmations for continuous review; when exhausted before 30 loved, handlePhase3RequestMore generates emergency batch with dynamic size max(2*remaining, 20)
- **totalLovedSoFar tracking**: Phase 1 passes 0 (accumulates in state after complete), Phase 2 passes allLovedAffirmations.length, Phase 3 same

### Page Scaffolding

- **page.tsx**: Identical pattern to FO-11 — imports FOExperience, wraps in full-height container
- **layout.tsx**: Server component wrapping with Fo12LayoutClient
- **fo-12-layout-client.tsx**: Uses `@/src/fo-12` for ImplementationProvider/Selector, finds navTree item for '/fo-12'
- **info/page.tsx**: Uses InfoPageWrapper with FO-12 specific content (3-phase flow, check-ins, 30-target)

### Registration

- **nav.config.ts**: FO-12 entry added after FO-11 with Demo and Info children
- **overview/page.tsx**: FO-12 version card added to versions array AND comparison table row added

---

## E2E Testing Epic (alj) -- 2026-02-16

### Test File

- **e2e/fo-12.test.ts**: Complete E2E test covering all 16 steps (0-15)
- Run command: `node --import tsx e2e/fo-12.test.ts`
- Runtime: ~3-4 minutes

### Key Patterns

- **Card transition timing**: AnimatePresence with spring animations requires a `waitForNextCard` helper that waits for the card text to change (600ms settle + text change detection). Without this, the test reads stale card text or clicks on cards that are still animating.
- **Phase 3 continuous mode**: Uses dynamic card detection loop that handles emergency batch generation (`"Generating more affirmations..."` screen) and waits for cards to reappear.
- **Global counter verification**: Counter text format is `"X of 30 selected"` (not `X/Y`). Verified at start of each phase to confirm counter carries over.
- **Check-in loading detection**: Look for `"Creating your next affirmations..."` text to confirm loading state, then wait for `[data-testid="affirmation-card-flow"]` to reappear.
- **Happy path strategy**: Love 8 out of 10 in phases 1-2, discard every 5th in phase 3. This produces exactly 30 loved in phase 3 (8 + 8 + 14 = 30).

### Gotchas

- The FO-12 welcome text differs from FO-11: "Let's get to know you" instead of "The way you speak to yourself"
- The familiarity button text differs: "I've tried a few" instead of "Some experience"
- No personalized welcome step (step 2 is familiarity directly after name)
- Start screen appears AFTER first batch generation (during heart animation). May need extra wait time if generation is slow.
- AffirmationCardFlow uses `AnimatePresence mode="wait"` with spring animation (`stiffness: 300, damping: 30`). Exit animation must complete before enter. A simple `sleep(400)` is NOT sufficient -- need to detect text change.
