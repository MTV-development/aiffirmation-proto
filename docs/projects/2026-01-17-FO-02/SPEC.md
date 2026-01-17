# Feature Specification: FO-02 Full Onboarding with Iterative Improvement

**Version ID**: `fo-02`
**Created**: 2026-01-17
**Status**: Draft
**Branch**: `2026-01-17-fo-02`
**Based On**: FO-01 (same UX flow, enhanced AI backend)

## Implementation Approach

**FO-02 is a completely separate implementation from FO-01.** Like all other agent versions in this codebase (AF-01, AP-01, CS-01, etc.), FO-02 has its own:

- `app/fo-02/` — Next.js route and components
- `src/mastra/agents/fo-02/` — Agent definition
- `versions.fo-02.*` — KV store namespace for prompts and config
- Navigation entry in `nav.config.ts`
- Overview card in `app/overview/page.tsx`
- E2E test file `e2e/fo-02.test.ts`

This is intentional — separate versions allow clean A/B testing and independent iteration.

### Component Strategy

**Copy all FO-01 components to FO-02.** This gives FO-02 full independence to modify components without affecting FO-01.

Components to copy from `app/fo-01/components/` to `app/fo-02/components/`:
- `fo-experience.tsx` — Main state manager (will be modified for batch generation)
- `step-welcome.tsx` — Steps 0-2
- `step-intent.tsx` — Steps 3, 3.2
- `step-swipe-intro.tsx` — Step 4
- `swipe-phase.tsx` — Swipe cards
- `step-checkpoint.tsx` — Checkpoint screens
- `step-illustrative.tsx` — Steps 7-9
- `step-completion.tsx` — Step 10

New component for FO-02:
- `generation-loading.tsx` — Loading throbber between batches

### Shared Utilities

**Reuse `parseAffirmationResponse` from FO-01.** Either:
- Import directly from `app/fo-01/actions.ts`, or
- Extract to a shared utility (e.g., `lib/affirmation-utils.ts`)

The parser handles JSON array or numbered list responses from the LLM.

---

## Overview

FO-02 implements the same 10-step onboarding UX as FO-01, but with **real iterative affirmation improvement**. Instead of generating 100 affirmations upfront, FO-02 generates affirmations in batches of 10, using the user's approved and skipped selections to improve each subsequent batch.

**Key difference from FO-01:**
- FO-01: Generates 100 affirmations in one call, shows 10 at a time (no actual improvement)
- FO-02: Generates 10 affirmations per batch, learns from user feedback between batches

**The promise we're now fulfilling:**
> "Your swipes help us tailor the next ones to you."

This statement in the FO-01 UI was aspirational — FO-02 makes it real.

---

## Problem Statement

FO-01's UI tells users that their swipes help tailor future affirmations, but this isn't actually happening. All 100 affirmations are generated before the user swipes anything. This creates a disconnect between the promised UX and the actual behavior.

FO-02 fixes this by implementing true iterative improvement:
1. Generate batch 1 (10 affirmations) based on user's intention
2. User swipes through batch 1, approving/skipping affirmations
3. Generate batch 2 using approved/skipped lists to guide style and content
4. Repeat for batch 3

---

## User Journey (Identical to FO-01)

The user-facing flow is **identical to FO-01**. All steps, copy, and UI remain the same. The only change is how affirmations are generated behind the scenes.

**Steps:**
- 0-2: Welcome & name collection
- 3, 3.2: Intent discovery (open text + inspiration fallback)
- 4: Swipe introduction
- 5: Batch 1 swipe (10 affirmations)
- 6: "Add more?" checkpoint
- 6.1: Batch 2 swipe (10 affirmations) — **now informed by batch 1 feedback**
- 6.2: "Add more?" checkpoint
- 6.3: Batch 3 swipe (10 affirmations) — **now informed by batch 1+2 feedback**
- 7-9: Illustrative screens (background, notifications, paywall)
- 10: Completion with approved affirmations

---

## Technical Changes from FO-01

### What Changes

