# Tasks: Full Process Affirmation Generator

**Input**: Design documents from `/specs/001-full-process-generator/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api.md, research.md, quickstart.md

**Tests**: No automated tests requested - manual testing via development server per Technical Context.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js App Router web application:
- Routes: `app/` directory
- Components: `components/` directory
- Feature modules: `src/` directory
- Client utilities: `lib/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, constants, and KV store seed entries

- [ ] T001 [P] Create TypeScript types for UserPreferences, AdjustedPreferences, WizardState in `src/full-process/types.ts`
- [ ] T002 [P] Create preset constants (focus areas, timing options, challenge badges, tone cards) in `src/full-process/constants.ts`
- [ ] T003 [P] Add FP-01 KV store seed entries (_info, _model_name, system, prompt) to `src/db/seed.ts`
- [ ] T004 Run database seed command: `npm run db:seed`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create Mastra agent definition for Full Process in `src/mastra/agents/full-process/agent.ts`
- [ ] T006 [P] Create agent index export barrel in `src/mastra/agents/full-process/index.ts`
- [ ] T007 Register fullProcessAgent in Mastra instance in `src/mastra/index.ts`
- [ ] T008 [P] Create client-side generation function (generateFullProcessAffirmations) in `lib/agents/full-process.ts`
- [ ] T009 [P] Create fallback affirmation generator function in `lib/agents/full-process.ts`
- [ ] T010 [P] Create reusable ProgressBar component in `components/full-process/progress-bar.tsx`
- [ ] T011 Create feature module index with exports in `src/full-process/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 6 - Navigation Integration (Priority: P1)

**Goal**: Users can access the Full Process Generator via the sidebar navigation

**Independent Test**: Click the new menu item and verify the Full Process Generator page loads with Step 1 of the discovery wizard visible.

### Implementation for User Story 6

- [ ] T012 [US6] Add "Full Process" entry to navTree with children (Demo, Info) in `nav.config.ts`
- [ ] T013 [P] [US6] Create server layout component in `app/full-process/layout.tsx`
- [ ] T014 [P] [US6] Create client layout wrapper with TopSubmenu in `app/full-process/full-process-layout-client.tsx`
- [ ] T015 [US6] Create placeholder main page in `app/full-process/page.tsx`
- [ ] T016 [P] [US6] Create info page with feature documentation in `app/full-process/info/page.tsx`

**Checkpoint**: Navigation works - clicking "Full Process" in sidebar loads the page

---

## Phase 4: User Story 1 - Complete Discovery and Initial Generation (Priority: P1) - MVP

**Goal**: User completes 4-step discovery wizard and receives AI-generated affirmations

**Independent Test**: Complete all 4 wizard steps, click "Find Affirmations", and verify affirmations are displayed.

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create Step 1 (Primary Focus) component with 6 preset cards and custom text in `components/full-process/step-focus.tsx`
- [ ] T018 [P] [US1] Create Step 2 (Timing) component with 3 multi-select buttons and custom text in `components/full-process/step-timing.tsx`
- [ ] T019 [P] [US1] Create Step 3 (Challenges) component with 6 toggleable badges and custom text in `components/full-process/step-challenges.tsx`
- [ ] T020 [P] [US1] Create Step 4 (Tone) component with 4 single-select cards and custom text in `components/full-process/step-tone.tsx`
- [ ] T021 [US1] Create DiscoveryWizard container component orchestrating steps 1-4 in `components/full-process/discovery-wizard.tsx`
- [ ] T022 [US1] Implement wizard state management with step validation in `components/full-process/discovery-wizard.tsx`
- [ ] T023 [US1] Implement single-select behavior for Focus/Tone (preset clears custom, custom clears preset) in step components
- [ ] T024 [US1] Implement multi-select behavior for Timing/Challenges (custom is additive) in step components
- [ ] T025 [US1] Add loading state and error handling for affirmation generation in `components/full-process/discovery-wizard.tsx`
- [ ] T026 [US1] Update main page to render DiscoveryWizard with phase state management in `app/full-process/page.tsx`

**Checkpoint**: Discovery wizard complete - users can express preferences and trigger generation

---

## Phase 5: User Story 2 - Affirmation Review and Collection (Priority: P1)

**Goal**: User reviews affirmations one-by-one, building a collection via like/skip actions

**Independent Test**: After generation, like and skip affirmations; verify liked count increases correctly and "Finish Early" appears.

**Depends on**: User Story 1 (discovery generates affirmations to review)

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create AffirmationCard component displaying single affirmation with progress in `components/full-process/affirmation-card.tsx`
- [ ] T028 [US2] Create AffirmationReview container with like/skip/finish-early logic in `components/full-process/affirmation-review.tsx`
- [ ] T029 [US2] Implement moveToNext() function with batch exhaustion handling in `components/full-process/affirmation-review.tsx`
- [ ] T030 [US2] Implement automatic batch regeneration when affirmations exhausted in `components/full-process/affirmation-review.tsx`
- [ ] T031 [US2] Add "Finish Early" button (visible when likedCount >= 1) in `components/full-process/affirmation-review.tsx`
- [ ] T032 [US2] Integrate AffirmationReview into main page phase transitions in `app/full-process/page.tsx`

**Checkpoint**: Review loop works - users can like/skip affirmations and build collection

---

## Phase 6: User Story 5 - Collection Summary and Export (Priority: P1)

**Goal**: User views their final collection and can export via copy/download

**Independent Test**: After finishing review, verify all liked affirmations display numbered; test copy and download buttons.

**Depends on**: User Story 2 (review builds the collection to summarize)

### Implementation for User Story 5

- [ ] T033 [US5] Create CollectionSummary component with numbered affirmation list in `components/full-process/collection-summary.tsx`
- [ ] T034 [US5] Implement "Copy All" action using navigator.clipboard.writeText() in `components/full-process/collection-summary.tsx`
- [ ] T035 [US5] Implement "Download as Text" action using Blob and object URL in `components/full-process/collection-summary.tsx`
- [ ] T036 [US5] Implement "Start Over" action (page reload) in `components/full-process/collection-summary.tsx`
- [ ] T037 [US5] Handle empty collection edge case with disabled export buttons in `components/full-process/collection-summary.tsx`
- [ ] T038 [US5] Integrate CollectionSummary into main page phase transitions in `app/full-process/page.tsx`

**Checkpoint**: Full MVP complete - users can discover, review, and export affirmations

---

## Phase 7: User Story 3 - Mid-Journey Check-In (Priority: P2)

**Goal**: At milestones (5, 10, 15+ likes), system pauses to show progress and offer direction confirmation

**Independent Test**: Like exactly 5 affirmations and verify check-in screen appears with collection preview.

**Depends on**: User Story 2 (review loop triggers check-in)

### Implementation for User Story 3

- [ ] T039 [US3] Implement shouldShowCheckIn(likedCount) helper function in `src/full-process/index.ts`
- [ ] T040 [US3] Create MidJourneyCheckIn component with collection preview and preferences summary in `components/full-process/mid-journey-checkin.tsx`
- [ ] T041 [US3] Implement "Yes, Keep Going" action (continue or regenerate batch) in `components/full-process/mid-journey-checkin.tsx`
- [ ] T042 [US3] Implement "I'm happy with my collection" action (go to summary) in `components/full-process/mid-journey-checkin.tsx`
- [ ] T043 [US3] Integrate check-in trigger into AffirmationReview after like actions in `components/full-process/affirmation-review.tsx`

**Checkpoint**: Check-in milestones work - users see progress confirmation at 5/10/15+ likes

---

## Phase 8: User Story 4 - Preference Adjustment During Check-In (Priority: P2)

**Goal**: During check-in, users can adjust challenges/tone to refine future affirmations

**Independent Test**: At check-in, click "Let's Adjust", modify preferences, apply; verify new batch reflects changes.

**Depends on**: User Story 3 (check-in displays adjustment option)

### Implementation for User Story 4

- [ ] T044 [US4] Create AdjustmentPanel component with challenge badges and tone cards in `components/full-process/adjustment-panel.tsx`
- [ ] T045 [US4] Implement multi-select challenges and single-select tone in adjustment panel in `components/full-process/adjustment-panel.tsx`
- [ ] T046 [US4] Add freeform feedback text input in `components/full-process/adjustment-panel.tsx`
- [ ] T047 [US4] Implement "Apply Adjustments" action triggering new batch generation in `components/full-process/adjustment-panel.tsx`
- [ ] T048 [US4] Implement "Back" action returning to check-in without changes in `components/full-process/adjustment-panel.tsx`
- [ ] T049 [US4] Add "Let's Adjust" button to MidJourneyCheckIn that opens adjustment panel in `components/full-process/mid-journey-checkin.tsx`
- [ ] T050 [US4] Update generation function to merge adjustedPreferences with original preferences in `lib/agents/full-process.ts`

**Checkpoint**: Preference adjustment works - users can course-correct during their journey

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T051 [P] Add implementation selector dropdown to layout (following AF-01 pattern) in `app/full-process/full-process-layout-client.tsx`
- [ ] T052 [P] Create useImplementation hook for implementation switching in `src/full-process/hooks.ts`
- [ ] T053 [P] Create ImplementationProvider context wrapper in `src/full-process/index.ts`
- [ ] T054 Verify all acceptance scenarios from spec.md work correctly
- [ ] T055 Run `npm run lint` and fix any errors
- [ ] T056 Run `npm run build` and fix any errors
- [ ] T057 Validate quickstart.md scenarios work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 6 (Phase 3)**: Navigation - can start after Foundational
- **User Story 1 (Phase 4)**: Discovery - can start after Foundational (parallel with US6)
- **User Story 2 (Phase 5)**: Review - depends on US1 (needs generated affirmations)
- **User Story 5 (Phase 6)**: Summary - depends on US2 (needs collection to display)
- **User Story 3 (Phase 7)**: Check-in - depends on US2 (integrates into review loop)
- **User Story 4 (Phase 8)**: Adjustment - depends on US3 (extends check-in)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Setup → Foundational → ┬→ US6 (Navigation) ─────────────────────────────┐
                       │                                                │
                       └→ US1 (Discovery) → US2 (Review) → US5 (Summary)│→ Polish
                                              ↓                         │
                                           US3 (Check-in) → US4 (Adjust)┘
```

