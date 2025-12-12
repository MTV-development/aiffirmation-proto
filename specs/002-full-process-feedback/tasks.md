# Tasks: Full Process 2 - Feedback-Aware Affirmation Generation

**Input**: Design documents from `/specs/002-full-process-feedback/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual testing via Mastra Studio as specified in plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router with Mastra agents
- **Agent code**: `src/mastra/agents/`
- **Services**: `src/services/`
- **Server actions**: `app/full-process/`
- **Seed data**: `src/db/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create FP-02 agent directory structure

- [x] T001 Create agent directory at `src/mastra/agents/full-process-2/`
- [x] T002 [P] Create agent index file at `src/mastra/agents/full-process-2/index.ts` with placeholder exports

**Checkpoint**: Directory structure ready for agent implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational tasks required - FP-02 uses existing KV store infrastructure

**Note**: This feature has no blocking prerequisites beyond Phase 1. The existing KV store, Drizzle ORM, and Mastra framework are already in place.

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Feedback-Influenced Affirmation Generation (Priority: P1) 🎯 MVP

**Goal**: Create FP-02 agent that receives approved/skipped affirmation lists and generates better-aligned affirmations

**Independent Test**: Test via Mastra Studio (`npx mastra dev`) with a prompt containing approved and skipped affirmation lists. Verify response trends toward approved patterns.

### Implementation for User Story 1

- [x] T003 [US1] Create FP-02 agent implementation in `src/mastra/agents/full-process-2/agent.ts` with:
  - DEFAULT_INSTRUCTIONS constant containing full system prompt with feedback analysis section
  - Static `fullProcess2Agent` export for Mastra registration
  - `createFullProcess2Agent(implementation)` factory function using KV store
- [x] T004 [US1] Update agent exports in `src/mastra/agents/full-process-2/index.ts` to export agent and factory
- [x] T005 [US1] Register FP-02 agent in `src/mastra/index.ts`:
  - Import `fullProcess2Agent` from `./agents/full-process-2`
  - Add to agents object in Mastra constructor
- [x] T006 [US1] Create `generateFullProcess2Affirmations` server action in `app/full-process/actions.ts` with:
  - `GenerateFullProcess2Options` interface (preferences, adjustedPreferences, implementation, approvedAffirmations, skippedAffirmations)
  - Feedback list limiting (max 20 each)
  - Template rendering with `fp-02` version
  - Agent instantiation and generation
  - Response parsing and fallback handling
- [x] T007 [US1] Verify FP-02 agent appears in Mastra Studio and responds to prompts

**Checkpoint**: FP-02 agent is functional and can be tested via Mastra Studio with feedback data

---

## Phase 4: User Story 2 - KV Store Configuration (Priority: P2)

**Goal**: Ensure FP-02 prompts are stored in KV store and can be modified without code changes

**Independent Test**: Modify `versions.fp-02.system.default` in database, restart server, verify agent uses updated prompt.

### Implementation for User Story 2

- [x] T008 [US2] Verify agent.ts uses `getAgentSystemPrompt('fp-02', implementation)` for system prompt retrieval
- [x] T009 [US2] Verify agent.ts uses `getAgentModelName('fp-02', implementation)` for model configuration
- [x] T010 [US2] Verify server action uses `renderTemplate()` with `version: 'fp-02'` for user prompt
- [x] T011 [US2] Test KV configuration by viewing entries in Drizzle Studio (`npm run db:studio`)

**Checkpoint**: FP-02 is fully configurable via KV store entries

---

## Phase 5: User Story 3 - Seed Data for FP-02 (Priority: P3)

**Goal**: Add FP-02 KV entries to seed script for out-of-the-box functionality

**Independent Test**: Run `npm run db:seed` on fresh database, then test FP-02 generation via Mastra Studio.

### Implementation for User Story 3

- [x] T012 [US3] Add FP-02 `_info` entry to `src/db/seed.ts`:
  - Key: `versions.fp-02._info.default`
  - Value: name, description, author, createdAt
- [x] T013 [P] [US3] Add FP-02 `_model_name` entry to `src/db/seed.ts`:
  - Key: `versions.fp-02._model_name.default`
  - Value: `openai/gpt-4o`
- [x] T014 [P] [US3] Add FP-02 `_temperature` entry to `src/db/seed.ts`:
  - Key: `versions.fp-02._temperature.default`
  - Value: `0.95`
- [x] T015 [US3] Add FP-02 `system` prompt entry to `src/db/seed.ts`:
  - Key: `versions.fp-02.system.default`
  - Value: Full system prompt with feedback analysis instructions (per contracts/kv-entries.md)
- [x] T016 [US3] Add FP-02 `prompt` template entry to `src/db/seed.ts`:
  - Key: `versions.fp-02.prompt.default`
  - Value: Liquid template with approvedAffirmations, skippedAffirmations variables (per contracts/kv-entries.md)
- [x] T017 [US3] Run `npm run db:seed` and verify all FP-02 entries are created
- [x] T018 [US3] Verify seed script handles re-runs (upsert behavior) without errors

**Checkpoint**: FP-02 works out-of-the-box after `npm run db:seed`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality gates

- [x] T019 Run `npm run lint` and fix any errors
- [x] T020 Run `npm run build` and verify successful compilation
- [x] T021 Run full quickstart.md validation:
  - Start dev server (`npm run dev`)
  - Start Mastra Studio (`npx mastra dev`)
  - Test FP-02 with feedback data
  - Verify affirmations trend toward approved patterns
- [x] T022 Verify TypeScript compilation with no type errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A for this feature (uses existing infrastructure)
- **User Story 1 (Phase 3)**: Depends on Phase 1 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 (agent must exist to test KV config)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (agent must exist to test seed data)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - Core functionality, no dependencies on other stories
- **User Story 2 (P2)**: Verifies US1 implementation uses KV store correctly
- **User Story 3 (P3)**: Adds seed data for US1/US2 configuration

### Within Each User Story

- Agent implementation (T003-T004) before registration (T005)
- Registration (T005) before server action (T006)
- Server action (T006) before manual testing (T007)
- Seed data entries (T012-T016) before seed execution (T017)

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T013 and T014 can run in parallel (independent KV entries)
- All Phase 6 quality gate tasks can run in parallel

---

## Parallel Example: User Story 3 Seed Data

```bash
# Launch parallel seed data tasks:
Task: "Add FP-02 _model_name entry to src/db/seed.ts"
Task: "Add FP-02 _temperature entry to src/db/seed.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 3: User Story 1 (T003-T007)
3. **STOP and VALIDATE**: Test FP-02 via Mastra Studio
4. Verify feedback influences generation

### Incremental Delivery

1. Complete Setup → Directory structure ready
2. Add User Story 1 → FP-02 agent functional → Test in Mastra Studio (MVP!)
3. Add User Story 2 → Verify KV configuration works
4. Add User Story 3 → Seed data for out-of-the-box setup
5. Polish → Quality gates pass

### Single Developer Strategy

Recommended execution order:
1. T001 → T002 (Setup)
2. T003 → T004 → T005 → T006 → T007 (US1 - Core agent)
3. T008 → T009 → T010 → T011 (US2 - KV verification)
4. T012 → T013, T014 (parallel) → T015 → T016 → T017 → T018 (US3 - Seed data)
5. T019 → T020 → T021 → T022 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No UI changes required - existing Full Process UI works with FP-02
- FP-02 is independent from FP-01 - no shared code
- Manual testing via Mastra Studio (`npx mastra dev` at http://localhost:4111)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