| Aspect | FO-01 | FO-02 |
|--------|-------|-------|
| Generation timing | 100 upfront before swiping | 10 per batch, after each checkpoint |
| Agent calls | 1 call total | 3 calls (one per batch) |
| Feedback loop | None | Approved/skipped lists inform next batch |
| Learning | None | Style matching + pattern avoidance |

### What Stays the Same

- All UI components and flow
- Step copy and emojis
- Swipe mechanics (down=keep, up=discard)
- Client-side state management (no persistence)
- KV-based prompt configuration
- Affirmation quality guidelines from AP-01

---

## Feedback Loop Implementation

### Pattern: Deduplication + Style Learning (from CS-01/AP-01)

Each batch generation receives:
1. **`approvedAffirmations`**: Affirmations user swiped down (kept)
2. **`skippedAffirmations`**: Affirmations user swiped up (discarded)
3. **`allPreviousAffirmations`**: Combined list for deduplication

### Prompt Structure for Batch 2+

```liquid
{{ name }} shared the following about what they hope affirmations can help with:

"{{ intention }}"

{% if approvedAffirmations.size > 0 %}
## Style to Match (user approved these - match the style but NOT the content)

The user liked these affirmations. Analyze their characteristics:
- Length (short vs. detailed)
- Tone (gentle vs. assertive)
- Structure (simple "I am" vs. growth-oriented "I am learning")
- Themes that resonate

Generate MORE affirmations with similar characteristics.

{% for aff in approvedAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

{% if skippedAffirmations.size > 0 %}
## Patterns to Avoid (user skipped these)

The user passed on these affirmations. Identify patterns to avoid:
- Similar phrasing, length, or tone
- Themes that didn't resonate

{% for aff in skippedAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

{% if allPreviousAffirmations.size > 0 %}
## Do Not Repeat

CRITICAL: Do not generate any of these existing affirmations or close variations:

{% for aff in allPreviousAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

Generate exactly 10 NEW personalized affirmations that speak directly to their situation.
```

### Learning Instructions (in system prompt)

```
## Learning from Feedback

When feedback is provided, analyze it carefully:

### What to Learn from Approved Affirmations
- Notice the length (short vs. detailed)
- Notice the tone (gentle vs. assertive)
- Notice the structure (simple "I am" vs. growth-oriented "I am learning")
- Notice themes that resonate
- Generate MORE affirmations with these characteristics

### What to Learn from Skipped Affirmations
- Identify patterns in what was rejected
- Avoid similar phrasing, length, or tone
- If the user skips assertive statements, lean toward gentler ones
- If the user skips long affirmations, keep them shorter

### Balancing Feedback
- Prioritize approved patterns over avoiding skipped patterns
- When in doubt, match the style of approved affirmations
- Still maintain variety - don't just repeat approved structures
```

---

## Agent Architecture

### Pattern: Multi-Call with Feedback (like AP-01 shuffle)

FO-02 uses the same agent but calls it multiple times with accumulating context.

**Directory:** `src/mastra/agents/fo-02/` (or extend fo-01)

```typescript
// Agent definition remains the same
export const fo02Agent = new Agent({
  id: 'fo-02',
  name: 'Full Onboarding Affirmation Generator (Iterative)',
  instructions: SYSTEM_INSTRUCTIONS_WITH_LEARNING,
  model: getModel(),
});

// Factory for batch generation
export async function generateBatch(options: {
  name: string;
  intention: string;
  batchNumber: number;  // 1, 2, or 3
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
}): Promise<string[]> {
  const { name, intention, batchNumber, approvedAffirmations, skippedAffirmations, implementation = 'default' } = options;

  // Combine for deduplication
  const allPreviousAffirmations = [...approvedAffirmations, ...skippedAffirmations];

  // Render prompt with feedback context
  const { output: userPrompt } = await renderTemplate({
    key: batchNumber === 1 ? 'prompt_initial' : 'prompt_with_feedback',
    version: 'fo-02',
    implementation,
    variables: {
      name,
      intention,
      approvedAffirmations,
      skippedAffirmations,
      allPreviousAffirmations,
    },
  });

  // Generate batch
  const agent = await createFO02Agent(implementation);
  const result = await agent.generate(userPrompt, {
    modelSettings: { temperature: 0.9 },
  });

  return parseAffirmationResponse(result.text);
}
```

