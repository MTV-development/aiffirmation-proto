# Epoch 03 — FO-14 (Delta from FO-13)

**Status:** NOT STARTED
**Depends on:** Epoch 02 (Production Onboarding — FO-13)
**Goal:** Create FO-14 as an independent copy of FO-13 with two targeted changes: split Phase 2 into 3 sub-batches with thinking screens, and update the Phase 1 card counter to show "X of 20" (affirmations shown, not selected) with a new headline.

---

## What This Epoch Produces

### On screen
- FO-14 onboarding flow at `/fo-14`
- Phase 2 split into 3 card sub-screens (1-8, 9-16, 17-20) with Thinking H/I/J between them
- Phase 1 card screens (8.1-8.4) show counter "X of 20" counting affirmations shown (not loved)
- Phase 1 card screens show headline "Does this affirmation resonate with you?"

### Under the hood
- Full `app/fo-14/` directory as independent copy of `app/fo-13/`
- `src/fo-14/` implementation module (if needed, mirroring fo-13 pattern)
- KV namespace `fo-14` seeded on Supabase via `npm run db:seed`
- Updated types/constants for Phase 2 sub-batches (3 batches: 8, 8, 4)

### Testing delivered
- Playwright E2E test suite (`e2e/fo-14.test.ts`) verifying full UX in browser
- Verification that FO-13 remains untouched

---

## Prompt Integrity Constraint (CRITICAL)

FO-14 must produce affirmations of identical nature and quality to FO-13. This is a hard rule.

### What MUST stay identical (byte-for-byte from FO-13)
- `system_affirmation` — the affirmation agent system prompt (weighting rules, sentence opener distribution, length guidelines, tone, avoid list, psychological principles)
- `prompt_affirmation` — first-batch user prompt template
- `prompt_affirmation_with_feedback` — feedback-driven batch user prompt template
- `system` — the discovery agent system prompt (skip logic, chip formats, echo anchoring prevention)
- `prompt_step_4` and `prompt_step_5` — discovery user prompt templates
- `_model_name`, `_model_name_affirmation` — model selections (gpt-4o)
- `_temperature`, `_temperature_affirmation` — temperature values (0.8, 0.9)

### What MAY change (process control only)
- `batch_size` template variable passed at call time (e.g., 8/8/4 instead of 20 for Phase 2 sub-batches)
- State machine step numbering and flow logic in `fo-experience.tsx`
- Number of times the affirmation agent is called (3 calls instead of 1 for Phase 2)
- Thinking screen messages (UI-only, not agent prompts)

### Implementation approach
The `fo-14` KV seed should copy all prompt content verbatim from `fo-13.ts`. Only the namespace key prefix changes (`versions.fo-14.*` instead of `versions.fo-13.*`). No prompt text may be rewritten, paraphrased, or "improved". If Phase 2 sub-batching requires passing different `batch_size` values (8, 8, 4), that is a call-site change in `actions.ts`, not a prompt change.

---

## What This Epoch Does NOT Include

| Deferred | Why | Which Epoch |
|----------|-----|-------------|
| Confetti animations | No design exists | Future |
| Feed screen redesign | FO-14 spec says "same as FO-12" | Future |
| New discovery questions | FO-14 keeps FO-13 discovery identical | Future |

---

## Iteration Map

| # | Title | What Gets Built |
|:--:|-------|-----------------|
| 03.1 | Copy & Foundation | Copy fo-13 to fo-14, register routes/seeds/namespace, verify identical behavior |
| 03.2 | Change 1 — Phase 2 Sub-batches | Split Phase 2 single batch of 20 into 3 sub-screens (8+8+4) with Thinking H/I/J |
| 03.3 | Change 2 — Counter & Headline | Update Phase 1 card counter to "X of 20" (shown count) + add headline |
| 03.4 | Playwright E2E | Full Playwright E2E test suite verifying FO-14 UX end-to-end in browser |

---

## Detailed Iterations

### Iteration 03.1 — Copy & Foundation

**Deliverables:**
- Copy `app/fo-13/` to `app/fo-14/` with all internal references updated (imports, types, KV namespace)
- Copy/register `src/fo-14/` implementation module
- Create `fo-14` KV seed data: copy ALL prompt content byte-for-byte from `fo-13.ts`, only changing the namespace prefix from `fo-13` to `fo-14` (see Prompt Integrity Constraint above)
- Register seed in `src/db/seeds/index.ts`
- Run `npm run db:seed` to populate KV store on Supabase with fo-14 namespace
- Verify `/fo-14` loads and behaves identically to `/fo-13`

