# Feature Specification: Full Process Affirmation Generator

**Feature Branch**: `001-full-process-generator`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "Build a complete implementation of an affirmation generator as a new version in the current project, with its own menu item and complete UI realizing the documented UX flow including discovery wizard, review loop, mid-journey check-in, and collection summary."

## Overview

This feature implements a complete guided affirmation generation experience where users:
1. Provide their preferences through a 4-step discovery wizard
2. Review AI-generated affirmations one at a time, liking or skipping each
3. Receive periodic check-ins to confirm direction or adjust preferences
4. Export their final curated collection of affirmations

The feature requires its own navigation menu item and dedicated UI section within the existing application.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Discovery and Initial Generation (Priority: P1)

A user navigates to the new Full Process Generator section and completes a 4-step discovery wizard to define their preferences. The system then generates personalized affirmations based on their inputs.

**Why this priority**: This is the foundational flow - without discovery and initial generation, no other functionality is possible. Users must be able to express their needs and receive tailored affirmations.

**Independent Test**: Can be fully tested by completing the wizard and verifying affirmations are generated and displayed. Delivers immediate value by providing personalized affirmations.

**Acceptance Scenarios**:

1. **Given** a user is on the Full Process Generator page, **When** they complete all 4 discovery steps (focus, timing, challenges, tone) and click "Find Affirmations", **Then** the system displays a loading state and presents the first AI-generated affirmation.

2. **Given** a user is on Step 1 (Primary Focus), **When** they select a preset card (e.g., "Career Growth"), **Then** the card shows a selected state and the custom text field is cleared.

3. **Given** a user is on Step 1, **When** they type custom text instead of selecting a card, **Then** any card selection is cleared and the custom text is used as their focus.

4. **Given** a user is on Step 2 (Timing), **When** they select multiple preset options (e.g., "Morning" and "Evening"), **Then** all selected options show a selected state (multi-select allowed).

5. **Given** a user is on Step 3 (Challenges), **When** they toggle challenge badges on/off, **Then** the system accumulates their selections (multi-select) and custom text can be added independently.

6. **Given** a user is on Step 4 (Tone), **When** they select a tone card or enter custom tone text, **Then** only one option is active (single-select behavior).

7. **Given** a user has not provided input for the current step, **When** they try to proceed, **Then** the "Next" button is disabled.

---

### User Story 2 - Affirmation Review and Collection (Priority: P1)

A user reviews generated affirmations one by one, choosing to "Love This" (heart) or "Skip" each one, building a personal collection of affirmations that resonate with them.

**Why this priority**: This is the core interaction loop that delivers the main value - helping users find affirmations they connect with. Without this, users cannot build their collection.

**Independent Test**: Can be tested after Story 1 by liking and skipping affirmations and verifying the collection count increases correctly.

**Acceptance Scenarios**:

1. **Given** a user is viewing an affirmation, **When** they click "Love This" (heart button), **Then** the affirmation is added to their collection, the "Liked" counter increases, and the next affirmation is displayed.

2. **Given** a user is viewing an affirmation, **When** they click "Skip" (X button), **Then** the affirmation is discarded, the counter does not increase, and the next affirmation is displayed.

3. **Given** a user has liked at least one affirmation, **When** viewing any affirmation, **Then** a "Finish Early" option is visible.

4. **Given** a user clicks "Finish Early", **When** they have liked at least one affirmation, **Then** they proceed directly to the Collection Summary phase.

5. **Given** the current batch of affirmations is exhausted, **When** the user has liked fewer than 5 affirmations, **Then** the system requests a new batch of affirmations automatically.

---

### User Story 3 - Mid-Journey Check-In (Priority: P2)

At milestone points (5, 10, 15+ liked affirmations), the system pauses to show users their progress, confirm they're heading in the right direction, and offer adjustment options.

**Why this priority**: Important for user satisfaction and refinement, but not strictly required for basic functionality. Users can still build collections without check-ins.

**Independent Test**: Can be tested by liking exactly 5 affirmations and verifying the check-in screen appears with the collection summary.

**Acceptance Scenarios**:

1. **Given** a user has just liked their 5th affirmation, **When** the like action completes, **Then** the Mid-Journey Check-In screen is displayed showing a count of "5" and their collection.

2. **Given** a user is viewing the check-in screen, **When** they see "Your collection", **Then** all liked affirmations are displayed in a scrollable list.

3. **Given** a user is viewing the check-in screen, **When** they see "Your preferences", **Then** their current focus, timing, and tone settings are displayed.

4. **Given** a user clicks "Yes, Keep Going" on the check-in, **When** more affirmations are available, **Then** the review loop continues with the next affirmation.

