# API Contracts: Full Process Affirmation Generator

**Branch**: `001-full-process-generator` | **Date**: 2025-12-11

## Overview

The Full Process feature primarily uses client-side generation via the existing `lib/agents` pattern. However, an optional server-side API endpoint is defined for flexibility and future use cases.

---

## Endpoints

### POST /api/full-process/generate

Generate a batch of affirmations based on user preferences.

#### Request

```typescript
interface GenerateAffirmationsRequest {
  /** User's primary focus area */
  focus: string;

  /** When user wants affirmations */
  timing: string[];

  /** Challenges to address */
  challenges: string[];

  /** Preferred tone */
  tone: string;

  /** Optional: specific implementation to use */
  implementation?: string;

  /** Optional: feedback from adjustment panel */
  feedback?: string;
}
```

**Example Request**:
```json
{
  "focus": "Career Growth",
  "timing": ["Morning", "Evening"],
  "challenges": ["Anxiety", "Imposter Syndrome"],
  "tone": "Practical & Grounded",
  "implementation": "default"
}
```

#### Response

**Success (200)**:
```typescript
interface GenerateAffirmationsResponse {
  /** Array of generated affirmations (5-8 items) */
  affirmations: string[];

  /** Model used for generation */
  model: string;
}
```

**Example Response**:
```json
{
  "affirmations": [
    "I approach each morning with confidence and clarity in my career path.",
    "My anxiety transforms into focused energy that propels my growth.",
    "I belong in every room I enter; my contributions have value.",
    "Each evening, I acknowledge my progress and release self-doubt.",
    "I am grounded in my abilities and trust my professional journey.",
    "My unique perspective is an asset, not a liability.",
    "I embrace challenges as stepping stones to career success.",
    "I am worthy of the opportunities that come my way."
  ],
  "model": "openai/gpt-4o-mini"
}
```

**Error (400)**:
```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}
```

**Example Error**:
```json
{
  "error": "Validation failed",
  "details": "focus is required"
}
```

**Error (500)**:
```json
{
  "error": "Generation failed",
  "details": "Unable to connect to AI provider"
}
```

---

## Client-Side Function Contract

### generateFullProcessAffirmations

This is the primary interface used by the UI components.

```typescript
interface GenerateOptions {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;

  /** Optional: merged adjusted preferences */
  adjustedPreferences?: AdjustedPreferences;

  /** Implementation to use (default: 'default') */
  implementation?: string;
}

interface GenerateResult {
  /** Generated affirmations */
  affirmations: string[];

  /** Model used */
  model: string;
}

async function generateFullProcessAffirmations(
  options: GenerateOptions
): Promise<GenerateResult>
```

**Behavior**:
1. Merges `preferences` with `adjustedPreferences` if provided
2. Fetches templates from KV store via Supabase client
3. Renders templates with LiquidJS
4. Calls OpenRouter API
5. Returns parsed affirmations array

**Error Handling**:
- On API failure: Falls back to `generateFallbackAffirmations()`
- On template fetch failure: Uses hardcoded default template
- Throws only if fallback also fails (rare)

---

## Internal Contracts

### Template Rendering

```typescript
interface RenderTemplateOptions {
  key: 'system' | 'prompt';
  version: 'fp-01';
  implementation: string;
  variables: TemplateVariables;
}

interface TemplateVariables {
  focus: string;
  timing: string;        // Comma-joined
  challenges: string;    // Comma-joined or "general life challenges"
  tone: string;
  feedback?: string;
}

interface RenderResult {
  output: string;
  variables: Record<string, unknown>;
}
```

### Fallback Generation

```typescript
function generateFallbackAffirmations(
  preferences: UserPreferences
): string[]
```

Returns 8 contextual placeholder affirmations using the user's focus and challenges.

---

## Validation Rules

### Request Validation

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| focus | Yes | string | Non-empty, max 500 chars |
| timing | Yes | string[] | At least 1 element |
| challenges | No | string[] | Max 10 elements |
| tone | Yes | string | Non-empty, max 200 chars |
| implementation | No | string | If provided, must exist in KV store |
| feedback | No | string | Max 1000 chars |

### Response Guarantees

| Guarantee | Value |
|-----------|-------|
| Minimum affirmations | 5 |
| Maximum affirmations | 8 |
| Response time (p95) | < 5 seconds |
| Fallback available | Always |

---

## Rate Limiting

No explicit rate limiting is implemented for this feature. The OpenRouter API has its own rate limits based on the configured API key.

---

## Authentication

No authentication required. This is a stateless, client-side feature with no user accounts.