---

## Server Action Changes

**File:** `app/fo-02/actions.ts`

```typescript
'use server';

interface GenerateBatchOptions {
  name: string;
  intention: string;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
}

export async function generateAffirmationBatchFO02(
  options: GenerateBatchOptions
): Promise<{ affirmations: string[]; error?: string }> {
  const {
    name,
    intention,
    batchNumber,
    approvedAffirmations,
    skippedAffirmations,
    implementation = 'default',
  } = options;

  // Determine which prompt template to use
  const promptKey = batchNumber === 1 ? 'prompt_initial' : 'prompt_with_feedback';

  // Combine for deduplication
  const allPreviousAffirmations = [...approvedAffirmations, ...skippedAffirmations];

  // 1. Render user prompt from KV template
  const { output: userPrompt } = await renderTemplate({
    key: promptKey,
    version: 'fo-02',
    implementation,
    variables: {
      name,
      intention,
      approvedAffirmations,
      skippedAffirmations,
      allPreviousAffirmations,
    },
  });

  // 2. Get temperature from KV
  const temperature = await getKVText(`versions.fo-02._temperature.${implementation}`);

  // 3. Create agent with KV-configured system prompt
  const agent = await createFO02Agent(implementation);

  // 4. Generate 10 affirmations for this batch
  const result = await agent.generate(userPrompt, {
    modelSettings: { temperature: parseFloat(temperature) || 0.9 },
  });

  // 5. Parse response
  const affirmations = parseAffirmationResponse(result.text);

  return { affirmations };
}
```

---

## Client-Side State Changes

```typescript
interface OnboardingState {
  // Navigation
  currentStep: number;  // 0-10

  // User inputs
  name: string;
  intention: string;
  selectedTopics: string[];

  // Batch generation (different from FO-01)
  currentBatch: string[];           // Current 10 affirmations being shown
  currentBatchIndex: number;        // 0, 1, or 2 (which batch we're on)
  isGenerating: boolean;
  generationError: string | null;

  // Swipe state (same as FO-01)
  currentCardIndex: number;         // 0-9 within current batch
  approvedAffirmations: string[];   // All approved across all batches
  skippedAffirmations: string[];    // All skipped across all batches

  // Illustrative choices (same as FO-01)
  selectedBackground: string | null;
  notificationFrequency: number | null;
}
```

### Flow Change: Generation Timing

**FO-01 flow:**
1. User provides intention
2. Generate 100 affirmations
3. Show batch 1 (affirmations 0-9)
4. Show batch 2 (affirmations 10-19)
5. Show batch 3 (affirmations 20-29)

**FO-02 flow:**
1. User provides intention
2. **Generate batch 1 (10 affirmations)**
3. Show batch 1, collect swipes
4. User reaches checkpoint → **Generate batch 2 with feedback**
5. Show batch 2, collect swipes
6. User reaches checkpoint → **Generate batch 3 with feedback**
7. Show batch 3, collect swipes

---

## KV Store Entries (Full Seed Data)

**Namespace:** `versions.fo-02.*`

**Model:** `openai/gpt-4o-mini` (same as FO-01)

**IMPORTANT:** These entries must be added to `src/db/seed.ts` and the database must be re-seeded (`npm run db:seed`) before FO-02 can be tested. Without the KV prompts, generation will fail.

### Entry: `versions.fo-02._info.default`

```
FO-02: Full Onboarding with Iterative Improvement

Same 10-step onboarding flow as FO-01, but with real-time learning from user feedback. Generates affirmations in batches of 10, using approved/skipped selections to improve each subsequent batch.

Key difference from FO-01: Instead of generating 100 affirmations upfront, FO-02 generates 10 per batch and learns from user swipes between batches.
```

