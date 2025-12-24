# Feature Specification: Chat-Survey Agent (CS-01)

**Feature Branch**: `001-chat-survey`
**Created**: 2025-12-24
**Status**: Draft
**Input**: User description: "Use @docs/plans/2025-12-24-chat-survey/2025-12-24-chat-survey-research.md as your starting point for a spec for this project."
**Research Reference**: [2025-12-24-chat-survey-research.md](../../docs/plans/2025-12-24-chat-survey/2025-12-24-chat-survey-research.md)

---

## Overview

The Chat-Survey Agent (CS-01) is a hybrid affirmation generation experience that combines two distinct phases:

1. **Phase 1: Discovery Chat** - An interactive conversation that explores what the user wants to achieve with affirmations, gathering insights about their goals, challenges, and preferences
2. **Phase 2: Swipe-Based Generation** - One-by-one affirmation generation enriched with insights from Phase 1, where user feedback (approve/skip) informs subsequent generations

This addresses a gap in the current agent lineup: existing agents either require significant upfront effort (survey-first like FP-01, FP-02) or start cold with no context (zero-input like AP-02). CS-01 bridges these approaches by using natural conversation to build context before generating personalized affirmations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Discovery-to-Swipe Journey (Priority: P1)

A user wants personalized affirmations but doesn't know exactly what they need. They engage in a guided conversation where the system asks about their life areas of focus, current challenges, desired emotional tone, and past experiences with affirmations. After the conversation concludes, the system generates affirmations one-by-one, informed by everything learned in the chat. The user swipes right to save affirmations they like and left to skip ones that don't resonate.

**Why this priority**: This is the core value proposition - combining conversational discovery with reactive generation. Without this complete flow, the feature has no differentiating value.

**Independent Test**: Can be fully tested by starting a new session, completing 3-5 conversational turns, transitioning to swipe mode, and swiping through 5-10 affirmations. Delivers personalized affirmations informed by user's stated needs.

**Acceptance Scenarios**:

1. **Given** a new user starts the experience, **When** they are greeted, **Then** the system asks an open-ended question about their affirmation goals
2. **Given** the user is in the discovery chat, **When** they provide responses about their focus areas and challenges, **Then** the system asks follow-up questions to deepen understanding
3. **Given** sufficient information has been gathered, **When** the conversation concludes, **Then** the system presents a summary of understood themes and transitions to affirmation generation
4. **Given** the user is in swipe mode, **When** an affirmation is displayed, **Then** the affirmation reflects themes, tone, and insights gathered during the chat
5. **Given** the user swipes left on an affirmation, **When** the next affirmation is generated, **Then** it takes the skip feedback into account to improve relevance

---

### User Story 2 - Skip Discovery and Jump to Affirmations (Priority: P2)

A returning or impatient user wants to skip the conversational discovery phase and immediately start swiping through affirmations. They can opt out of the chat and proceed directly to affirmation generation with default/minimal context.

**Why this priority**: Important for user autonomy and reducing friction for users who know what they want or are returning to continue a previous session.

**Independent Test**: Can be tested by starting a session and selecting "Skip to affirmations" option, then swiping through affirmations with generic/diverse content.

**Acceptance Scenarios**:

1. **Given** a user is at the start of the experience, **When** they choose to skip discovery, **Then** the system transitions directly to swipe mode with diverse, exploratory affirmations
2. **Given** a user skipped discovery, **When** they swipe through affirmations, **Then** the system learns from their swipes to progressively personalize content (similar to AP-02 behavior)

---

### User Story 3 - Resume Interrupted Session (Priority: P2)

A user starts the discovery chat but needs to leave (closes browser, loses connection). When they return later, they can continue from where they left off rather than starting over.

**Why this priority**: Critical for user experience since discovery chat requires investment of time and thought. Losing progress would be frustrating and reduce engagement.

**Independent Test**: Can be tested by starting a discovery chat, completing 2 turns, closing the browser, reopening, and verifying the conversation continues from the last exchange.

**Acceptance Scenarios**:

1. **Given** a user has an in-progress discovery chat, **When** they close and reopen the application, **Then** they see an option to continue their previous session
2. **Given** a user resumes their session, **When** the chat interface loads, **Then** they see their previous conversation history and the next question from the system
3. **Given** a user has an in-progress swipe session, **When** they resume, **Then** they see their saved affirmations count and can continue swiping

---

### User Story 4 - View and Manage Saved Affirmations (Priority: P3)

After swiping through affirmations, the user wants to view all the affirmations they've saved (swiped right on). They can review their collection and optionally remove ones they no longer want.

**Why this priority**: Important for the complete experience but secondary to the core generation flow. Users need to access the value they've created.

**Independent Test**: Can be tested by saving 3+ affirmations via swipe right, then navigating to the saved view and verifying all saved affirmations are displayed.

**Acceptance Scenarios**:

1. **Given** the user has saved one or more affirmations, **When** they access the saved affirmations view, **Then** they see all their saved affirmations listed
2. **Given** the user is viewing saved affirmations, **When** they choose to remove one, **Then** it is removed from their saved list

---

### User Story 5 - Refine During Swipe Phase (Priority: P3)

During the swipe phase, if the user feels the affirmations are going in the wrong direction, they can provide additional guidance or return to chat mode to clarify their needs.

**Why this priority**: Provides flexibility and recovery mechanism but is an enhancement over the core flow.

**Independent Test**: Can be tested by entering swipe mode, skipping several affirmations, then triggering a refinement option and providing additional context.

