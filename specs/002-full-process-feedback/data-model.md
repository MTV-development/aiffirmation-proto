# Data Model: Full Process 2 - Feedback-Aware Affirmation Generation

**Date**: 2025-12-12
**Branch**: `002-full-process-feedback`

## Overview

FP-02 uses the existing KV store schema with no database changes. This document defines the data structures used in the implementation.

## Entities

### 1. KV Store Entries (Existing Schema)

FP-02 configuration is stored in the existing `kv_store` table using the established key format.

**Table**: `kv_store` (no changes)

| Column | Type | Description |
|--------|------|-------------|
| key | string (PK) | Unique key in format `{namespace}.{version}.{keyName}.{implementation}` |
| value | jsonb | JSON object with at least `text` field |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

**FP-02 Keys**:

| Key | Value Structure |
|-----|-----------------|
| `versions.fp-02._info.default` | `{ name: string, text: string, author: string, createdAt: string }` |
| `versions.fp-02._model_name.default` | `{ text: string }` (e.g., `"openai/gpt-4o"`) |
| `versions.fp-02._temperature.default` | `{ text: string }` (e.g., `"0.95"`) |
| `versions.fp-02.system.default` | `{ text: string }` (system prompt) |
| `versions.fp-02.prompt.default` | `{ text: string }` (Liquid template) |

### 2. GenerateFullProcess2Options (TypeScript Interface)

Input to the FP-02 server action.

```typescript
interface GenerateFullProcess2Options {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;
  /** Optional adjusted preferences from check-in */
  adjustedPreferences?: AdjustedPreferences;
  /** Implementation to use (default: 'default') */
  implementation?: string;
  /** Affirmations the user approved (liked) - max 20 */
  approvedAffirmations?: string[];
  /** Affirmations the user skipped - max 20 */
  skippedAffirmations?: string[];
}
```

### 3. UserPreferences (Existing - No Changes)

```typescript
interface UserPreferences {
  /** Primary focus area (e.g., "Career", "Relationships") */
  focus: string;
  /** List of challenges the user faces */
  challenges: string[];
  /** Preferred tone (e.g., "Gentle & Compassionate") */
  tone: string;
}
```

### 4. AdjustedPreferences (Existing - No Changes)

```typescript
interface AdjustedPreferences {
  /** Updated challenges from check-in */
  challenges?: string[];
  /** Updated tone from check-in */
  tone?: string;
  /** Free-form feedback text */
  feedback?: string;
}
```

### 5. GenerateResult (Existing - No Changes)

```typescript
interface GenerateResult {
  /** Generated affirmations */
  affirmations: string[];
  /** Model used for generation */
  model: string;
}
```

## Template Variables

Variables available in the FP-02 Liquid prompt template:

| Variable | Type | Description |
|----------|------|-------------|
| `focus` | string | User's primary focus area |
| `challenges` | string | Comma-separated challenge list |
| `tone` | string | User's preferred tone |
| `feedback` | string | Optional free-form feedback from check-in |
| `previousAffirmations` | string[] | All previously shown (for non-repeat) |
| `approvedAffirmations` | string[] | Affirmations user liked (max 20) |
| `skippedAffirmations` | string[] | Affirmations user skipped (max 20) |

## State Transitions

No persistent state transitions - all data is session-scoped in React component state.

**Session Flow**:
```
Discovery → [Generate Batch 1] → Review → [Like/Skip] →
Check-in → [Generate Batch 2 with feedback] → Review → ...
```

**Feedback Accumulation**:
- `approvedAffirmations`: Grows as user likes affirmations (capped at 20 most recent)
- `skippedAffirmations`: Derived from `shownAffirmations - likedAffirmations` (capped at 20 most recent)

## Validation Rules

| Field | Rule |
|-------|------|
| `approvedAffirmations` | Max 20 items, each string non-empty |
| `skippedAffirmations` | Max 20 items, each string non-empty |
| `focus` | Required, non-empty string |
| `tone` | Required, non-empty string |
| `challenges` | Array, may be empty |

## No Schema Migrations Required

FP-02 uses the existing KV store infrastructure. No database migrations needed.