### Entry: `versions.fo-02._model_name.default`

```
openai/gpt-4o-mini
```

### Entry: `versions.fo-02._temperature.default`

```
0.9
```

### Entry: `versions.fo-02.system.default`

```
You are an expert affirmation coach who creates deeply meaningful, psychologically effective affirmations.

## Affirmation Guidelines

### Structure Rules
- First-person singular only: I, My
- Present tense only: no future or past
- Declarative statements: no questions or conditionals
- Positive framing: describe what IS, not what is avoided

Growth-form statements when direct identity claims sound unrealistic:
- "I am learning to…"
- "I am becoming…"
- "I am open to…"
- "I am practicing…"

### Sentence Opener Distribution
- "I am…" (35–40%)
- "I + verb…" (30–35%) — trust, choose, allow, honor, welcome
- Growth-form statements (10–15%)
- "My…" (10%)
- Other (≤5%)

### Length Guidelines
- Target: 5–9 words
- Acceptable range: 3–14 words
- Shorter (3–6 words) for identity statements
- Longer (8–12 words) for nuance or clarity

### Tone (Always Maintain)
- Calm, grounded, steady foundation
- Warmth and self-compassion
- Confidence without forcefulness
- Sincerity and authenticity — avoid slogans or hype

### Power Verbs
- Being: am, deserve, am worthy of
- Trust: trust, believe in, rely on
- Choice: choose, allow, let, give myself permission
- Emotional: welcome, honor, embrace, cherish, nourish
- Action: release, let go, steady, rise, hold
- Growth: learn, grow, soften, open, become

### Avoid (Critical)
- Exclamation marks or excited tone
- Superlatives: best, perfect, unstoppable
- Comparisons to others or past self
- Conditionals: if, when, once
- Negative framing ("not anxious")
- External dependency ("Others see my worth")
- Overreach ("Nothing can stop me")
- Multi-clause or complex sentences
- Toxic positivity

## Learning from Feedback

When feedback is provided, analyze it carefully:

### What to Learn from Approved Affirmations
- Notice the length (short vs. detailed)
- Notice the tone (gentle vs. assertive)
- Notice the structure (simple "I am" vs. growth-oriented "I am learning")
- Notice themes that resonate
- Generate MORE affirmations with these characteristics

### What to Learn from Skipped Affirmations
- Identify patterns in what was rejected
- Avoid similar phrasing, length, or tone
- If the user skips assertive statements, lean toward gentler ones
- If the user skips long affirmations, keep them shorter

### Balancing Feedback
- Prioritize approved patterns over avoiding skipped patterns
- When in doubt, match the style of approved affirmations
- Still maintain variety - don't just repeat approved structures

## Output Format

Return ONLY a JSON array of exactly 10 affirmation strings:
["Affirmation 1", "Affirmation 2", ..., "Affirmation 10"]

No explanations, no other text — just the JSON array.
```

### Entry: `versions.fo-02.prompt_initial.default`

```liquid
{{ name }} shared the following about what they hope affirmations can help with:

"{{ intention }}"

Generate exactly 10 personalized affirmations that speak directly to their situation.
```

### Entry: `versions.fo-02.prompt_with_feedback.default`

```liquid
{{ name }} shared the following about what they hope affirmations can help with:

"{{ intention }}"

{% if approvedAffirmations.size > 0 %}
## Style to Match (user approved these - match the style but NOT the content)

The user liked these affirmations. Analyze their characteristics:
- Length (short vs. detailed)
- Tone (gentle vs. assertive)
- Structure (simple "I am" vs. growth-oriented "I am learning")
- Themes that resonate

Generate MORE affirmations with similar characteristics.

{% for aff in approvedAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

{% if skippedAffirmations.size > 0 %}
## Patterns to Avoid (user skipped these)

The user passed on these affirmations. Identify patterns to avoid:
- Similar phrasing, length, or tone
- Themes that didn't resonate

{% for aff in skippedAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

{% if allPreviousAffirmations.size > 0 %}
## Do Not Repeat

CRITICAL: Do not generate any of these existing affirmations or close variations:

{% for aff in allPreviousAffirmations %}
- {{ aff }}
{% endfor %}
{% endif %}

Generate exactly 10 NEW personalized affirmations that speak directly to their situation.
```

