# Epoch 04 — Fix FO-14

**Status:** NOT STARTED
**Depends on:** Epoch 03 (FO-14 Delta from FO-13)
**Goal:** Make FO-14 exactly match the spec in `docs/epochs/epoch-03/onboaridng flow-FO13_TOFO14.md`. Fix all inconsistencies identified in the post-epoch-03 audit.

---

## What This Epoch Produces

### On screen
- Confetti removed from FO-14 familiarity screen (step 2)
- Thinking E text corrected: "Refining your affirmations …" (no "further")
- Thinking F text corrected: "Polishing the details…" (no "final")
- FO-14 info page accurately describes FO-14 as based on FO-13 (already fixed, needs commit)

### Under the hood
- `step-familiarity.tsx`: `canvas-confetti` import and usage removed
- `fo-experience.tsx`: Thinking E/F messages updated to match spec exactly
- E2E test re-verified after changes

### Testing delivered
- FO-14 E2E tests still pass after all fixes
- Build passes

---

## What This Epoch Does NOT Include

| Deferred | Why | Which Epoch |
|----------|-----|-------------|
| Removing confetti from FO-13 or other versions | Spec only mentions FO-14 | Future (if needed) |
| Removing `canvas-confetti` package from project | Other versions may still use it | Future |

---

## Gaps Identified (from post-epoch-03 audit)

### Gap 1: Confetti still present (SPEC VIOLATION)

**Spec says:** "Confetti should be removed from the app as we do not have any design for it"

**Current state:** `app/fo-14/components/step-familiarity.tsx` imports `canvas-confetti` and fires confetti on familiarity selection (line 48).

**Fix:** Remove the confetti import and the `confetti({...})` call. Keep the selection + success message + auto-advance behavior.

### Gap 2: Thinking E message text mismatch

**Spec says:** "Refining your affirmations …" (with trailing space before ellipsis, and no extra word)

**Current state:** `'Refining your affirmations further…'` — has extra word "further" (inherited from FO-13).

**Fix:** Change to `'Refining your affirmations…'` to match spec.

### Gap 3: Thinking F message text mismatch

**Spec says:** "Polishing the details…"

**Current state:** `'Polishing the final details…'` — has extra word "final" (inherited from FO-13).

**Fix:** Change to `'Polishing the details…'` to match spec.

### Gap 4: Info page described FO-12 instead of FO-13 (ALREADY FIXED)

**Current state:** Already fixed in the current working tree but not yet committed. The info page now correctly describes FO-14 as based on FO-13 with the actual delta comparison.

---

## Iteration Map

| # | Title | What Gets Built |
|:--:|-------|-----------------|
| 04.1 | Fix All Gaps + Verify | Fix all 4 gaps, rebuild, re-run E2E, commit, PR |

---

## Detailed Iterations

### Iteration 04.1 — Fix All Gaps + Verify

**Deliverables:**
- Remove confetti from `step-familiarity.tsx`
- Fix Thinking E/F messages in `fo-experience.tsx`
- Commit the already-fixed info page
- Rebuild, re-run FO-14 E2E tests
- Update implementation log

**Verify on screen:**
- `npm run build` passes
- `node --import tsx e2e/fo-14.test.ts` passes both test cases
- FO-14 familiarity screen does NOT trigger confetti
- `/fo-14/info` shows FO-13 comparison (not FO-12)

---

## Exit Criteria

- [ ] No confetti in FO-14 familiarity screen
- [ ] Thinking E message: "Refining your affirmations…" (no "further")
- [ ] Thinking F message: "Polishing the details…" (no "final")
- [ ] FO-14 info page describes relationship to FO-13 (not FO-12)
- [ ] FO-14 E2E tests pass
- [ ] Build passes
- [ ] Living docs updated

---

## Blocked Items

- None

---

## Previous Epochs

| Epoch | Name | Status | Overview |
|-------|------|--------|----------|
| epoch-01 | Full Onboarding Exploration | COMPLETE | [epoch-01/_overview.md](../epoch-01/_overview.md) |
| epoch-02 | Production Onboarding | COMPLETE | [epoch-02/_overview.md](../epoch-02/_overview.md) |
| epoch-03 | FO-14 (Delta from FO-13) | COMPLETE | [epoch-03/_overview.md](../epoch-03/_overview.md) |
