# TK Worker Memory

## Project Structure

- Server actions are in `app/[feature]/actions.ts`
- KV store templates are seeded from `src/db/seeds/[feature].ts`
- After updating seed files, always run `npm run db:seed` to update the database

## Common Patterns

### Template Variables in Server Actions

When updating server actions to pass new variables to templates:
1. Update the seed file first with new variable names
2. Run `npm run db:seed` to update the database
3. Update the server action to pass the new variables
4. The template engine uses Liquid syntax: `{{ variable_name }}`

### TypeScript Compilation

Always run `npx tsc --noEmit` before closing a task to catch type errors.

## FO-10 Specific

- Questions are hardcoded in `FO10_QUESTIONS` array in `types.ts`
- Chip generation happens at steps 5-7
- Step N uses question index N-4 from the array (step 5 → index 1, step 6 → index 2, etc.)
- Conversation history should be formatted as natural Q&A strings, not structured objects
- E2E test verified: `node --import tsx e2e/fo-10.test.ts` - conversational Q&A format produces contextually relevant chips

## FO-11 Specific

- Discovery agent namespace: `fo-11-discovery`, affirmation agent: `fo-11-affirmation`
- Only step 4 has a fixed question (FO11_GOAL_QUESTION), steps 5-6 are LLM-generated
- generateDiscoveryStep(5|6, context) returns FO11DiscoveryResponse with skip boolean
- Step 6 has safety guard: skip is forced to false even if agent returns true
- No familiarity passed to agents (cosmetic only in UI)
- Variable-length exchanges: 2 (goal + tone) or 3 (goal + context + tone)
- Files: types.ts, actions.ts in app/fo-11/, agents in src/mastra/agents/fo-11/, seeds in src/db/seeds/fo-11.ts
- UI: 14 components in app/fo-11/components/, state machine in fo-experience.tsx (steps 0-13)
- FragmentInput extended with mode="words" + helperText prop for single-word tone chips
- Skip logic: after step 4, call generateDiscoveryStep(5); if skip=true, chain to generateDiscoveryStep(6)

## FO-12 Specific

- Single namespace: `fo-12` (shared by discovery + affirmation agents)
- Discovery steps: 4 (context, skippable) and 5 (tone, never skip). No step 7.
- generateDiscoveryStep(4|5, context) -- step 5 has safety guard forcing skip=false
- Batch size 10 for phases 1-2, dynamic via batchSize param for phase 3
- prompt_affirmation_with_feedback uses `{{ batch_size }}` template variable
- TARGET_LOVED=30, PHASE1_SIZE=10, PHASE2_SIZE=10 constants in types.ts
- Exchange count: 2-3 (goal+tone or goal+context+tone)
- Step numbering: welcome 0-1, familiarity 2, goal 3, context 4, tone 5, start 6, phase 1 cards 7, checkin 1 8, phase 2 cards 9, checkin 2 10, phase 3 cards 11, post-review 12-14, completion 15
- Components do NOT import from types.ts -- use prop interfaces. State machine wires everything.
- GOAL_QUESTION inlined in step-goal.tsx (not imported from types)
- affirmation-card-flow: props include totalLovedSoFar, target (default 30), onRequestMore (for phase 3)
- step-checkin: parameterized with phase (1|2), isLoading shows spinner
- 15 components + fo-experience.tsx state machine in app/fo-12/components/
- Files: types.ts + actions.ts in app/fo-12/, agents in src/mastra/agents/fo-12/, seeds in src/db/seeds/fo-12.ts, implementation provider in src/fo-12/
- State machine: first batch generated during tone heart animation (not separate loading step). isCheckinLoading used for check-in loading states. phase3Pool for continuous phase 3.
- Page scaffolding: page.tsx, layout.tsx, fo-12-layout-client.tsx, info/page.tsx all follow FO-11 pattern

## UI Component Patterns

- When copying components between FO versions, update step number guards AND imports
- FragmentInput supports 3 modes: 'sentences' (append as-is), 'fragments' (remove trailing ...), 'words' (append as-is, centered compact pills)
- Navigation registration: nav.config.ts + overview page (both card array and comparison table)
- Layout pattern: layout.tsx (server) → fo-XX-layout-client.tsx (client, reads navTree)

## E2E Testing

- Run E2E tests with `node --import tsx e2e/[test-file].test.ts`
- Always start dev server in background first: Windows: `cmd //c "start /b npm run dev"`, Linux: `npm run dev &`; wait 20s
- FO-10 test takes ~2-3 minutes and covers all 15 steps including AI generation
- FO-11 test takes ~3-4 minutes with two browser sessions (non-skip + skip flows)
- FO-12 test takes ~3-4 minutes with 16 steps, 3 phases, ~37 card reviews
- Always run `npm run db:seed` before E2E to ensure KV store prompts are populated
- For single-word chips, use countAllChipButtons() not countChips() (latter requires length > 10)
- Extract shared flow steps into named async functions for reuse across test flows
- **Card flow transitions**: AnimatePresence with spring animations needs waitForNextCard helper (600ms settle + text change detection). Simple sleep is NOT enough -- cards animate out then in.
- Global counter format in FO-12: "X of 30 selected" (not "X/Y")
