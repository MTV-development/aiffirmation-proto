# Feature Specification: Full Process 2 - Feedback-Aware Affirmation Generation

**Feature Branch**: `002-full-process-feedback`
**Created**: 2025-12-12
**Status**: Draft
**Input**: User description: "Create a new agent version 'Full Process 2' that learns from user approval/disapproval feedback during iterative affirmation generation, following existing system patterns and including seed data."

## Overview

**Full Process 2 is identical to Full Process 1 from a user experience perspective.** The discovery wizard, affirmation review cards, check-in flow, and summary screen all remain unchanged. Users interact with the same UI in the same way.

The difference is entirely behind the scenes: FP-02 makes smarter use of the feedback data that the system already collects. When users like or skip affirmations, FP-01 only uses this to avoid repeating shown affirmations. FP-02 goes further by analyzing *which* affirmations were approved versus skipped and using those patterns to generate better-aligned affirmations in subsequent batches.

**No UI changes. No new screens. No different user flows.** Just a more intelligent agent that learns from user behavior.

### Implementation Independence

**FP-02 is a completely independent implementation from FP-01.** While the user experience is identical, the codebase treats them as separate agents:

- Separate agent directory (`src/mastra/agents/full-process-2/`)
- Separate KV store namespace (`versions.fp-02.*`)
- Separate seed data entries
- No shared code between FP-01 and FP-02 agent implementations

This separation allows FP-02 to evolve independently without risk of breaking FP-01, and enables A/B testing between the two approaches.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Feedback-Influenced Affirmation Generation (Priority: P1)

As a user generating affirmations through multiple iterations, I want the system to learn from which affirmations I approved (liked) and which I disapproved (skipped) so that subsequent batches are more aligned with my preferences.

**Why this priority**: This is the core value proposition of Full Process 2 - using explicit approval/disapproval history to improve affirmation quality over iterations. Without this, the feature provides no differentiation from the existing FP-01 agent.

**Independent Test**: Can be fully tested by going through 2-3 affirmation batches, liking specific patterns (e.g., shorter affirmations, specific tones) and skipping others, then verifying that subsequent batches reflect these preferences more strongly.

**Acceptance Scenarios**:

1. **Given** a user has approved 5 affirmations and skipped 10 affirmations, **When** the system generates a new batch, **Then** the agent receives both the approved and skipped lists as context in the prompt.

2. **Given** a user consistently approves gentle, short affirmations and skips longer, commanding ones, **When** a new batch is generated, **Then** the new affirmations should trend toward the approved pattern (gentle, short).

3. **Given** a user has no previous feedback (first batch), **When** the system generates affirmations, **Then** the agent behaves identically to FP-01 (no feedback context in prompt).

---

### User Story 2 - KV Store Configuration (Priority: P2)

As a system administrator, I want the Full Process 2 agent to be configurable via the KV store following the same patterns as existing agents (FP-01, GT-01, AF-01) so that prompts can be iterated without code changes. This is purely a backend concern - users are unaware of which agent version is active.

**Why this priority**: Essential for maintaining consistency with the existing architecture and enabling prompt iteration, but secondary to the core feedback feature.

**Independent Test**: Can be tested by verifying that KV entries for `fp-02` exist and that modifying them changes agent behavior without code deployment.

**Acceptance Scenarios**:

1. **Given** the system has KV entries for `versions.fp-02.*`, **When** the agent is instantiated, **Then** it uses the system prompt and model settings from the KV store.

2. **Given** a KV entry `versions.fp-02.system.default` is updated, **When** the agent generates affirmations, **Then** it uses the updated system prompt.

3. **Given** the KV store has multiple implementations for FP-02 (e.g., `default`, `experimental`), **When** an implementation is selected, **Then** the correct prompts are loaded.

---

### User Story 3 - Seed Data for FP-02 (Priority: P3)

As a developer setting up the system, I want seed data for FP-02 to be included in the seed script so that the agent works out-of-the-box after running `npm run db:seed`.

**Why this priority**: Required for deployability and developer experience, but dependent on the KV store structure being defined first.