### Parallel Opportunities

**Phase 1 (Setup)**: T001, T002, T003 can all run in parallel

**Phase 2 (Foundational)**: T005, T006, T008, T009, T010 can run in parallel

**Phase 3 (US6)**: T013, T014, T016 can run in parallel after T012

**Phase 4 (US1)**: T017, T018, T019, T020 can all run in parallel

**Phase 5 (US2)**: T027 can run in parallel with T028 prep work

---

## Parallel Example: User Story 1 (Discovery)

```bash
# Launch all step components together (different files):
Task: "Create Step 1 (Primary Focus) component in components/full-process/step-focus.tsx"
Task: "Create Step 2 (Timing) component in components/full-process/step-timing.tsx"
Task: "Create Step 3 (Challenges) component in components/full-process/step-challenges.tsx"
Task: "Create Step 4 (Tone) component in components/full-process/step-tone.tsx"

# Then sequentially:
Task: "Create DiscoveryWizard container orchestrating steps 1-4"
Task: "Implement wizard state management with step validation"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (types, constants, seed)
2. Complete Phase 2: Foundational (agent, generation, progress bar)
3. Complete Phase 3: US6 - Navigation (users can access the feature)
4. Complete Phase 4: US1 - Discovery (users can express preferences)
5. Complete Phase 5: US2 - Review (users can build collection)
6. Complete Phase 6: US5 - Summary (users can export)
7. **STOP and VALIDATE**: Test full MVP flow end-to-end
8. Deploy/demo if ready

**MVP Scope**: Phases 1-6 (Setup + Foundational + US6 + US1 + US2 + US5) = 38 tasks

### Full Feature Delivery

1. Complete MVP (Phases 1-6)
2. Add Phase 7: US3 - Check-in (milestone confirmations)
3. Add Phase 8: US4 - Adjustment (preference refinement)
4. Add Phase 9: Polish (implementation selector, validation)

**Full Scope**: All 9 phases = 57 tasks

### Incremental Value Delivery

Each checkpoint delivers testable value:
- After US6: Feature is accessible (navigation works)
- After US1: Users can express preferences (discovery works)
- After US2: Users can build collections (core loop works)
- After US5: **Full MVP** - complete end-to-end experience
- After US3: Enhanced UX with progress milestones
- After US4: Full feature with preference adjustment

---

## Notes

- [P] tasks = different files, no dependencies on each other
- [Story] label maps task to specific user story for traceability
- Each user story phase has a checkpoint for independent validation
- No automated tests included (manual testing per Technical Context)
- Seed entries MUST be added before agent can generate affirmations
- Implementation selector is polish item - core feature works without it
