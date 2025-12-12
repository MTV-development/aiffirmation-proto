# Server Action Contract: generateFullProcess2Affirmations

**Location**: `app/full-process/actions.ts`

## Function Signature

```typescript
export async function generateFullProcess2Affirmations(
  options: GenerateFullProcess2Options
): Promise<GenerateResult>
```

## Input: GenerateFullProcess2Options

```typescript
interface GenerateFullProcess2Options {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;

  /** Optional adjusted preferences from mid-journey check-in */
  adjustedPreferences?: AdjustedPreferences;

  /** KV store implementation to use (default: 'default') */
  implementation?: string;

  /**
   * Affirmations the user has approved (liked) this session.
   * Limited to 20 most recent to prevent prompt overflow.
   */
  approvedAffirmations?: string[];

  /**
   * Affirmations the user has skipped this session.
   * Limited to 20 most recent to prevent prompt overflow.
   * Derived from: shownAffirmations.filter(a => !likedAffirmations.includes(a))
   */
  skippedAffirmations?: string[];
}

interface UserPreferences {
  focus: string;
  challenges: string[];
  tone: string;
}

interface AdjustedPreferences {
  challenges?: string[];
  tone?: string;
  feedback?: string;
}
```

## Output: GenerateResult

```typescript
interface GenerateResult {
  /** Array of 8 generated affirmations */
  affirmations: string[];

  /** Model identifier used (e.g., "openai/gpt-4o") */
  model: string;
}
```

## Behavior

1. **Merge Preferences**: Combine base `preferences` with any `adjustedPreferences` overrides
2. **Limit Feedback Lists**: Cap `approvedAffirmations` and `skippedAffirmations` to 20 items each (most recent)
3. **Render Prompt**: Use `renderTemplate()` with KV key `versions.fp-02.prompt.{implementation}`
4. **Create Agent**: Instantiate FP-02 agent with system prompt from KV store
5. **Generate**: Call agent with rendered prompt and configured temperature
6. **Parse Response**: Extract JSON array of affirmations from agent response
7. **Return**: Return affirmations array and model identifier

## Error Handling

| Scenario | Behavior |
|----------|----------|
| KV entry not found | Fall back to hardcoded default prompt |
| Agent generation fails | Return fallback affirmations based on user preferences |
| Invalid JSON response | Parse as numbered list, fall back to raw text |

## Example Usage

```typescript
const result = await generateFullProcess2Affirmations({
  preferences: {
    focus: 'Career',
    challenges: ['imposter syndrome', 'work-life balance'],
    tone: 'Gentle & Compassionate',
  },
  approvedAffirmations: [
    'I am enough.',
    'I trust my abilities.',
  ],
  skippedAffirmations: [
    'I am unstoppable in my career.',
    'Nothing can hold me back.',
  ],
});

// Result:
// {
//   affirmations: [
//     "I belong in my field.",
//     "My contributions matter.",
//     ...
//   ],
//   model: "openai/gpt-4o"
// }
```

## Differences from FP-01

| Aspect | FP-01 | FP-02 |
|--------|-------|-------|
| KV namespace | `versions.fp-01.*` | `versions.fp-02.*` |
| Approved feedback | Not used | Passed to prompt |
| Skipped feedback | Not used | Passed to prompt |
| System prompt | Standard generation | Includes feedback analysis instructions |
