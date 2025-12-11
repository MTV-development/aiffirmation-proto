# Data Model: Full Process Affirmation Generator

**Branch**: `001-full-process-generator` | **Date**: 2025-12-11

## Overview

This feature uses **client-side state only** - no database schema changes are required. All entities below are TypeScript interfaces for React state management. The only persistent storage is the KV store for agent configuration (which uses the existing `kv_store` table).

---

## Core Entities

### UserPreferences

Captures the user's selections from the 4-step discovery wizard.

```typescript
interface UserPreferences {
  /** User's primary focus area (preset label or custom text) */
  focus: string;

  /** When user wants affirmations (array of preset labels and/or custom text) */
  timing: string[];

  /** Challenges user wants to address (array of preset labels and/or custom text) */
  challenges: string[];

  /** Preferred tone for affirmations (preset label or custom text) */
  tone: string;
}
```

**Validation Rules**:
- `focus` must be non-empty string
- `timing` must have at least one element
- `challenges` can be empty (optional)
- `tone` must be non-empty string

**Source**: Discovery wizard steps 1-4

---

### AdjustedPreferences

Captures preference modifications made during mid-journey check-in.

```typescript
interface AdjustedPreferences {
  /** Updated challenges (replaces original if provided) */
  challenges?: string[];

  /** Updated tone (replaces original if provided) */
  tone?: string;

  /** Freeform feedback text (stored but not currently used in generation) */
  feedback?: string;
}
```

**Validation Rules**:
- All fields optional
- At least one field should be provided when submitting adjustments

**Source**: Adjustment panel during check-in

---

### DiscoveryStep

Represents the current state of a single discovery wizard step.

```typescript
interface DiscoveryStep<T> {
  /** Currently selected preset values */
  presets: T;

  /** Custom text input value */
  customText: string;
}

// Step-specific types
type FocusStep = DiscoveryStep<string | null>;      // Single-select
type TimingStep = DiscoveryStep<string[]>;          // Multi-select
type ChallengesStep = DiscoveryStep<string[]>;      // Multi-select
type ToneStep = DiscoveryStep<string | null>;       // Single-select
```

---

### WizardState

Complete state for the Full Process feature.

```typescript
type OnboardingPhase = 'discovery' | 'review' | 'summary';
type DiscoveryStepNumber = 1 | 2 | 3 | 4;

interface WizardState {
  /** Current phase of the experience */
  phase: OnboardingPhase;

  /** Current step within discovery (1-4) */
  discoveryStep: DiscoveryStepNumber;

  /** User's finalized preferences */
  preferences: UserPreferences | null;

  /** Adjusted preferences from check-in (merged with original for generation) */
  adjustedPreferences: AdjustedPreferences | null;

  /** Current batch of affirmations from generation */
  affirmations: string[];

  /** Collection of affirmations user has liked */
  likedAffirmations: string[];

  /** Index of current affirmation being displayed */
  currentIndex: number;

  /** Whether to show the mid-journey check-in screen */
  showCheckIn: boolean;

  /** Whether the adjustment panel is open */
  isAdjusting: boolean;

  /** Loading state during affirmation generation */
  loading: boolean;

  /** Error message if generation fails */
  error: string | null;
}
```

**Initial State**:
```typescript
const initialState: WizardState = {
  phase: 'discovery',
  discoveryStep: 1,
  preferences: null,
  adjustedPreferences: null,
  affirmations: [],
  likedAffirmations: [],
  currentIndex: 0,
  showCheckIn: false,
  isAdjusting: false,
  loading: false,
  error: null,
};
```

---

## State Transitions

### Phase Transitions

```
discovery → review
  Trigger: User clicks "Find Affirmations" on step 4
  Action: Store preferences, call generateAffirmations()

review → review (loop)
  Trigger: User continues after check-in OR batch exhausted
  Action: Generate new batch, reset currentIndex

review → summary
  Trigger: User clicks "Finish Early" OR "I'm happy with my collection"
  Action: Finalize likedAffirmations

summary → discovery
  Trigger: User clicks "Start Over"
  Action: Reset to initialState (page reload)
```

### Discovery Step Transitions

```
Step 1 → Step 2: focus OR customFocus has value
Step 2 → Step 3: timing.length > 0 OR customTiming has value
Step 3 → Step 4: Always allowed (challenges optional)
Step 4 → Review: tone OR customTone has value
```

### Check-In Triggers

```typescript
function shouldShowCheckIn(likedCount: number): boolean {
  return likedCount === 5
      || likedCount === 10
      || (likedCount > 10 && (likedCount - 10) % 5 === 0);
}
```

---

## Preset Constants

### Focus Areas (Step 1)

| ID | Label | Single-Select |
|----|-------|---------------|
| career | Career Growth | Yes |
| relationships | Relationships | Yes |
| health | Health & Wellness | Yes |
| confidence | Confidence | Yes |
| creativity | Creativity | Yes |
| self-worth | Self-Worth | Yes |

### Timing Options (Step 2)

| ID | Label | Multi-Select |
|----|-------|--------------|
| morning | Morning | Yes |
| evening | Evening | Yes |
| all-day | All-Day | Yes |

### Challenge Badges (Step 3)

| ID | Label | Multi-Select |
|----|-------|--------------|
| anxiety | Anxiety | Yes |
| self-doubt | Self-Doubt | Yes |
| imposter | Imposter Syndrome | Yes |
| procrastination | Procrastination | Yes |
| perfectionism | Perfectionism | Yes |
| burnout | Burnout | Yes |