**Acceptance Scenarios**:

1. **Given** the user has skipped multiple affirmations consecutively, **When** the system detects low satisfaction, **Then** it offers an option to refine preferences
2. **Given** the user chooses to refine, **When** they provide additional guidance, **Then** subsequent affirmations incorporate this new context

---

### Edge Cases

- What happens when the user provides very short or vague responses during discovery? System should ask clarifying follow-up questions and eventually proceed with available information
- How does the system handle when the user's stated preferences contradict their swipe behavior? Swipe behavior takes precedence as it reflects actual preferences
- What happens if the user approves all affirmations or skips all affirmations? System should detect the pattern and either offer more variety (all approved) or suggest refinement (all skipped)
- What if the conversation goes on too long without reaching a natural conclusion? System should gracefully prompt for transition to swipe phase after a reasonable number of turns (5-7 turns)
- How does the system handle network interruption during swipe? The last known state is preserved; user can resume without data loss

---

## Requirements *(mandatory)*

### Functional Requirements

#### Discovery Phase

- **FR-001**: System MUST greet users and initiate discovery with an open-ended question about their affirmation goals
- **FR-002**: System MUST ask follow-up questions based on user responses to gather information about: life areas of focus, current challenges, desired emotional tone, and past affirmation experiences
- **FR-003**: System MUST maintain conversation context across multiple turns during discovery
- **FR-004**: System MUST detect when sufficient information has been gathered to proceed (or when maximum turns reached)
- **FR-005**: System MUST generate a structured user profile containing themes, challenges, tone preference, and key insights from the conversation
- **FR-006**: System MUST allow users to skip discovery phase and proceed directly to swipe mode

#### Swipe Phase

- **FR-007**: System MUST generate affirmations one-by-one based on the user profile created during discovery
- **FR-008**: System MUST present affirmations with swipe-right (approve/save) and swipe-left (skip) actions
- **FR-009**: System MUST incorporate skip feedback to improve subsequent affirmation generation
- **FR-010**: System MUST incorporate approval patterns to reinforce successful affirmation characteristics
- **FR-011**: System MUST maintain a buffer of pre-generated affirmations to ensure smooth user experience
- **FR-012**: System MUST persist saved affirmations for later access by the user

#### Session Management

- **FR-013**: System MUST persist session state to allow users to resume interrupted sessions
- **FR-014**: System MUST provide a way for users to start a new session (clearing previous context)
- **FR-015**: System MUST track session progress (conversation history, profile, approved/skipped affirmations)

#### User Interface

- **FR-016**: System MUST provide a chat interface for the discovery phase
- **FR-017**: System MUST provide a card-based swipe interface for the generation phase
- **FR-018**: System MUST visually indicate the transition from discovery to swipe phase
- **FR-019**: System MUST show the count of saved affirmations during the swipe phase
- **FR-020**: System MUST provide access to view all saved affirmations

### Key Entities

- **Session**: Represents a user's complete journey through CS-01; contains state for both phases, unique identifier for resumption
- **User Profile**: Structured extraction from discovery chat; contains themes (array), challenges (array), tone preference (enum), insights (array), conversation summary
- **Conversation History**: Ordered list of user and assistant messages from discovery phase
- **Affirmation**: Individual affirmation text generated during swipe phase
- **Saved Affirmations**: Collection of affirmations the user has approved (swiped right)
- **Skipped Affirmations**: Collection of affirmations the user has declined (swiped left); used as negative feedback for generation

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users who complete the discovery phase generate affirmations with higher approval rates (swipe-right) compared to users who skip discovery, measured as 30% higher approval rate
- **SC-002**: Users complete the discovery conversation in under 5 minutes (3-7 conversational turns)
- **SC-003**: 80% of users who start a session complete at least the discovery phase or generate at least 5 affirmations
- **SC-004**: Users save an average of at least 5 affirmations per session
- **SC-005**: The system provides a seamless experience where users can resume an interrupted session within 5 seconds
- **SC-006**: Time from completing discovery to seeing the first affirmation is under 3 seconds
- **SC-007**: Affirmation generation keeps pace with user swiping (no waiting between swipes under normal conditions)
- **SC-008**: Users who complete the full journey report higher satisfaction compared to existing agents (qualitative feedback collection)

---

## Assumptions

The following assumptions were made based on the research document and industry standards:

1. **Storage persistence**: The system will use durable server-side storage that survives browser close and server restarts (as specified in research document - PostgreSQL via Supabase)
2. **Single user context**: Each session is tied to a single anonymous or identified user; no multi-user sharing
3. **Tone options**: Based on existing agents in the project, tone preferences will include options like "gentle", "assertive", "balanced", "spiritual"
4. **Discovery length**: A reasonable discovery conversation is 3-7 turns based on common conversational UX patterns
5. **Affirmation buffer**: System will pre-generate 10-12 affirmations initially and fetch more when buffer drops to 3, matching the AP-02 pattern from the research document
6. **Error handling**: Standard web application error handling with user-friendly messages and graceful degradation
7. **Authentication**: Uses existing project authentication patterns (if any); anonymous sessions are acceptable for MVP

---

## Out of Scope

The following items are explicitly not part of this feature:

- Multi-device real-time sync (resumption is device-specific via localStorage + server state)
- Social sharing of affirmations
- Integration with external calendars or reminders
- Voice-based interaction
- Affirmation history analytics or insights dashboard
- Customization of affirmation visual presentation (fonts, colors, backgrounds)
- Export/download functionality for saved affirmations
