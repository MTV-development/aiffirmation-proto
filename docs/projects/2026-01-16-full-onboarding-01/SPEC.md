# Feature Specification: FO-01 Full Onboarding Flow

**Version ID**: `fo-01`
**Created**: 2026-01-16
**Status**: Draft
**Branch**: `2026-01-16-full-onboarding-01`

## Overview

FO-01 implements a complete, warm onboarding experience that guides new users from first launch to a personalized affirmation collection. Unlike previous agent versions (AF-01, FP-01, AP-01, CS-01) which focused on specific interaction patterns, FO-01 represents a **complete end-to-end user journey**.

**Core scope (must implement):**
1. Welcome & name collection (Steps 0-2)
2. Intent discovery with open text + inspiration fallback (Steps 3, 3.2)
3. AI-powered affirmation generation (100 affirmations upfront)
4. Swipe-based selection with iterative batches (Steps 4-6.3)
5. Completion and display of curated collection (Step 10)

**Illustrative scope (UI mockups only, not functional):**
- Background selection (Step 7)
- Notification setup (Step 8)
- Light paywall (Step 9)

These illustrative steps demonstrate the full envisioned flow but are **not connected to backend systems** in this prototype. They are included to test the complete UX journey.

This flow synthesizes learnings from previous prototypes:
- **AP-01's open text input** produces highly personalized affirmations
- **AP-01's affirmation guidelines** produce "stunning" quality (detailed psychological principles)
- **AP-02's swipe mechanics** feel interactive and mobile-native
- **FP-01's topic inspiration** helps users who don't know where to start

**Key insight from user testing**: AP-01's open text approach + detailed affirmation guidelines produced affirmations described as "stunning" and "crazy good" — FO-01 adopts these exact patterns.