5. **Given** a user clicks "Yes, Keep Going" on the check-in, **When** the current batch is exhausted, **Then** a new batch is generated and the review loop continues.

6. **Given** a user clicks "I'm happy with my collection", **When** on the check-in screen, **Then** they proceed to the Collection Summary phase.

---

### User Story 4 - Preference Adjustment During Check-In (Priority: P2)

During a mid-journey check-in, users can adjust their challenge focus and tone preferences to refine the type of affirmations generated in subsequent batches.

**Why this priority**: Enhances user experience by allowing course correction, but users can still complete the flow without adjustments.

**Independent Test**: Can be tested by reaching a check-in, clicking "Let's Adjust", modifying preferences, and verifying new affirmations reflect the changes.

**Acceptance Scenarios**:

1. **Given** a user clicks "Let's Adjust" on the check-in, **When** the adjustment panel appears, **Then** they see challenge badges and tone options.

2. **Given** a user is in the adjustment panel, **When** they select/deselect challenge badges, **Then** multiple challenges can be toggled independently.

3. **Given** a user is in the adjustment panel, **When** they select a different tone, **Then** only one tone is selected (single-select).

4. **Given** a user is in the adjustment panel, **When** they provide freeform feedback text, **Then** the feedback is captured.

5. **Given** a user clicks "Apply Adjustments", **When** they have made changes, **Then** a new batch of affirmations is generated using the adjusted preferences and the review loop continues.

6. **Given** a user clicks "Back" in the adjustment panel, **When** returning to the check-in, **Then** no changes are applied.

---

### User Story 5 - Collection Summary and Export (Priority: P1)

After completing the affirmation collection process, users view their complete collection and can export it via copy-to-clipboard or file download.

**Why this priority**: Essential for users to receive tangible output from the experience. Without export, the collected affirmations would be lost.

**Independent Test**: Can be tested by completing the flow and verifying both export options work correctly.

**Acceptance Scenarios**:

1. **Given** a user reaches the Collection Summary, **When** the page loads, **Then** all liked affirmations are displayed numbered (1, 2, 3, etc.) with a count in the header.

2. **Given** a user clicks "Copy All", **When** the action completes, **Then** all affirmations are copied to clipboard (separated by double newlines) and the button text changes to "Copied!" temporarily.

3. **Given** a user clicks "Download as Text", **When** the action completes, **Then** a text file named "my-affirmations.txt" is downloaded containing all affirmations.

4. **Given** a user clicks "Start Over", **When** on the summary page, **Then** the application resets to the discovery phase.

5. **Given** a user has no affirmations in their collection (edge case), **When** viewing the summary, **Then** a message indicates no affirmations were collected and export buttons are disabled.

---

### User Story 6 - Navigation Integration (Priority: P1)

The Full Process Generator is accessible via a dedicated menu item in the application's left sidebar navigation.

**Why this priority**: Users must be able to access the feature. Without navigation, the feature is unreachable.

**Independent Test**: Can be tested by clicking the new menu item and verifying it loads the Full Process Generator page.

**Acceptance Scenarios**:

1. **Given** a user is anywhere in the application, **When** they view the left sidebar, **Then** they see a menu item for the Full Process Generator.

2. **Given** a user clicks the Full Process Generator menu item, **When** the navigation completes, **Then** the discovery wizard (Step 1 of 4) is displayed.

---

### Edge Cases

- What happens when the affirmation generation API fails?
  - System displays contextual fallback affirmations using the user's focus area and challenges
- What happens when a user refreshes the page mid-flow?
  - All progress is lost (no session persistence); user returns to discovery phase
- What happens when a user selects no challenges (Step 3)?
  - This is allowed; challenges are optional if custom text is provided, or can be empty
- What happens when all affirmations in a batch are skipped?
  - System generates a new batch automatically
- How does the system handle rapid like/skip clicking?
  - Actions are processed sequentially; UI disables buttons briefly during transitions

## Requirements *(mandatory)*

### Functional Requirements

**Discovery Phase**
- **FR-001**: System MUST display a 4-step progressive wizard with a visual progress indicator showing "Step X of 4" and percentage
- **FR-002**: System MUST collect Primary Focus via 6 preset cards (Career Growth, Relationships, Health & Wellness, Confidence, Creativity, Self-Worth) or custom text input
- **FR-003**: System MUST collect Timing via 3 multi-select buttons (Morning, Evening, All-Day) with optional custom text
- **FR-004**: System MUST collect Challenges via 6 toggleable badges (Anxiety, Self-Doubt, Imposter Syndrome, Procrastination, Perfectionism, Burnout) with optional custom text
- **FR-005**: System MUST collect Tone via 4 single-select cards (Gentle & Compassionate, Powerful & Commanding, Practical & Grounded, Spiritual & Reflective) or custom text
- **FR-006**: System MUST enforce that each step has at least one input (preset or custom) before allowing progression
- **FR-007**: For single-select steps (Focus, Tone), selecting a preset MUST clear custom text and vice versa
- **FR-008**: For multi-select steps (Timing, Challenges), custom text MUST be additive to preset selections

