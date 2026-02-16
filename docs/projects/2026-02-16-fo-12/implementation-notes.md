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