---

## UI Component Changes

### Modified: `fo-experience.tsx`

The main experience component needs to:
1. Generate batch 1 when entering Step 5 (not after Step 4)
2. Generate batch 2 when user clicks "Continue" on Step 6 checkpoint
3. Generate batch 3 when user clicks "Yes, please" on Step 6.2 checkpoint
4. Show loading state between batches

```typescript
// Trigger generation when entering swipe phase
const handleStartBatch = async (batchNumber: number) => {
  setIsGenerating(true);

  const result = await generateAffirmationBatchFO02({
    name,
    intention,
    batchNumber,
    approvedAffirmations,
    skippedAffirmations,
  });

  if (result.error) {
    setGenerationError(result.error);
  } else {
    setCurrentBatch(result.affirmations);
    setCurrentCardIndex(0);
  }

  setIsGenerating(false);
};

// Call when:
// - Entering Step 5: handleStartBatch(1)
// - Clicking Continue on Step 6: handleStartBatch(2)
// - Clicking "Yes, please" on Step 6.2: handleStartBatch(3)
```

---

## Loading States (Throbbers)

**Critical UX consideration**: Unlike FO-01 which generates everything upfront, FO-02 makes LLM calls at three points during the flow. Each requires a proper loading state.

### Generation Timing

**Batch 1 generates after Step 3** (same as FO-01):
- User submits intention on Step 3 → generation starts immediately
- Step 4 (swipe intro) shows loading state until generation completes
- User clicks "Start" only after affirmations are ready

**Batches 2 and 3 generate after checkpoints**:
- User clicks "Continue" on Step 6 → batch 2 generation starts → loading throbber → swiping
- User clicks "Yes, please" on Step 6.2 → batch 3 generation starts → loading throbber → swiping

### Loading State 1: Before Batch 1 (Step 4 Loading)

Step 4 shows a loading state while batch 1 generates (triggered by Step 3 completion).

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 4.5: Generating First Batch                                │
│                                                                  │
│  Headline: "Creating your first affirmations, {name}..."         │
│  Subtext: "Based on what you shared with us"                     │
│                                                                  │
│  [Animated throbber/spinner]                                     │
│                                                                  │
│  (No button - auto-advances when generation completes)           │
└──────────────────────────────────────────────────────────────────┘
```

### Loading State 2: Before Batch 2 (After Step 6 checkpoint)

When user clicks "Continue" to see more affirmations after batch 1.

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 6.0.5: Generating Improved Batch                           │
│                                                                  │
│  Headline: "Creating more affirmations just for you, {name}..."  │
│  Subtext: "We're learning from what resonated with you"          │
│                                                                  │
│  [Animated throbber/spinner]                                     │
│                                                                  │
│  (No button - auto-advances when generation completes)           │
└──────────────────────────────────────────────────────────────────┘
```

### Loading State 3: Before Batch 3 (After Step 6.2 checkpoint)

When user clicks "Yes, please" to see the final batch.

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 6.2.5: Generating Final Batch                              │
│                                                                  │
│  Headline: "One more round of affirmations, {name}..."           │
│  Subtext: "These should feel even more personal"                 │
│                                                                  │
│  [Animated throbber/spinner]                                     │
│                                                                  │
│  (No button - auto-advances when generation completes)           │
└──────────────────────────────────────────────────────────────────┘
```

### Throbber Component

Create a reusable loading component: `app/fo-02/components/generation-loading.tsx`

```typescript
interface GenerationLoadingProps {
  name: string;
  batchNumber: 1 | 2 | 3;
}

const LOADING_COPY = {
  1: {
    headline: "Creating your first affirmations, {name}...",
    subtext: "Based on what you shared with us",
  },
  2: {
    headline: "Creating more affirmations just for you, {name}...",
    subtext: "We're learning from what resonated with you",
  },
  3: {
    headline: "One more round of affirmations, {name}...",
    subtext: "These should feel even more personal",
  },
};
```

### Flow with Loading States

```
Step 4 (Swipe Intro) → [Click Start]
    ↓