## User Journey (Exact Copy from Source)

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 0: Welcome Screen                                          │
│  Headline: "The way you speak to yourself becomes the way you    │
│            live. 🌿🌸"                                           │
│  [Continue]                                                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 1: First Name                                              │
│  Headline: "What should we call you? 🌸"                         │
│  Placeholder: "Type your first name"                             │
│  [Continue]                                                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: Welcome                                                 │
│  Text: "Welcome, {name} 💛                                       │
│         Let's create affirmations that feel right for you."      │
│  [Continue]                                                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Open Text (Your Intention)                              │
│  Headline: "What do you hope affirmations can help you with,     │
│            {name}?"                                              │
│  Placeholder: "Write anything you want…"                         │
│  Secondary: [I don't know] → Step 3.2                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓ (if "I don't know")
┌──────────────────────────────────────────────────────────────────┐
│  Step 3.2: Inspiration                                           │
│  Headline: "Get inspired by others 💛"                           │
│  Text: "Here are a few common themes people start with.          │
│         Pick one or two — or write your own."                    │
│  [Topic chips + free text space]                                 │
│  [Continue]                                                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Before Swipe (Explain the Logic)                        │
│  Headline: "Thank you, {name} — let's shape this together 💛"    │
│  Text: "Next, we'll show affirmations based on what you shared.  │
│         You'll see them one by one.                              │
│         Swipe DOWN (toward you) to KEEP it.                      │
│         Swipe UP (away) if it doesn't feel right.                │
│         Your swipes help us tailor the next ones to you."        │
│  [Start]                                                         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 5: Swipe (Batch 1 - 10 affirmations)                       │
│  Label: "Swipe for next"                                         │
│  Counter: "Affirmation 1 of 10"                                  │
│  [Affirmation Card]                                              │
│  ↓ Swipe down = "Successfully saved" feedback                    │
│  ↑ Swipe up = "Discarded" feedback                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 6: Add More? (After Batch 1)                               │
│  Headline: "Perfect, {name} ✨"                                  │
│  Text: "The ones you liked are now on your personal affirmation  │
│         list. Want to add a few more? Each swipe helps us show   │
│         even better affirmations for you."                       │
│  [Continue] → Step 6.1                                           │
│  Secondary: [I'm good with the affirmations I chose] → Step 7    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 6.1: Swipe (Batch 2 - 10 affirmations)                     │
│  Counter: "Affirmation 1 of 10"                                  │
│  (Same swipe mechanics as Step 5)                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 6.2: Add More? (After Batch 2)                             │
│  Headline: "Great job, {name} ✨"                                │
│  Text: "Your list is getting stronger and more personal.         │
│         Would you like to add a few more affirmations?"          │
│  [Yes, please] → Step 6.3                                        │
│  [No, continue] → Step 7                                         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 6.3: Swipe (Batch 3 - 10 affirmations) + Completion        │
│  (After batch 3 completes:)                                      │
│  Headline: "Perfect, {name} ✨"                                  │
│  Text: "You now have a strong list of personal affirmations.     │
│         Next, let's make them feel even more you with a          │
│         beautiful background."                                   │
│  [Continue] → Step 7                                             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 7: Background (ILLUSTRATIVE)                               │
│  Headline: "Make your affirmations look beautiful ✨"            │
│  Text: "Choose a background for your affirmations — you can      │
│         always explore more later."                              │
│  [Background grid]                                               │
│  [Continue]                                                      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 8: Notifications (ILLUSTRATIVE)                            │
│  Headline: "Set up reminders with your personal affirmations 💛" │
│  Text: "Affirmations work best when they gently meet you again   │
│         and again."                                              │
│  Question: "How many times a day would you like one sent to you?"│
│  [Notification setup]                                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 9: Light Paywall (ILLUSTRATIVE)                            │
│  Headline: "More support, whenever you want 🌿"                  │
│  Text: "Get 3 days free of premium. With Premium, you can create │
│         hundreds of lists and expand your personal list with     │
│         100s of affirmations."                                   │
│  [Try free for 3 days]                                           │
│  Secondary: [Not now]                                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Step 10: Finish                                                 │
│  Headline: "You're all set, {name} 🌸"                           │
│  Text: "Open your affirmations now — say them out loud or read   │
│         them to yourself silently. You deserve kind words."      │
│  [See my affirmations] → Shows curated collection                │
└──────────────────────────────────────────────────────────────────┘
```

## User Stories & Acceptance Criteria

### User Story 1 - Welcome & Name Collection (Priority: P1)

A new user launches the app and is greeted with a warm welcome message, then provides their first name to personalize the experience.

**Why P1**: The name is used throughout the onboarding to create a personal connection. Without this, subsequent steps lose their warmth.

**Acceptance Scenarios**:

1. **Given** a user opens the app for the first time, **When** the welcome screen loads, **Then** they see the headline "The way you speak to yourself becomes the way you live." and a Continue button.

2. **Given** a user taps Continue on Step 0, **When** Step 1 loads, **Then** they see "What should we call you?" with a text input placeholder "Type your first name".

3. **Given** a user enters their name and taps Continue, **When** Step 2 loads, **Then** they see "Welcome, {name}" with their actual name displayed.

4. **Given** a user has not entered a name, **When** they try to continue, **Then** the Continue button is disabled.

---

### User Story 2 - Intent Discovery (Priority: P1)

A user describes what they hope affirmations can help with, either through free text or by selecting inspiration topics.

**Why P1**: This input drives the AI generation. The quality of affirmations depends entirely on capturing the user's intention.

**Acceptance Scenarios**:

1. **Given** a user is on Step 3, **When** the screen loads, **Then** they see "What do you hope affirmations can help you with, {name}?" with an open text area.

2. **Given** a user types their intention and taps Continue, **When** the system processes, **Then** the text is captured as their intention for AI generation.

3. **Given** a user taps "I don't know", **When** Step 3.2 loads, **Then** they see "Get inspired by others" with topic chips (e.g., Confidence, Self-Worth, Relationships, Career, Health, Stress, Gratitude).

4. **Given** a user selects 1-2 topic chips on Step 3.2, **When** they tap Continue, **Then** the selected topics become their intention.

5. **Given** a user can also type custom text on Step 3.2, **When** they combine chips with text, **Then** both are captured as intention.

---

### User Story 3 - Swipe-Based Affirmation Selection (Priority: P1)

A user reviews AI-generated affirmations one by one using swipe gestures, building their personal collection.

**Why P1**: This is the core interaction loop that delivers personalized affirmations.

**Acceptance Scenarios**:

1. **Given** a user taps Start on Step 4, **When** the swipe interface loads, **Then** they see the first affirmation with counter "Affirmation 1 of 10" and label "Swipe for next".

2. **Given** a user swipes an affirmation **down** (toward them), **When** the gesture completes, **Then** the affirmation is saved with "Successfully saved" feedback, and the next affirmation appears.

3. **Given** a user swipes an affirmation **up** (away), **When** the gesture completes, **Then** the affirmation is discarded with "Discarded" feedback, and the next affirmation appears.

4. **Given** a user completes batch 1 (10 affirmations), **When** Step 6 loads, **Then** they see "Perfect, {name} ✨" with [Continue] and [I'm good with the affirmations I chose] options.

5. **Given** a user taps Continue on Step 6, **When** Step 6.1 loads, **Then** they see the next batch of 10 affirmations (batch 2).

6. **Given** a user completes batch 2, **When** Step 6.2 loads, **Then** they see "Great job, {name} ✨" with [Yes, please] and [No, continue] options.

7. **Given** a user taps "Yes, please" on Step 6.2, **When** Step 6.3 swipe loads, **Then** they see the final batch of 10 affirmations (batch 3).

8. **Given** a user completes batch 3, **When** the completion message loads, **Then** they see "Perfect, {name} ✨ You now have a strong list" and proceed to Step 7.

9. **Given** a user taps "I'm good" or "No, continue" at any checkpoint, **When** processing completes, **Then** they skip remaining batches and proceed to Step 7.

---

### User Story 4 - Background Personalization (Priority: P2)

A user selects a visual background theme for their affirmation display.

**Why P2**: Visual appeal enhances the experience but doesn't block core functionality.

**Acceptance Scenarios**:

1. **Given** a user reaches Step 7, **When** the screen loads, **Then** they see "Make your affirmations look beautiful" with a grid of background options.

2. **Given** a user taps a background, **When** selected, **Then** it shows a selected state and becomes their chosen background.

3. **Given** a user taps Continue without selecting, **When** proceeding, **Then** a default background is applied.

---

### User Story 5 - Notification Setup (Priority: P2)

A user configures how often they want to receive affirmation reminders.

**Why P2**: Notifications drive retention but the flow can complete without them.

**Acceptance Scenarios**:

1. **Given** a user reaches Step 8, **When** the screen loads, **Then** they see "How many times a day would you like one sent to you?" with frequency options.

2. **Given** a user selects a frequency (e.g., 3x/day), **When** they continue, **Then** this preference is saved for notification scheduling.

3. **Given** a user skips or selects "none", **When** they continue, **Then** no notifications are scheduled.

---

### User Story 6 - Light Paywall (Priority: P3)

A user sees a premium upsell offering a free trial.

**Why P3**: Monetization is important but not critical for MVP onboarding flow.

**Acceptance Scenarios**:

1. **Given** a user reaches Step 9, **When** the screen loads, **Then** they see "Get 3 days free of premium" with trial and skip options.

2. **Given** a user taps "Try free for 3 days", **When** the action completes, **Then** they enter the trial flow (integration with payment system).

3. **Given** a user taps "Not now", **When** they continue, **Then** they proceed to Step 10 without trial.

---

### User Story 7 - Completion & Transition to Data Feed (Priority: P1)

A user completes onboarding and transitions to the main app experience.

**Why P1**: Without a clear completion, users don't know they've finished or how to access their affirmations.

**Acceptance Scenarios**:

1. **Given** a user reaches Step 10, **When** the screen loads, **Then** they see "You're all set, {name}!" with a CTA to see their affirmations.

2. **Given** a user taps "See my affirmations", **When** navigation completes, **Then** they are taken to the data feed showing their personal affirmation list.

3. **Given** a user's personal list is populated, **When** viewing the data feed, **Then** their AI-generated approved affirmations appear first.

---

## Requirements

### Functional Requirements

**Welcome & Name (Steps 0-2)**
- **FR-001**: System MUST display a welcome screen with inspirational copy and Continue CTA.
- **FR-002**: System MUST collect user's first name with validation (non-empty).
- **FR-003**: System MUST personalize all subsequent screens using the captured name.

**Intent Discovery (Steps 3, 3.2)**
- **FR-004**: System MUST provide an open text input for users to describe their intention.
- **FR-005**: System MUST provide an "I don't know" option leading to inspiration topics.
- **FR-006**: System MUST display 6-8 topic chips as inspiration (Confidence, Self-Worth, Relationships, Career, Health, Stress, Gratitude, etc.).
- **FR-007**: System MUST allow multi-select of topic chips (1-3 recommended).
- **FR-008**: System MUST allow combining topic selection with custom text.

**Swipe Introduction (Step 4)**
- **FR-009**: System MUST explain the swipe mechanics before starting (down=keep, up=discard).
- **FR-010**: System MUST provide clear visual indicators for swipe directions.

**Swipe Loop (Steps 5, 6, 6.1, 6.2, 6.3)**
- **FR-011**: System MUST generate **100 AI-powered affirmations upfront** after user provides intention.
- **FR-012**: System MUST display affirmations one at a time with swipe gesture support.
- **FR-013**: System MUST show a counter (e.g., "Affirmation 3 of 10") and label "Swipe for next".
- **FR-014**: Swipe down MUST save the affirmation with visual confirmation ("Successfully saved").
- **FR-015**: Swipe up MUST discard the affirmation with feedback ("Discarded").
- **FR-016**: System MUST track approved and disapproved affirmations separately.
- **FR-017**: After batch 1 (Step 6): Show "Perfect, {name} ✨" with Continue/I'm good options.
- **FR-018**: After batch 2 (Step 6.2): Show "Great job, {name} ✨" with Yes, please/No, continue options.
- **FR-019**: After batch 3 (Step 6.3): Show "Perfect, {name} ✨" and proceed to Step 7.
- **FR-020**: System MUST limit swipe interaction to 3 batches maximum (30 affirmations reviewed).

**Background Selection (Step 7) - ILLUSTRATIVE**
- **FR-021**: System MUST display a grid of background options (UI mockup only).
- **FR-022**: System MUST allow selection with visual indicator (no backend persistence).
- **FR-023**: Clicking Continue proceeds to Step 8 regardless of selection.

**Notifications (Step 8) - ILLUSTRATIVE**
- **FR-024**: System MUST display notification frequency options (UI mockup only).
- **FR-025**: Clicking Continue proceeds to Step 9 (no notification system integration).

**Paywall (Step 9) - ILLUSTRATIVE**
- **FR-026**: System MUST display premium benefits and trial offer copy.
- **FR-027**: Both "Try free" and "Not now" proceed to Step 10 (no payment integration).

**Completion (Step 10)**
- **FR-028**: System MUST display "You're all set, {name} 🌸" with full completion copy.
- **FR-029**: System MUST provide CTA "See my affirmations".
- **FR-030**: System MUST display the user's approved affirmations as their personal collection.

### Non-Functional Requirements

- **NFR-001**: Each step transition SHOULD animate smoothly (< 300ms).
- **NFR-002**: Swipe gestures MUST feel responsive (< 100ms feedback).
- **NFR-003**: AI generation MUST complete within 5 seconds per batch.
- **NFR-004**: System MUST gracefully handle AI generation failures with fallback affirmations.
- **NFR-005**: Total onboarding SHOULD complete in under 5 minutes for an average user.

---

## Agent Architecture

### Architecture Pattern: Simple Agent (like AF-01/GT-01)

FO-01 uses the **Simple Agent pattern** — a single agent call that generates all affirmations upfront. This is the simplest pattern in the codebase, similar to how `AF-01` and `GT-01` work.

**Why this pattern:**
- No persistence needed (UX prototype only)
- No iterative feedback learning required
- Single generation call is sufficient
- Client-side state manages the swipe flow

**Not using:**
- ❌ Workflow pattern (CS-01) - overkill for no-persistence prototype
- ❌ Feedback learning (FP-02) - no server-side state tracking
- ❌ Multi-agent coordination - single agent is sufficient

---

### Agent Implementation

**Directory:** `src/mastra/agents/fo-01/`

```
src/mastra/agents/fo-01/
├── agent.ts          # Agent definition + factory
└── index.ts          # Exports
```

**Pattern follows GT-01:**
```typescript
// Static agent for Mastra registration
export const fo01Agent = new Agent({
  id: 'fo-01',
  name: 'Full Onboarding Affirmation Generator',
  instructions: DEFAULT_INSTRUCTIONS,
  model: getModel(),
});

// Factory for KV-based configuration
export async function createFO01Agent(implementation: string = 'default'): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt('fo-01', implementation);
  const modelName = await getAgentModelName('fo-01', implementation);

  return new Agent({
    id: `fo-01-${implementation}`,
    name: 'Full Onboarding Affirmation Generator',
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: getModel(modelName || undefined),
  });
}
```

---

### Server Action

**File:** `app/fo-01/actions.ts`

```typescript
'use server';

export async function generateAffirmationsFO01(options: {
  name: string;
  intention: string;
  implementation?: string;
}): Promise<{ affirmations: string[]; error?: string }> {
  const { name, intention, implementation = 'default' } = options;

  // 1. Render user prompt from KV template
  const { output: userPrompt } = await renderTemplate({
    key: 'prompt',
    version: 'fo-01',
    implementation,
    variables: { name, intention },
  });

  // 2. Get temperature from KV
  const temperature = await getKVText(`versions.fo-01._temperature.${implementation}`);

  // 3. Create agent with KV-configured system prompt
  const agent = await createFO01Agent(implementation);

  // 4. Generate 100 affirmations
  const result = await agent.generate(userPrompt, {
    modelSettings: { temperature: parseFloat(temperature) || 0.8 },
  });

  // 5. Parse response (expect JSON array or numbered list)
  const affirmations = parseAffirmationResponse(result.text);

  return { affirmations };
}
```

---

### KV Store Entries

**Namespace:** `versions.fo-01.*`

| Key | Purpose |
|-----|---------|
| `versions.fo-01._info.default` | Description of FO-01 version |
| `versions.fo-01._model_name.default` | Model override (e.g., `google/gemini-2.5-flash`) |
| `versions.fo-01._temperature.default` | Temperature (e.g., `0.8`) |
| `versions.fo-01.system.default` | System prompt for affirmation generation |
| `versions.fo-01.prompt.default` | User prompt template (Liquid) |

### Affirmation Quality Guidelines (from AP-01)

AP-01 produces "stunning" affirmations because of detailed psychological guidelines. FO-01 adopts these proven patterns:

#### Structure Rules
- **First-person singular only**: I, My
- **Present tense only**: no future or past
- **Declarative statements**: no questions or conditionals
- **Positive framing**: describe what IS, not what is avoided

**Growth-form statements** when direct identity claims sound unrealistic:
- "I am learning to…"
- "I am becoming…"
- "I am open to…"
- "I am practicing…"

#### Sentence Opener Distribution
- "I am…" (35–40%)
- "I + verb…" (30–35%) — trust, choose, allow, honor, welcome
- Growth-form statements (10–15%)
- "My…" (10%)
- Other (≤5%)

#### Length Guidelines
- **Target**: 5–9 words
- **Acceptable range**: 3–14 words
- Shorter (3–6 words) for identity statements
- Longer (8–12 words) for nuance or clarity

#### Tone (Always Maintain)
- Calm, grounded, steady foundation
- Warmth and self-compassion
- Confidence without forcefulness
- Sincerity and authenticity — avoid slogans or hype

#### Content Principles
- Address user's concerns directly based on their words
- **Believability**: avoid grandiose or absolute claims
- Reinforce agency and inner stability
- **Emotionally safe**: never dismissive of struggle

#### Power Verbs
- **Being**: am, deserve, am worthy of
- **Trust**: trust, believe in, rely on
- **Choice**: choose, allow, let, give myself permission
- **Emotional**: welcome, honor, embrace, cherish, nourish
- **Action**: release, let go, steady, rise, hold
- **Growth**: learn, grow, soften, open, become

#### Avoid (Critical)
- Exclamation marks or excited tone
- Superlatives: best, perfect, unstoppable
- Comparisons to others or past self
- Conditionals: if, when, once
- Negative framing ("not anxious")
- External dependency ("Others see my worth")
- Overreach ("Nothing can stop me")
- Multi-clause or complex sentences
- Toxic positivity

---

### System Prompt Template

```
You are an expert affirmation coach who creates deeply meaningful, psychologically effective affirmations.

The user has shared what they hope affirmations can help them with. Generate exactly 100 personalized affirmations that address their specific situation.

## Affirmation Guidelines

[Include all structure, opener distribution, length, tone, content principles, power verbs, and avoid rules from above]

## Output Format

Return ONLY a JSON array of exactly 100 affirmation strings:
["Affirmation 1", "Affirmation 2", ..., "Affirmation 100"]

No explanations, no other text — just the JSON array.
```

**User Prompt Template:**
```liquid
{{ name }} shared the following about what they hope affirmations can help with:

"{{ intention }}"

Generate 100 personalized affirmations that speak directly to their situation.
```

**Model Settings:**
- Temperature: `0.9` (high creativity, like AP-01)
- Model: `openai/gpt-4o-mini` or `google/gemini-2.5-flash`

---

### UI State Management (No Server State)

**All state is client-side React state.** No workflows, no database persistence.

```typescript
// app/fo-01/page.tsx (or components/fo-experience.tsx)

interface OnboardingState {
  // Navigation
  currentStep: number;  // 0-10

  // User inputs (transient)
  name: string;
  intention: string;
  selectedTopics: string[];

  // AI generation (transient)
  allAffirmations: string[];      // All 100 from agent
  isGenerating: boolean;

  // Swipe state (transient)
  currentBatchIndex: number;      // 0, 1, or 2
  currentCardIndex: number;       // 0-9 within batch
  approvedAffirmations: string[]; // User's selections

  // Illustrative choices (not persisted)
  selectedBackground: string | null;
  notificationFrequency: number | null;
}
```

**State resets on page refresh** — this is intentional for a UX prototype.

---

## Data Model

### Client-Side State Only (No Persistence)

**This is a UX prototype. Nothing is persisted to the database.**

```typescript
interface OnboardingState {
  // Navigation
  currentStep: number;  // 0-10

  // User inputs
  name: string;
  intention: string;
  selectedTopics: string[];

  // AI generation
  allAffirmations: string[];      // All 100 from single agent call
  isGenerating: boolean;
  generationError: string | null;

  // Swipe state
  currentBatchIndex: number;      // Which batch (0, 1, 2)
  currentCardIndex: number;       // Index within current batch (0-9)
  approvedAffirmations: string[]; // User's approved selections
  skippedAffirmations: string[];  // User's skipped (not used, just tracked)

  // Illustrative choices (UI state only, not saved)
  selectedBackground: string | null;
  notificationFrequency: number | null;
}
```

### What Happens on Completion

At Step 10, the user sees their `approvedAffirmations` displayed.

**No data is saved:**
- Name is not stored
- Affirmations are not stored
- Background choice is not stored
- Notification preference is not stored

**Refreshing the page resets everything** — this is expected prototype behavior.

---

## UI Components

### File Structure

```
app/fo-01/
├── page.tsx                    # Main page, mounts FOExperience
├── layout.tsx                  # Layout with TopSubmenu
├── actions.ts                  # Server action: generateAffirmationsFO01
└── components/
    ├── fo-experience.tsx       # Main state manager (like cs-experience.tsx)
    ├── step-welcome.tsx        # Steps 0-2: Welcome flow
    ├── step-intent.tsx         # Steps 3, 3.2: Intent + inspiration
    ├── step-swipe-intro.tsx    # Step 4: Swipe explanation
    ├── swipe-phase.tsx         # Steps 5, 6.1, 6.3: Swipe cards (adapted from CS-01)
    ├── step-checkpoint.tsx     # Steps 6, 6.2: "Add more?" screens
    ├── step-illustrative.tsx   # Steps 7-9: Background, notifications, paywall (UI only)
    └── step-completion.tsx     # Step 10: Final screen with approved affirmations
```

### Key Component: Adapted SwipePhase

Based on `app/chat-survey/components/swipe-phase.tsx` but modified for:
- **Up/down swipe** instead of left/right
- **Down = keep** (toward user), **Up = discard** (away)
- **Visual feedback**: "Successfully saved" / "Discarded"
- **Counter**: "Affirmation X of 10"

```typescript
// Framer Motion transform for vertical swipe
const y = useMotionValue(0);
const rotate = useTransform(y, [-200, 200], [5, -5]);  // Subtle rotation
const opacity = useTransform(y, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

// Swipe detection
const handleDragEnd = (_, info: PanInfo) => {
  const offset = info.offset.y;
  if (Math.abs(offset) > SWIPE_THRESHOLD) {
    const direction = offset > 0 ? 'down' : 'up';  // down = keep, up = discard
    handleSwipe(direction);
  }
};
```

### Inspiration Topics (Step 3.2)

Topic chips for "I don't know" fallback:
- Confidence
- Self-Worth
- Relationships
- Career
- Health & Wellness
- Stress & Anxiety
- Gratitude
- (Custom text input also available)

---

## Impact on Existing App

**OUT OF SCOPE for FO-01 prototype.**

The "Logic after onboarding" document describes post-onboarding integration (data feed, notifications, favorites, reopen behavior). These integrations are **not part of this prototype** — FO-01 focuses solely on the onboarding flow itself.

For reference, the source document describes three potential integration versions:
- Version 1: First visit data feed changes only
- Version 2: + AI affirmations in notifications
- Version 3: + Categories page redesign

These would be separate implementation efforts after validating the onboarding flow.

---

## Success Criteria

- **SC-001**: Complete onboarding flow is navigable from Step 0 to Step 10
- **SC-002**: AI generates 100 affirmations based on user intention within 60 seconds
- **SC-003**: Swipe gestures work smoothly with visual feedback
- **SC-004**: User's approved affirmations are displayed at completion (Step 10)
- **SC-005**: All copy matches source document exactly (including emojis)
- **SC-006**: E2E test passes — full flow completes without errors
- **SC-007**: Navigation includes FO-01 with Demo and Info tabs
- **SC-008**: Info tab displays version description and key features

---

## Navigation & Info Tabs

FO-01 needs the standard navigation structure like other agent versions:

**Add to `nav.config.ts`:**
```typescript
{
  label: 'FO-01',
  path: '/fo-01',
  children: [
    { label: 'Demo', path: '/fo-01' },
    { label: 'Info', path: '/fo-01/info' },
  ],
}
```

**Required pages:**
- `app/fo-01/page.tsx` — Main demo (onboarding flow)
- `app/fo-01/info/page.tsx` — Info tab with version description
- `app/fo-01/layout.tsx` — Layout with TopSubmenu

**Info tab content:**
- Version name: "FO-01: Full Onboarding"
- Description: Complete warm onboarding flow with AI-generated affirmations
- Key features: Open text intention, swipe selection, 100 affirmations
- Based on: AP-01's affirmation quality guidelines

---

## Overview Page Update

**Add FO-01 to `app/overview/page.tsx`:**

**Version card:**
```typescript
{
  id: 'FO-01',
  name: 'Full Onboarding',
  href: '/fo-01',
  tagline: 'Complete warm onboarding experience',
  description: 'A 10-step onboarding flow that collects user intention via open text, generates 100 personalized affirmations, and uses swipe selection to build a personal collection.',
  inputType: 'Name + intention',
  outputType: 'Swipe selection',
  highlight: 'Full journey',
}
```

**Comparison table row:**
```typescript
<tr className="border-b border-gray-800/50">
  <td className="py-2 pr-4 font-mono text-purple-400">FO-01</td>
  <td className="py-2 pr-4">Medium</td>
  <td className="py-2 pr-4">High</td>
  <td className="py-2 pr-4 text-gray-500">None</td>
  <td className="py-2">Complete onboarding</td>
</tr>
```

---

## E2E Testing

FO-01 must include Playwright E2E tests following the existing pattern in `docs/current/e2e-testing.md`.

**Test file:** `e2e/fo-01.test.ts`

**Test flow:**
1. Navigate to `/fo-01`
2. Step 0: Click "Continue" on welcome screen
3. Step 1: Enter name, click "Continue"
4. Step 2: Click "Continue" on personalized welcome
5. Step 3: Enter intention text, click "Continue" (or click "I don't know" → select topics)
6. Step 4: Click "Start" on swipe introduction
7. Step 5: Swipe down on at least one affirmation (or use keyboard)
8. Step 6: Click "I'm good with the affirmations I chose"
9. Steps 7-9: Click through illustrative screens
10. Step 10: Verify completion screen shows approved affirmations

**Test helpers needed:**
```typescript
// Simulate vertical swipe gesture
async function swipeDown(page: Page, selector: string): Promise<void>

// Wait for AI generation (up to 60s for 100 affirmations)
async function waitForAffirmations(page: Page): Promise<boolean>
```

**Password bypass:** Use existing `e2e_test_mode` cookie pattern.

---

## Assumptions

1. **Navigation**: Add FO-01 to `nav.config.ts` following existing pattern
2. **Agent registration**: Register `fo01Agent` in `src/mastra/index.ts` singleton
3. **KV seeding**: Add FO-01 entries to `src/db/seed.ts` for system/prompt templates
4. **Framer Motion**: Already in use by CS-01's SwipePhase — can adapt for up/down
5. **Model capacity**: Selected model can generate 100 affirmations in single call
6. **No auth**: Prototype doesn't require user authentication
7. **E2E testing**: Playwright already configured, follow existing patterns

---

## Open Questions

1. **Swipe direction**: Up/down chosen for clarity (source note: "mod mig = keep, væk fra mig = discard"). Should we A/B test vs left/right?
2. **Minimum affirmations**: Should we enforce a minimum before allowing "I'm good" option?
3. **AI failure handling**: What fallback if 100 affirmations can't be generated? (Show error? Retry? Reduce count?)
4. **Generation time**: 100 affirmations may take longer than 10 per batch — is loading state acceptable?

---

## Out of Scope (Explicitly)

- Post-onboarding data feed integration
- Notification system integration
- Payment/trial system integration
- Background persistence to user settings
- User authentication/accounts
- Multiple affirmation lists per user
