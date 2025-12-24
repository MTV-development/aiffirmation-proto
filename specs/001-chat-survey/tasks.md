# Tasks: Chat-Survey Agent (CS-01)

**Input**: Design documents from `/specs/001-chat-survey/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual testing only (per Technical Context).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js App Router project with Mastra integration:
- Mastra workflows: `src/mastra/workflows/`
- Mastra agents: `src/mastra/agents/`
- App Router: `app/`
- Components: `components/` and `app/*/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and directory structure

- [ ] T001 Install @mastra/pg package for PostgreSQL workflow storage
- [ ] T002 [P] Create workflow directory structure: `src/mastra/workflows/chat-survey/` and `src/mastra/workflows/chat-survey/steps/`
- [ ] T003 [P] Create agent directory structure: `src/mastra/agents/chat-survey/`
- [ ] T004 [P] Create app route directory structure: `app/chat-survey/` and `app/chat-survey/components/`
- [ ] T005 Add Chat Survey route to navigation in nav.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Workflow Types & Schemas

- [ ] T006 Create Zod schemas for all workflow types in src/mastra/workflows/chat-survey/types.ts (conversationMessageSchema, tonePreferenceSchema, userProfileSchema, workflowStateSchema, chatSuspendPayloadSchema, swipeSuspendPayloadSchema, chatResumeDataSchema, swipeResumeDataSchema)
- [ ] T007 Export TypeScript types derived from Zod schemas in src/mastra/workflows/chat-survey/types.ts

### Mastra Storage Configuration

- [ ] T008 Update src/mastra/index.ts to use PostgresStore instead of LibSQLStore with connection pooling
- [ ] T009 Add chatSurveyWorkflow to Mastra workflows registration in src/mastra/index.ts

### Agent Infrastructure

- [ ] T010 [P] Create Discovery Agent skeleton in src/mastra/agents/chat-survey/discovery-agent.ts with KV-driven system prompt
- [ ] T011 [P] Create Generation Agent skeleton in src/mastra/agents/chat-survey/generation-agent.ts with KV-driven system prompt
- [ ] T012 Create agent index re-exports in src/mastra/agents/chat-survey/index.ts
- [ ] T013 Register CS-01 agents in src/mastra/index.ts

### KV Store Seed Data

- [ ] T014 Add KV store entries for CS-01 agent prompts in src/db/seed.ts (system_discovery, system_generation, prompt_extract, _temperature_discovery, _temperature_generation)

**Checkpoint**: Foundation ready - Mastra configured with PostgresStore, agents registered, types defined

---

## Phase 3: User Story 1 - Complete Discovery-to-Swipe Journey (Priority: P1) 🎯 MVP

**Goal**: User completes discovery chat, profile is extracted, affirmations are generated one-by-one with swipe feedback

**Independent Test**: Start new session → Complete 3-5 chat turns → Transition to swipe → Swipe 5-10 affirmations → Verify personalization

### Workflow Steps (US1)

- [ ] T015 [US1] Implement discovery-chat step with suspend/resume logic in src/mastra/workflows/chat-survey/steps/discovery-chat.ts
- [ ] T016 [US1] Implement conversation completion detection (agent-driven + 7-turn fallback) in src/mastra/workflows/chat-survey/steps/discovery-chat.ts
- [ ] T017 [US1] Implement profile-builder step that extracts structured UserProfile from conversation in src/mastra/workflows/chat-survey/steps/profile-builder.ts
- [ ] T018 [US1] Implement generate-stream step with suspend/resume for each affirmation in src/mastra/workflows/chat-survey/steps/generate-stream.ts
- [ ] T019 [US1] Implement feedback incorporation (approved/skipped lists) in generation prompts in src/mastra/workflows/chat-survey/steps/generate-stream.ts
- [ ] T020 [US1] Create main workflow definition connecting all three steps in src/mastra/workflows/chat-survey/index.ts

### Server Actions (US1)

- [ ] T021 [US1] Implement startChatSurvey server action in app/chat-survey/actions.ts
- [ ] T022 [US1] Implement resumeChatSurvey server action in app/chat-survey/actions.ts
- [ ] T023 [US1] Implement swipeAffirmation server action in app/chat-survey/actions.ts
- [ ] T024 [US1] Implement WorkflowStartResult type and response formatting in app/chat-survey/actions.ts

### UI Components (US1)

- [ ] T025 [P] [US1] Create client-side types in app/chat-survey/components/types.ts (SessionReference, phase types)
- [ ] T026 [P] [US1] Create localStorage hook for session persistence in app/chat-survey/components/use-session-storage.ts
- [ ] T027 [US1] Create ChatPhase component with message bubbles and input in app/chat-survey/components/chat-phase.tsx
- [ ] T028 [US1] Create SwipePhase component adapting from AP-02 patterns in app/chat-survey/components/swipe-phase.tsx
- [ ] T029 [US1] Create CSExperience orchestrator component managing phase transitions in app/chat-survey/components/cs-experience.tsx
- [ ] T030 [US1] Create component index re-exports in app/chat-survey/components/index.ts
- [ ] T031 [US1] Create page component that renders CSExperience in app/chat-survey/page.tsx
- [ ] T032 [US1] Create layout with navigation integration in app/chat-survey/layout.tsx

### Discovery Agent Prompts (US1)

- [ ] T033 [US1] Refine Discovery Agent system prompt for open-ended questioning in src/mastra/agents/chat-survey/discovery-agent.ts
- [ ] T034 [US1] Add suggested responses generation to Discovery Agent responses

### Generation Agent Prompts (US1)

- [ ] T035 [US1] Implement Generation Agent prompt building with profile context in src/mastra/agents/chat-survey/generation-agent.ts
- [ ] T036 [US1] Implement feedback incorporation (approved/skipped patterns) in Generation Agent prompts

**Checkpoint**: User Story 1 fully functional - complete discovery-to-swipe journey works end-to-end

---

## Phase 4: User Story 2 - Skip Discovery and Jump to Affirmations (Priority: P2)

**Goal**: User can skip discovery chat and immediately start swiping through diverse, exploratory affirmations

**Independent Test**: Start session → Click "Skip to affirmations" → Immediately see swipe UI with diverse affirmations

### Server Actions (US2)

- [ ] T037 [US2] Implement skipToSwipe server action in app/chat-survey/actions.ts
- [ ] T038 [US2] Update workflow to support skip-to-generation path with empty profile in src/mastra/workflows/chat-survey/index.ts

### UI Components (US2)

- [ ] T039 [US2] Add "Skip to affirmations" button to ChatPhase initial state in app/chat-survey/components/chat-phase.tsx
- [ ] T040 [US2] Update CSExperience to handle skip navigation in app/chat-survey/components/cs-experience.tsx

### Generation Agent (US2)

- [ ] T041 [US2] Add exploration mode to Generation Agent for empty profile (diverse themes, varied tones) in src/mastra/agents/chat-survey/generation-agent.ts

**Checkpoint**: User Story 2 complete - skip discovery works, exploration mode generates diverse affirmations

---

## Phase 5: User Story 3 - Resume Interrupted Session (Priority: P2)

**Goal**: User can close browser, return later, and continue from where they left off

**Independent Test**: Start session → Complete 2 chat turns → Close browser → Reopen → See "Continue session" option → Resume conversation

### Server Actions (US3)

- [ ] T042 [US3] Implement getSessionState server action in app/chat-survey/actions.ts

### UI Components (US3)

- [ ] T043 [US3] Add session recovery check on CSExperience mount in app/chat-survey/components/cs-experience.tsx
- [ ] T044 [US3] Create resume/new session choice UI in app/chat-survey/components/cs-experience.tsx
- [ ] T045 [US3] Update ChatPhase to display previous conversation history on resume in app/chat-survey/components/chat-phase.tsx
- [ ] T046 [US3] Update SwipePhase to restore saved count on resume in app/chat-survey/components/swipe-phase.tsx

**Checkpoint**: User Story 3 complete - session resumption works for both chat and swipe phases

---

## Phase 6: User Story 4 - View and Manage Saved Affirmations (Priority: P3)

**Goal**: User can view all saved affirmations and remove ones they no longer want

**Independent Test**: Save 3+ affirmations → Navigate to saved view → See all saved → Remove one → Verify removal

### Server Actions (US4)

- [ ] T047 [US4] Implement getSavedAffirmations server action in app/chat-survey/actions.ts
- [ ] T048 [US4] Implement removeSavedAffirmation server action in app/chat-survey/actions.ts

### UI Components (US4)

- [ ] T049 [US4] Create SavedScreen component in app/chat-survey/components/saved-screen.tsx (adapt from AP-02)
- [ ] T050 [US4] Add navigation to saved screen in SwipePhase bottom bar in app/chat-survey/components/swipe-phase.tsx
- [ ] T051 [US4] Update CSExperience to handle saved screen navigation in app/chat-survey/components/cs-experience.tsx

**Checkpoint**: User Story 4 complete - saved affirmations viewable and manageable

---

## Phase 7: User Story 5 - Refine During Swipe Phase (Priority: P3)

**Goal**: User can provide additional guidance if affirmations aren't resonating

**Independent Test**: Enter swipe mode → Skip 5+ affirmations → See refinement option → Provide guidance → Verify improved relevance

### Workflow Logic (US5)

- [ ] T052 [US5] Add skip pattern detection to generate-stream step in src/mastra/workflows/chat-survey/steps/generate-stream.ts
- [ ] T053 [US5] Add refinement prompt handling to Generation Agent in src/mastra/agents/chat-survey/generation-agent.ts

### Server Actions (US5)

- [ ] T054 [US5] Add refinement input handling to swipeAffirmation (optional refinementNote parameter) in app/chat-survey/actions.ts

### UI Components (US5)

- [ ] T055 [US5] Add refinement prompt UI that appears after multiple consecutive skips in app/chat-survey/components/swipe-phase.tsx
- [ ] T056 [US5] Create refinement input modal or inline form in app/chat-survey/components/swipe-phase.tsx

**Checkpoint**: User Story 5 complete - refinement mechanism helps recover from poor personalization

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T057 Add error handling and user-friendly error messages across all server actions in app/chat-survey/actions.ts
- [ ] T058 [P] Add loading states and transitions to all UI components
- [ ] T059 [P] Implement phase transition animation in CSExperience (discovery complete → swipe begins)
- [ ] T060 Add reset session functionality (clear localStorage, start fresh) in app/chat-survey/components/cs-experience.tsx
- [ ] T061 Run npm run lint and fix any linting errors
- [ ] T062 Run npm run build and verify production build succeeds
- [ ] T063 Manual end-to-end testing following quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1): Core flow - must complete first for MVP
  - US2 (P2): Skip discovery - can start after US1 or in parallel if staffed
  - US3 (P2): Session resume - can start after US1 or in parallel
  - US4 (P3): Saved view - can start after US1 swipe phase works
  - US5 (P3): Refinement - can start after US1 swipe phase works
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - No dependencies on other stories
- **User Story 2 (P2)**: Foundation only - Independent, but shares workflow with US1
- **User Story 3 (P2)**: Foundation + US1 workflows - Needs workflow to exist
- **User Story 4 (P3)**: Foundation + US1 swipe phase - Needs saved affirmations to exist
- **User Story 5 (P3)**: Foundation + US1 swipe phase - Needs generation stream to exist

### Within Each User Story

- Types and schemas before implementation
- Workflow steps before server actions
- Server actions before UI components
- Core implementation before enhancements

### Parallel Opportunities

Within Phase 2 (Foundational):
- T010 and T011 (agent skeletons) can run in parallel
- T002, T003, T004 (directory creation) can run in parallel

Within User Story 1:
- T025 and T026 (client types and hooks) can run in parallel

Across User Stories (if team capacity):
- US2, US3 can start in parallel after US1 swipe phase exists
- US4, US5 can start in parallel after US1 swipe phase works

---

## Parallel Example: Foundational Phase

```bash
# Directory creation (parallel):
Task: "Create workflow directory structure: src/mastra/workflows/chat-survey/"
Task: "Create agent directory structure: src/mastra/agents/chat-survey/"
Task: "Create app route directory structure: app/chat-survey/"

# Agent skeletons (parallel, after directories):
Task: "Create Discovery Agent skeleton in src/mastra/agents/chat-survey/discovery-agent.ts"
Task: "Create Generation Agent skeleton in src/mastra/agents/chat-survey/generation-agent.ts"
```

## Parallel Example: User Story 1 UI

```bash
# Client infrastructure (parallel):
Task: "Create client-side types in app/chat-survey/components/types.ts"
Task: "Create localStorage hook in app/chat-survey/components/use-session-storage.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T015-T036)
4. **STOP and VALIDATE**: Test complete discovery-to-swipe journey
5. Deploy/demo if ready - this is the core feature!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Full journey works → Deploy (MVP!)
3. User Story 2 → Skip discovery works → Deploy
4. User Story 3 → Session resume works → Deploy
5. User Story 4 → Saved view works → Deploy
6. User Story 5 → Refinement works → Deploy

### Suggested MVP Scope

**For initial launch, complete only:**
- Phase 1: Setup (5 tasks)
- Phase 2: Foundational (9 tasks)
- Phase 3: User Story 1 (22 tasks)
- Phase 8: Polish subset (T057, T061, T062, T063)

**Total MVP tasks**: ~40 tasks

This delivers the core value proposition: conversational discovery → personalized affirmation generation.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing only (no test framework configured)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Swipe UI can be adapted from existing AP-02 components in components/alt-process-2/

---

## Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Setup | 5 | 3 |
| Foundational | 9 | 2 |
| US1 (P1) MVP | 22 | 4 |
| US2 (P2) | 5 | 0 |
| US3 (P2) | 5 | 0 |
| US4 (P3) | 5 | 0 |
| US5 (P3) | 5 | 0 |
| Polish | 7 | 2 |
| **Total** | **63** | **11** |
