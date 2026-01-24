# FO-05 Completion Summary

**Status:** Ready for Implementation
**Created:** 2026-01-24
**Version:** FO-05

## Overview

Add a personalized AI-generated summary to the completion screen that appears above the list of affirmations. This summary reflects back the user's situation and wish for change based on their conversation, and explains how their affirmations are designed to support them.

## Problem Statement

Currently, the completion screen shows:
- A generic heading: "You are all set, {name} — this is your list!"
- A generic instruction to read the affirmations
- The list of approved affirmations

**What's missing:** A personalized summary that connects the user's journey (their situation, struggles, and hopes shared during discovery) to the affirmations they now have. This summary:
- Makes the user feel truly seen and understood
- Provides context for why these specific affirmations were created
- Creates an emotional bridge between their story and their affirmations

## Solution

### 1. New Summary Agent

Create a new agent (`summary-agent.ts`) that:
- Takes the same `GatheringContext` (name, familiarity, topics, exchanges)
- Generates a personalized 2-3 sentence summary
- Output format: plain text (not JSON)

**Summary structure:**
1. **Situation acknowledgment** (1 sentence) - What they shared about their current state
2. **Wish for change** (1 sentence) - What they're hoping to feel or become
3. **Purpose statement** (1 sentence) - How the affirmations connect to their needs

**Example output:**
> You've been carrying a lot of pressure at work while trying to stay present for the people you love. You're looking for more calm and self-compassion in the moments that feel overwhelming. These affirmations are crafted to remind you that you're already doing enough — and that rest is not something you need to earn.

### 2. Server Action

Add a new server action `generateCompletionSummary(context: GatheringContext): Promise<string>` that:
- Calls the summary agent
- Returns the plain text summary
- Returns a fallback message on error (graceful degradation)

### 3. UI Changes

Update `step-completion.tsx` to:
- Accept an additional `summary: string` prop
- Display the summary in a styled box above the affirmation list
- Handle the loading state (show skeleton while generating)
- Handle empty/error state (hide summary section if empty)

Update `fo-experience.tsx` to:
- Generate the summary when transitioning to completion step
- Pass the summary to StepCompletion

## UI Design

```
┌─────────────────────────────────────────────┐
│                                             │
│  You are all set, Sarah — this is your list!│
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ 💜 Your Journey                      │    │
│  │                                      │    │
│  │ You've been carrying a lot of        │    │
│  │ pressure at work while trying to     │    │
│  │ stay present for the people you      │    │
│  │ love. You're looking for more calm   │    │
│  │ and self-compassion in the moments   │    │
│  │ that feel overwhelming. These        │    │
│  │ affirmations are crafted to remind   │    │
│  │ you that you're already doing        │    │
│  │ enough — and that rest is not        │    │
│  │ something you need to earn.          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ✦ I am worthy of rest and care      │    │
│  │ ✦ I give myself permission to pause │    │
│  │ ✦ I am doing enough                 │    │
│  │ ...                                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
│              5 affirmations saved           │
│                                             │
└─────────────────────────────────────────────┘
```

## Technical Details

### Summary Agent Prompt Guidelines

The agent should:
- Use warm, supportive tone matching the app's voice
- Write in second person ("You've been..." not "The user has...")
- Keep it concise (2-3 sentences, ~50-80 words max)
- Not repeat exact phrases from the user's answers
- Synthesize themes across all exchanges
- End with how the affirmations connect to their needs

### Files to Create

| File | Purpose |
|------|---------|
| `src/mastra/agents/fo-05/summary-agent.ts` | New summary generation agent |

### Files to Modify

| File | Changes |
|------|---------|
| `src/mastra/agents/fo-05/index.ts` | Export the new agent |
| `app/fo-05/actions.ts` | Add `generateCompletionSummary` action |
| `app/fo-05/components/step-completion.tsx` | Add summary display section |
| `app/fo-05/components/fo-experience.tsx` | Generate and pass summary |

### Agent Output Format

Plain text (no JSON wrapping needed):
```
You've been navigating [situation]. You're seeking [desire]. These affirmations are designed to [purpose].
```

### Error Handling

If summary generation fails:
- Log the error
- Return empty string
- Completion screen hides the summary section gracefully
- User experience continues uninterrupted

## Testing Strategy

### Unit Tests

Not required for this prototype.

### E2E Tests

Update `e2e/fo-05.test.ts` to:
1. Verify the summary section appears on completion screen
2. Verify the summary contains text (not empty)
3. Continue to verify affirmation list is displayed

### Manual Testing

1. Complete full FO-05 flow
2. Verify summary appears above affirmations
3. Verify summary feels personal and connected to the conversation
4. Verify fallback works (can simulate by breaking the agent temporarily)

## Implementation Order

1. Create summary agent
2. Add server action
3. Update step-completion UI
4. Wire up in fo-experience
5. Update E2E test
6. Manual verification

## Out of Scope

- Editing or regenerating the summary
- Saving the summary to database
- Summary on other onboarding versions (FO-01 through FO-04)
- Accessibility enhancements (prototype only)

## Open Questions

None - ready for implementation.
