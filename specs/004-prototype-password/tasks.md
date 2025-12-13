# Tasks: Prototype Password Protection

**Input**: Design documents from `/specs/004-prototype-password/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested (manual testing per plan.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router
- **App routes**: `app/`
- **Components**: `components/`
- **Middleware**: `middleware.ts` (project root)

---

## Phase 1: Setup

**Purpose**: No setup required - using existing Next.js project infrastructure

This feature adds to an existing Next.js application. No new project initialization needed.

**Checkpoint**: Existing project structure is ready for password protection implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before user stories can work

**⚠️ CRITICAL**: User Story 1 (password entry) depends on middleware being in place

- [x] T001 Create Next.js middleware for route protection in middleware.ts
- [x] T002 Create Server Action for password validation in app/password/actions.ts

**Checkpoint**: Foundation ready - middleware intercepts routes, Server Action validates passwords

---

## Phase 3: User Story 1 - First-Time Access (Priority: P1) 🎯 MVP

**Goal**: Users visiting for the first time see a password prompt and can gain access with "123mtv123"

**Independent Test**: Open incognito window, navigate to any page, verify redirect to /password, enter correct password, verify access granted

### Implementation for User Story 1

- [x] T003 [US1] Create password page directory structure at app/password/
- [x] T004 [US1] Create password entry page UI in app/password/page.tsx
- [x] T005 [US1] Style password form with Tailwind CSS (centered card, input, button, error state)
- [x] T006 [US1] Implement error message display for invalid password attempts
- [x] T007 [US1] Add redirect URL preservation (pass original URL to password page via query param)

**Checkpoint**: User Story 1 complete - first-time users see password prompt, can authenticate with correct password, see error on wrong password

---

## Phase 4: User Story 2 - Remembered Access (Priority: P2)

**Goal**: Users who authenticated within 30 days bypass the password prompt entirely

**Independent Test**: Authenticate once, close browser, reopen, navigate to any page, verify no password prompt appears

### Implementation for User Story 2

- [x] T008 [US2] Configure cookie with 30-day expiration in app/password/actions.ts
- [x] T009 [US2] Verify middleware correctly reads and validates existing auth cookie
- [x] T010 [US2] Test cookie persistence across browser sessions (manual verification)

**Checkpoint**: User Story 2 complete - returning users within 30 days access directly without password prompt

---

## Phase 5: User Story 3 - Session Expiration (Priority: P3)

**Goal**: Users with expired authentication (>30 days) are prompted again

**Independent Test**: Manipulate cookie timestamp in browser dev tools to simulate expiration, refresh page, verify password prompt appears

### Implementation for User Story 3

- [x] T011 [US3] Verify cookie MaxAge is correctly set to 30 days (2592000 seconds)
- [x] T012 [US3] Document manual test procedure for expiration verification in quickstart.md

**Checkpoint**: User Story 3 complete - expired sessions require re-authentication

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and quality gates

- [x] T013 Run `npm run lint` and fix any errors
- [x] T014 Run `npm run build` and verify production build succeeds
- [ ] T015 Manual test: Verify all routes are protected (navigate to /settings, /ag-aff-01, etc.)
- [ ] T016 Manual test: Verify API routes (/api/*) are accessible after authentication

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A - existing project
- **Foundational (Phase 2)**: No dependencies - can start immediately
- **User Story 1 (Phase 3)**: Depends on Foundational (T001, T002)
- **User Story 2 (Phase 4)**: Depends on US1 completion (cookie must be set correctly first)
- **User Story 3 (Phase 5)**: Depends on US2 completion (tests expiration of existing cookie)
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Core feature - blocks all other stories
- **User Story 2 (P2)**: Depends on US1 (uses same cookie mechanism)
- **User Story 3 (P3)**: Depends on US2 (tests expiration of persistence mechanism)

Note: This feature has sequential dependencies between stories because they all use the same cookie mechanism. US2 validates that US1's cookie works correctly, and US3 validates US2's expiration works.

### Parallel Opportunities

- T001 and T002 (Foundational) can run in parallel - different files
- T003, T004, T005 (UI tasks) should run sequentially within the same file area

---

## Parallel Example: Foundational Phase

```bash
# Launch foundational tasks together (different files):
Task: "Create Next.js middleware for route protection in middleware.ts"
Task: "Create Server Action for password validation in app/password/actions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002)
2. Complete Phase 3: User Story 1 (T003-T007)
3. **STOP and VALIDATE**: Test password protection manually
4. Deploy if ready - prototype is now protected

### Incremental Delivery

1. Foundational → T001, T002
2. Add User Story 1 → Test manually → MVP ready!
3. Add User Story 2 → Verify 30-day persistence
4. Add User Story 3 → Verify expiration works
5. Polish → Lint, build, final verification

---

## Notes

- All tasks affect few files - this is a small, focused feature
- No database changes required - uses browser cookies only
- Manual testing is sufficient for a prototype-level feature
- Total estimated: 16 tasks across 6 phases
- Critical path: T001 → T002 → T003 → T004 → T005 → T006 → T007 (MVP)