**Affirmation Generation**
- **FR-009**: System MUST generate 5-8 personalized affirmations per batch based on user preferences
- **FR-010**: System MUST display a loading indicator during affirmation generation
- **FR-011**: System MUST fall back to contextual placeholder affirmations if API generation fails

**Review Loop**
- **FR-012**: System MUST display one affirmation at a time with progress indicator ("X of Y")
- **FR-013**: System MUST provide "Love This" (heart) action to add affirmation to collection
- **FR-014**: System MUST provide "Skip" (X) action to discard current affirmation
- **FR-015**: System MUST display running count of liked affirmations
- **FR-016**: System MUST provide "Finish Early" option when user has liked at least one affirmation

**Mid-Journey Check-In**
- **FR-017**: System MUST trigger check-in at 5, 10, and every 5 liked affirmations thereafter
- **FR-018**: System MUST display the user's collection of liked affirmations in a scrollable view
- **FR-019**: System MUST display current preferences summary (focus, timing, tone)
- **FR-020**: System MUST provide "Yes, Keep Going" action to continue review
- **FR-021**: System MUST provide "Let's Adjust" action to modify preferences
- **FR-022**: System MUST provide "I'm happy with my collection" action to finish
- **FR-023**: Adjustment panel MUST allow modifying challenges (multi-select) and tone (single-select)
- **FR-024**: Adjustment panel MUST accept optional freeform feedback text
- **FR-025**: Applying adjustments MUST trigger generation of new affirmation batch

**Collection Summary**
- **FR-026**: System MUST display all collected affirmations in numbered list format
- **FR-027**: System MUST provide "Copy All" action copying affirmations to clipboard
- **FR-028**: System MUST provide "Download as Text" action generating a downloadable text file
- **FR-029**: System MUST provide "Start Over" action resetting to discovery phase
- **FR-030**: System MUST handle empty collection with appropriate message and disabled export

**Navigation**
- **FR-031**: System MUST add a new menu item to the left sidebar for Full Process Generator
- **FR-032**: The new section MUST follow existing navigation patterns in the application

### Key Entities

- **UserPreferences**: Captures the user's discovery inputs including focus (string), timing (array), challenges (array), and tone (string)
- **Affirmation**: A generated affirmation text string that can be liked or skipped
- **AffirmationCollection**: The accumulated set of affirmations the user has liked during their session
- **AdjustedPreferences**: Modified preferences from check-in adjustments, including challenges, tone, and feedback

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the 4-step discovery wizard in under 2 minutes
- **SC-002**: System generates personalized affirmations within 5 seconds of completing discovery
- **SC-003**: Users can review and make like/skip decisions on affirmations at their own pace with no minimum time constraint
- **SC-004**: 80% of users who start the discovery flow reach the collection summary with at least 5 affirmations
- **SC-005**: Export actions (copy/download) complete successfully and contain all collected affirmations
- **SC-006**: System handles generation failures gracefully with contextual fallback content in 100% of error cases
- **SC-007**: Users can adjust preferences at check-in and receive noticeably different affirmations in subsequent batches
- **SC-008**: Navigation to Full Process Generator is accessible from anywhere in the application via sidebar

## Assumptions

- The application already has a sidebar navigation system (navTree in nav.config.ts) that supports adding new menu items
- The existing KV store and template engine can be leveraged for configurable prompts
- The Mastra AI framework is available for creating agents to generate affirmations
- No user authentication or session persistence is required for this version
- The existing Tailwind CSS and Shadcn component library will be used for UI consistency

## AI Agent Requirements

This feature requires AI-powered affirmation generation. The following agent capabilities are needed:

1. **Affirmation Generation Agent**: Takes user preferences (focus, timing, challenges, tone) and generates a batch of 5-8 personalized, contextually relevant affirmations
2. The agent should incorporate all preference dimensions to create affirmations that:
   - Address the user's primary focus area
   - Reflect the chosen tone/voice style
   - Acknowledge and counter the user's challenges
   - Be appropriate for the specified timing context
3. When preferences are adjusted at check-in, the agent should generate noticeably different affirmations that reflect the new settings
