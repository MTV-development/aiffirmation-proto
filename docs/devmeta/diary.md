# Project Diary

Narrative history of the Aiffirmation project.

## January 2026 — Exploration Begins

The project started in mid-January 2026 as an exploration of AI-powered affirmation onboarding flows. The core idea: guide users through a personalized discovery conversation, then generate tailored affirmations based on their responses.

**FO-01 (Jan 16)** was the first full onboarding prototype — a basic flow with AI-generated affirmations. **FO-02 (Jan 17)** refined the approach. **FO-03 and FO-04 (Jan 23)** explored different interaction patterns, with FO-04 incorporating Trine's design feedback.

**FO-05 (Jan 24-25)** went through two iterations (a summary version and a full version). **FO-06 (Jan 26)** continued refinement alongside a Mastra 1.0 upgrade. **FO-07 (Jan 27)** and **FO-08 (Jan 28)** pushed further on the flow design.

By the end of January, the project had established its foundational patterns: Next.js App Router with version-isolated routes, Mastra for AI agents, LiquidJS for prompt templating, and KV store for configurable prompts.

## February 2026 — Maturation

**FO-09 (Jan 30)** and **FO-10 (Feb 9)** introduced chip-based discovery interactions and the copy-modify-iterate development pattern that would become the standard workflow.

**FO-11 (Feb 11)** was a significant leap: intent-based discovery with LLM-generated questions, skip logic for optional steps, and comprehensive E2E testing with both skip and non-skip flow coverage.

**FO-12 (Feb 16)** built on FO-11 with a 3-phase affirmation architecture (Phase 1 → Check-in → Phase 2 → Check-in → Phase 3 continuous), a global counter targeting 30 loved affirmations, and dynamic emergency batch generation. The E2E test covered all 16 steps of the flow.

The Playwright E2E testing knowledge base was established during this period, with reusable patterns, troubleshooting guides, and autonomous execution support.

## February 27, 2026 — Epoch 02 Begins

FO-13 construction started with iteration 02.1 (Foundation + Discovery). The epoch-02 spec was finalized with four key decisions resolved interactively: keep skip logic from FO-12, one batch of 20 for phase 2 (no thinking screens), "Add more later" skips to Theme, and real feedback-driven regeneration in phase 1.

Three epics completed in 02.1: Foundation (types, agents, seeds, actions), Discovery UI (7 components copied from FO-12 + new ThinkingScreen component), and Page Scaffolding + State Machine (partial fo-experience.tsx covering discovery through first batch generation, implementation provider, page scaffold, navigation registration).

Notable improvement over FO-12: refactored the transition logic to avoid `setState-in-useEffect` by having data-loading callbacks check the `thinkingCompleted` flag directly and advance the step, eliminating the need for a coordination useEffect entirely. This passes lint cleanly where FO-12 does not.

Iteration 02.2 (Phase 1 Affirmation Review) followed immediately. This was a fast, clean iteration — two epics, no blockers. Epic A copied and adapted the card components from FO-12 (removing `onRequestMore` since FO-13's fixed 4×5 structure doesn't need continuous mode), created the StepReady transition screen, and deleted the dead `heart-animation.tsx` identified in the 02.1 reflection. Epic B extended the state machine from 6 steps to 12, wiring up the full Phase 1 card review flow with thinking screens D-G between each batch. The feedback-driven regeneration pattern reused the same `.then()` + `thinkingCompleted` coordination from discovery, applied to batch generation callbacks. One minor learning: static lookup tables (like thinking screen messages per step) must live at module level to avoid `react-hooks/exhaustive-deps` warnings in `useCallback`. The iteration completed in a single session with PR #23 merged.

Iteration 02.3 (Phase 2, Post-Review, Full E2E) completed the FO-13 implementation. Epic A created five new components — all straightforward copies from FO-12 with minimal adaptation. The Create-List interstitial was the only genuinely new screen, offering a Continue button for Phase 2 or an "Add more later" link to skip directly to Theme. Epic B extended the state machine from 12 to 19 steps in a single task, wiring up Phase 2 generation, the 20-card review with "X of 40" counter, Thinking H, and the post-review sequence. The agent handled the intermediate thinking screen (step 13 for Phase 2 generation) cleanly, inserting it between Create-List and the card review without confusion.

The E2E test suite (Epic C — HARD GATE) was the culmination. A background agent wrote the entire 1,367-line test file with 3 test cases and composable flow helpers. All three tests passed on the first run against a live dev server in 274 seconds. FO-12 regression also passed. No iteration was needed on the E2E — the test was correct from the start, reflecting the maturity of the E2E knowledge base and the pattern library established in earlier iterations. PR #24 merged cleanly.

This marks the completion of Epoch 02. FO-13 is a fully navigable, E2E-tested production onboarding flow: 14 screens, 8 thinking transitions, 2 phases (20+20), skip logic, feedback-driven regeneration, and 3 E2E test variants all passing.

## March 7, 2026 — Epoch 03 Begins

Epoch 03 targets FO-14: a delta from FO-13 with only two changes — splitting Phase 2 into 3 sub-batches (8+8+4) with thinking screens, and updating the card counter from "X of 20 selected" to "X of 20" (shown count) with a new headline.

Iteration 03.1 (Copy & Foundation) was fast and clean — a single session. Copied all fo-13 code to fo-14, renamed all internal references, created the KV seed with byte-for-byte identical prompt content (verified via diff), seeded Supabase, and confirmed the build passes. The Prompt Integrity Constraint was established as a hard rule: no prompt text may be rewritten, paraphrased, or "improved" — only the namespace prefix changes.

Iterations 03.2 (Phase 2 Sub-batches) and 03.3 (Counter & Headline) implemented the two delta changes cleanly. The state machine grew from 19 to 23 steps to accommodate Phase 2 sub-batch screens (steps 14/16/18) with Thinking H/I/J transitions (steps 15/17/19). The counter change was a complete rewrite of `affirmation-card-flow.tsx` — new props (`globalShownOffset`, `shownTarget`) replaced the old loved-count model.

Iteration 03.4 (Playwright E2E) completed the epoch. The E2E test (1347 lines, 2 test cases) verified both FO-14 changes end-to-end: Phase 2 sub-batches with correct card counts (8+8+4) and shown-count counters ("1 of 20" through "20 of 20"). Both tests passed on first run against the production server in 212.7s. The dev server's Turbopack crash (Windows-specific) required using `next start` instead of `next dev`, with the `e2e_test_mode` cookie bypassing the password middleware.