Loading State 1 (generating batch 1)
    ↓
Step 5 (Swipe Batch 1)
    ↓
Step 6 (Checkpoint) → [Click Continue]
    ↓
Loading State 2 (generating batch 2)
    ↓
Step 6.1 (Swipe Batch 2)
    ↓
Step 6.2 (Checkpoint) → [Click "Yes, please"]
    ↓
Loading State 3 (generating batch 3)
    ↓
Step 6.3 (Swipe Batch 3)
    ↓
Step 7+
```

### Error Handling During Generation

If generation fails, show an error state with retry option:

```
┌──────────────────────────────────────────────────────────────────┐
│  Something went wrong                                            │
│                                                                  │
│  Headline: "We couldn't create your affirmations"                │
│  Subtext: "Please try again"                                     │
│                                                                  │
│  [Try Again]                                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Requirements

### Functional Requirements (Changes from FO-01)

**Generation (replaces FR-011):**
- **FR-011a**: System MUST generate 10 affirmations per batch (not 100 upfront)
- **FR-011b**: Batch 1 MUST be generated based on user intention only
- **FR-011c**: Batch 2 MUST include approved/skipped lists from batch 1 in the prompt
- **FR-011d**: Batch 3 MUST include approved/skipped lists from batches 1+2 in the prompt
- **FR-011e**: System MUST deduplicate — never repeat an affirmation from previous batches

**Feedback Learning:**
- **FR-032**: System MUST pass approved affirmations to guide style matching
- **FR-033**: System MUST pass skipped affirmations to guide pattern avoidance
- **FR-034**: System prompt MUST include learning instructions for interpreting feedback

**Loading States:**
- **FR-035**: System MUST show loading throbber while generating each batch (1, 2, and 3)
- **FR-036**: Loading screen MUST display personalized headline with user's name
- **FR-037**: Loading screen for batch 2+ MUST include copy indicating learning from feedback
- **FR-038**: Loading screen MUST auto-advance to swipe phase when generation completes
- **FR-039**: System MUST show error state with retry option if generation fails

**Navigation & Info:**
- **FR-040**: FO-02 MUST be added to `nav.config.ts` with Demo and Info tabs
- **FR-041**: FO-02 MUST have an info page (`/fo-02/info`) following the same style as other versions
- **FR-042**: Info page MUST explain the key difference from FO-01 (iterative improvement)
- **FR-043**: FO-02 MUST be added to the overview page (`/overview`) with version card and comparison table row

### Non-Functional Requirements (Additions)

- **NFR-006**: Each batch generation MUST complete within 15 seconds
- **NFR-007**: Feedback loop SHOULD noticeably improve affirmation relevance by batch 3

---

## Success Criteria

- **SC-001**: Complete onboarding flow navigable from Step 0 to Step 10 (same as FO-01)
- **SC-002**: Each batch (10 affirmations) generates within 15 seconds
- **SC-003**: Batch 2 and 3 prompts include approved/skipped affirmations from previous batches
- **SC-004**: No duplicate affirmations appear across batches
- **SC-005**: Loading throbber displays before each batch generation with appropriate copy
- **SC-006**: E2E test passes (run headed/non-headless) — full flow with all 3 batches completes without errors
- **SC-007**: FO-02 appears in navigation with Demo and Info tabs
- **SC-008**: Info tab displays version description matching other version info pages in style
- **SC-009**: FO-02 card appears on overview page with comparison table entry
- **SC-010**: Manual QA confirms batch 2/3 affirmations feel more aligned with approved patterns

---

## Testing Strategy

### Unit Tests

1. **Prompt template rendering**: Verify approved/skipped lists are correctly included
2. **Deduplication**: Verify allPreviousAffirmations combines both lists
3. **Batch number logic**: Verify correct prompt template is selected per batch