**Independent Test**: Can be tested by running `npm run db:seed` on a fresh database and verifying FP-02 generates affirmations correctly.

**Acceptance Scenarios**:

1. **Given** a fresh database, **When** `npm run db:seed` is executed, **Then** all FP-02 KV entries are created (system prompt, user prompt template, model name, temperature, info).

2. **Given** seed data exists for FP-02, **When** the seed script is re-run, **Then** existing entries are updated (upsert behavior) without errors.

---

### Edge Cases

- What happens when a user has approved 100+ affirmations? The prompt may become too long. System should limit the number of examples sent (e.g., most recent 20 approved, 20 skipped).
- How does the system handle when all shown affirmations were skipped (none approved)? The feedback should still be useful - the agent learns what NOT to generate.
- What happens if the approved and skipped lists contain contradictory patterns? The agent should attempt to balance based on recency or explicit user feedback text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a new agent version identified as `fp-02` (Full Process 2) in the KV store namespace.
- **FR-002**: System MUST include approved affirmations list in the prompt template when generating new batches.
- **FR-003**: System MUST include skipped/disapproved affirmations list in the prompt template when generating new batches.
- **FR-004**: System MUST instruct the agent (via system prompt) to analyze feedback patterns and adjust generation accordingly.
- **FR-005**: System MUST limit feedback lists to prevent prompt length issues (reasonable default: 20 most recent per category).
- **FR-006**: Agent MUST maintain all existing FP-01 affirmation quality guidelines (structure, tone, length, etc.).
- **FR-007**: System MUST register the new agent in the Mastra index following existing patterns.
- **FR-008**: Seed script MUST include FP-02 entries: `_info`, `_model_name`, `_temperature`, `system`, and `prompt`.
- **FR-009**: System MUST support both approved and skipped lists being empty (first-batch scenario).
- **FR-010**: Prompt template MUST use Liquid templating syntax consistent with other agent versions.
- **FR-011**: FP-02 MUST be implemented as a standalone agent with its own directory, not sharing code with FP-01.

### Non-Requirements (Explicitly Out of Scope)

- **NR-001**: No changes to the Full Process UI components (discovery wizard, affirmation cards, check-in, summary).
- **NR-002**: No new user-facing screens or flows.
- **NR-003**: No changes to how users interact with the application.
- **NR-004**: No persistent storage of user preferences across sessions.
- **NR-005**: No modifications to FP-01 agent code or KV entries - FP-02 is entirely independent.
- **NR-006**: No shared base classes or utility functions between FP-01 and FP-02 agents.

### Key Entities

- **Approved Affirmations**: List of affirmation strings the user has explicitly liked/approved during the session. Passed to the agent as positive examples.
- **Skipped Affirmations**: List of affirmation strings the user has explicitly skipped/disapproved during the session. Passed to the agent as negative examples.
- **FP-02 Agent Configuration**: KV store entries defining the agent's system prompt, user prompt template, model, and temperature settings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users report that affirmations in batch 3+ feel more aligned with their preferences compared to batch 1 (qualitative improvement in relevance).
- **SC-002**: The approval rate (likes/total shown) increases by at least 15% between the first batch and third batch for users who complete 3+ batches.
- **SC-003**: FP-02 agent can be instantiated and generates valid affirmations within 5 seconds of receiving a request.
- **SC-004**: System handles sessions with up to 50 approved and 50 skipped affirmations without errors or degraded response quality.
- **SC-005**: Seed data installs successfully on a fresh database in under 10 seconds.

## Assumptions

- **No UI changes required**: The existing Full Process UI already tracks `likedAffirmations` and `shownAffirmations`. The frontend can derive skipped affirmations (shown minus liked) and pass both lists to the server action without any component modifications.
- The existing page state arrays adequately capture all needed feedback data.
- FP-02 will use the same model (gpt-4o) as FP-01 unless otherwise configured in KV store.
- The feedback learning is session-based only - there is no persistence of user preferences across browser sessions.
- Switching between FP-01 and FP-02 is a backend/configuration concern only; users see no difference in the interface.