### Tone Cards (Step 4)

| ID | Label | Single-Select |
|----|-------|---------------|
| gentle | Gentle & Compassionate | Yes |
| powerful | Powerful & Commanding | Yes |
| practical | Practical & Grounded | Yes |
| spiritual | Spiritual & Reflective | Yes |

---

## KV Store Seed Entries (Required)

These entries **MUST be added to `src/db/seed.ts`** for the feature to work. The seed file follows the established pattern used by AF-01 and GT-01.

### Required Seed Data

The following entries must be added to the `demoData` array in `src/db/seed.ts`:

#### 1. Implementation Info (`_info`)

```typescript
{
  key: 'versions.fp-01._info.default',
  value: {
    name: 'Default',
    text: `Full Process Affirmation Generator - A guided experience for creating personalized affirmations.
Takes user through discovery (focus, timing, challenges, tone) and generates batches of 5-8 affirmations.`,
    author: 'System',
    createdAt: '2025-12-11',
  },
},
```

#### 2. Model Name (`_model_name`)

```typescript
{
  key: 'versions.fp-01._model_name.default',
  value: {
    text: 'openai/gpt-4o-mini',
  },
},
```

#### 3. System Prompt (`system`)

```typescript
{
  key: 'versions.fp-01.system.default',
  value: {
    text: `You are a compassionate affirmation coach who creates personalized, meaningful affirmations based on the user's specific context.

## User Context
- **Primary Focus**: {{ focus }}
- **Timing**: {{ timing }}
- **Challenges**: {{ challenges }}
- **Preferred Tone**: {{ tone }}
{% if feedback %}- **Additional Feedback**: {{ feedback }}{% endif %}

## Your Task
Generate exactly 8 unique affirmations tailored to this user's needs.

## Affirmation Guidelines

1. **STRUCTURE**
- First-person singular only: I, My
- Present tense only; no future or past
- Positive framing: describe what is, not what is avoided
- Growth-form statements allowed: "I am learning to...", "I am becoming..."

2. **TONE ADAPTATION**
Adjust your language based on the user's preferred tone:
- **Gentle & Compassionate**: Soft, nurturing, self-kind language
- **Powerful & Commanding**: Strong, assertive, action-oriented language
- **Practical & Grounded**: Realistic, down-to-earth, pragmatic language
- **Spiritual & Reflective**: Contemplative, mindful, deeper meaning language

3. **CONTENT PRINCIPLES**
- Address the user's primary focus area directly
- Acknowledge and counter their specific challenges
- Make affirmations believable and attainable
- Vary sentence structure and opening words
- Consider the timing context (morning = energizing, evening = calming, all-day = balanced)

4. **LENGTH**
- Target: 5-12 words per affirmation
- Keep them easy to remember and repeat

5. **AVOID**
- Negative framing ("I am not anxious")
- Comparisons to others
- Unrealistic superlatives ("I am perfect")
- Generic statements that ignore the user's context

## Output Format
Return exactly 8 affirmations as a JSON array of strings. Example:
["Affirmation 1", "Affirmation 2", ...]

Do not include numbering, explanations, or any other text - just the JSON array.`,
  },
},
```

#### 4. User Prompt (`prompt`)

```typescript
{
  key: 'versions.fp-01.prompt.default',
  value: {
    text: `Generate 8 personalized affirmations for me based on my preferences.

My focus: {{ focus }}
When I need them: {{ timing }}
Challenges I face: {% if challenges and challenges != "" %}{{ challenges }}{% else %}general life challenges{% endif %}
Tone I prefer: {{ tone }}
{% if feedback %}
Additional context: {{ feedback }}
{% endif %}
Return only a JSON array of 8 affirmation strings.`,
  },
},
```

### Template Variables

The following variables are available in Liquid templates:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{ focus }}` | string | User's primary focus area | "Career Growth" |
| `{{ timing }}` | string | Comma-joined timing preferences | "Morning, Evening" |
| `{{ challenges }}` | string | Comma-joined challenges (may be empty) | "Anxiety, Imposter Syndrome" |
| `{{ tone }}` | string | Desired tone | "Practical & Grounded" |
| `{{ feedback }}` | string | Optional adjustment feedback | "More action-oriented" |

### Seed File Location

**File**: `src/db/seed.ts`

Add the entries above to the `demoData` array, following the pattern of existing AF-01 and GT-01 entries. After adding, run:

```bash
npm run db:seed
```

This will insert/update the KV store entries in the database.

---

## Relationships Diagram

```
                    ┌─────────────────┐
                    │   WizardState   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│UserPreferences│    │AdjustedPrefs  │    │ Affirmations  │
└───────────────┘    └───────────────┘    │   (string[])  │
        │                    │            └───────────────┘
        │                    │                    │
        └──────────┬─────────┘                    │
                   │                              │
                   ▼                              ▼
           ┌───────────────┐              ┌───────────────┐
           │ Generation    │              │    Liked      │
           │ API Request   │              │ Affirmations  │
           └───────────────┘              │  (string[])   │
                                          └───────────────┘
```

---

## No Database Changes Required

This feature operates entirely in client-side React state. The only database interaction is reading from the existing KV store for agent configuration. No new tables or schema migrations are needed.