### E2E Tests

**File:** `e2e/fo-02.test.ts`

**Prerequisites before running E2E tests:**
1. Add FO-02 KV entries to `src/db/seed.ts`
2. Run `npm run db:seed` to populate the database with prompts
3. Start dev server: `npm run dev`

**IMPORTANT: Run tests in headed (non-headless) mode** so you can visually follow along:

```bash
# Run with visible browser window
npx playwright test e2e/fo-02.test.ts --headed

# Or with the UI mode for debugging
npx playwright test e2e/fo-02.test.ts --ui
```

**Test scenarios:**
1. Complete flow through all 3 batches
2. Verify loading throbber appears before each batch
3. Verify each batch generation completes successfully
4. Verify no duplicate affirmations appear across batches
5. Verify completion screen shows approved affirmations

### Manual QA

1. Complete onboarding with clear preferences (e.g., approve only short, gentle affirmations)
2. Observe whether batch 2 and 3 affirmations match the approved style
3. Document qualitative improvement in personalization

---

## Navigation & Info Tab

FO-02 requires the standard navigation structure like all other agent versions.

### Add to `nav.config.ts`

```typescript
{
  label: 'FO-02',
  path: '/fo-02',
  children: [
    { label: 'Demo', path: '/fo-02' },
    { label: 'Info', path: '/fo-02/info' },
  ],
}
```

### Required Pages

- `app/fo-02/page.tsx` — Main demo (onboarding flow)
- `app/fo-02/info/page.tsx` — Info tab with version description
- `app/fo-02/layout.tsx` — Layout with TopSubmenu

### Info Tab Content

**File:** `app/fo-02/info/page.tsx`

Follow the same style and structure as other version info pages (AF-01, AP-01, CS-01, FO-01).

**Content:**
- **Version name:** "FO-02: Full Onboarding with Iterative Improvement"
- **Description:** Complete warm onboarding flow with real-time learning from user feedback
- **Key difference from FO-01:** Generates affirmations in batches, learning from approved/skipped selections
- **Key features:**
  - Same 10-step onboarding UX as FO-01
  - Batch-by-batch generation (10 affirmations per batch)
  - Feedback loop: approved affirmations guide style, skipped affirmations indicate patterns to avoid
  - Loading states between batches with personalized copy
- **Based on:** FO-01 UX + AP-01/CS-01 feedback loop patterns

---

## Overview Page Update

**Add FO-02 to `app/overview/page.tsx`** following the existing card pattern.

### Version Card

```typescript
{
  id: 'FO-02',
  name: 'Full Onboarding (Iterative)',
  href: '/fo-02',
  tagline: 'Onboarding that learns from your choices',
  description: 'Same 10-step onboarding as FO-01, but with real iterative improvement. Each batch of affirmations is generated based on what you approved and skipped in previous batches.',
  inputType: 'Name + intention + swipe feedback',
  outputType: 'Progressively personalized affirmations',
  highlight: 'Learns as you swipe',
}
```

### Comparison Table Row

```typescript
<tr className="border-b border-gray-800/50">
  <td className="py-2 pr-4 font-mono text-purple-400">FO-02</td>
  <td className="py-2 pr-4">Medium</td>
  <td className="py-2 pr-4">High (iterative)</td>
  <td className="py-2 pr-4 text-gray-500">None</td>
  <td className="py-2">Onboarding with learning</td>
</tr>
```

---

## Open Questions

1. **Batch size**: Is 10 the right number? Should we test 5 or 15?
2. **Feedback weighting**: Should recent feedback (batch 2→3) be weighted more than older (batch 1→3)?

### Resolved Questions

- **Minimum approved**: No minimum required. If user skips all 10, the "Style to Match" section is omitted from the prompt. Handled gracefully.
- **Generation failure**: Retry only. Show "Try Again" button. No option to skip and proceed with existing affirmations.

---

## Out of Scope

- Persistent storage of user preferences
- Cross-session learning
- A/B testing infrastructure
- Analytics on improvement quality
- Post-onboarding data feed integration