**Verify on screen:**
- `npm run db:seed` completes without errors, fo-14 namespace populated in Supabase KV
- `/fo-14` loads and shows welcome screen
- Full flow works end-to-end (identical to fo-13)

### Iteration 03.2 — Change 1: Phase 2 Sub-batches with Thinking Screens

**Deliverables:**
- Split Phase 2 AffirmationCardFlow (currently 1 batch of 20) into 3 sub-screens:
  - 10.1: affirmations 1-8 (counter "1 of 20" to "8 of 20")
  - 10.2: affirmations 9-16 (counter "9 of 20" to "16 of 20")
  - 10.3: affirmations 17-20 (counter "17 of 20" to "20 of 20")
- Add Thinking H between 10.1 and 10.2: "Saving your choices..." / "Bringing your next affirmations together..."
- Add Thinking I between 10.2 and 10.3: "Saving what felt right" / "Gently shaping last 4 affirmation for now..."
- Add Thinking J after 10.3: "Bringing your personal set together..." / "Updating your personal feed..." / "Getting your personalized experience ready for you..."
- Update state machine step numbering to accommodate sub-steps
- Phase 2 sub-batching is a state machine + call-site change only: the affirmation agent is called 3 times with batch_size 8/8/4 instead of once with batch_size 20. No prompt text changes. (See Prompt Integrity Constraint)

**Verify on screen:**
- Phase 2 shows 3 separate card review screens with thinking transitions between them
- Thinking screen messages match spec
- Flow continues to Theme screen after Thinking J

### Iteration 03.3 — Change 2: Counter & Headline

**Deliverables:**
- Update AffirmationCardFlow counter in Phase 1 (screens 8.1-8.4) from "X of 20 selected" to "X of 20" where X counts affirmations shown (not loved)
- Add headline "Does this affirmation resonate with you?" above affirmation text on screens 8.1-8.4
- Apply same counter format to Phase 2 sub-screens (already in spec as "X of 20")

**Verify on screen:**
- Phase 1 cards show "1 of 20", "2 of 20", etc. incrementing per card shown
- Headline "Does this affirmation resonate with you?" visible on all card screens
- Phase 2 sub-screens show same counter format

### Iteration 03.4 — Playwright E2E

**Deliverables:**
- Full Playwright E2E test suite (`e2e/fo-14.test.ts`) verifying the complete FO-14 onboarding UX in a real browser
- Test coverage for both changes:
  - Phase 2 sub-batches: verify 3 card review screens with thinking transitions between them
  - Counter format: verify "X of 20" shown-count on Phase 1 card screens
  - Headline: verify "Does this affirmation resonate with you?" visible on card screens
- Test the happy path end-to-end: welcome -> discovery -> Phase 1 -> Create-List -> Phase 2 (3 sub-screens) -> Theme -> Notifications -> Premium -> Feed
- Screenshots at key verification points

**Verify on screen:**
- `node --import tsx e2e/fo-14.test.ts` passes all test cases
- Screenshots confirm UX matches spec

---

## Exit Criteria

- [ ] `/fo-14` loads and completes full onboarding flow
- [ ] Phase 2 has 3 sub-screens with thinking transitions (H, I, J)
- [ ] Phase 1 counter shows "X of 20" (affirmations shown, not selected)
- [ ] Headline "Does this affirmation resonate with you?" on all card screens
- [ ] FO-13 (`/fo-13`) remains unchanged and functional
- [ ] E2E tests pass for FO-14
- [ ] All tests pass (`npm run build`, `npm run lint`)
- [ ] Living docs updated

---

## Blocked Items

- None — FO-13 codebase is complete and all dependencies are available

---

## Previous Epochs

| Epoch | Name | Status | Overview |
|-------|------|--------|----------|
| epoch-01 | Full Onboarding Exploration | COMPLETE | [epoch-01/_overview.md](../epoch-01/_overview.md) |
| epoch-02 | Production Onboarding | COMPLETE | [epoch-02/_overview.md](../epoch-02/_overview.md) |
