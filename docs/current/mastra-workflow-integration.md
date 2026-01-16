# Mastra Workflow Integration Guide

This document explains the architecture and patterns used to integrate Mastra workflows with a Next.js application, using the Chat-Survey feature as a reference implementation.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [The Suspend/Resume Pattern](#the-suspendresume-pattern)
4. [State Management Challenge](#state-management-challenge)
5. [Implementation Details](#implementation-details)
6. [Key Files](#key-files)
7. [Common Pitfalls](#common-pitfalls)
8. [Blueprint for New Workflows](#blueprint-for-new-workflows)

---

## Overview

Mastra workflows allow you to define multi-step, stateful processes that can pause (suspend) waiting for external input and resume when that input is provided. This is ideal for:

- Multi-turn conversations with AI agents
- User interactions requiring decisions (swipe left/right, approve/reject)
- Long-running processes that need human input at various stages

The Chat-Survey workflow demonstrates a two-phase process:
1. **Discovery Chat**: AI agent asks questions to build a user profile
2. **Swipe Phase**: User swipes through generated affirmations, approving or skipping

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CSExperience Component                                      │   │
│  │  - Manages UI state (messages, currentQuestion, etc.)        │   │
│  │  - Stores workflow state for round-trip (workflowHistory,    │   │
│  │    swipeState)                                               │   │
│  │  - Calls server actions                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Server Actions
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVER (Next.js)                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  actions.ts (Server Actions)                                 │   │
│  │  - startChatSurvey(): Start new workflow                     │   │
│  │  - resumeChatSurvey(): Resume with user message + history    │   │
│  │  - swipeAffirmation(): Resume with swipe action + state      │   │
│  │  - formatWorkflowResult(): Extract suspendPayload data       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Mastra API
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MASTRA WORKFLOW                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  chatSurveyWorkflow                                          │   │
│  │  - discovery-chat step (suspends for each user message)      │   │
│  │  - profile-builder step (processes chat into profile)        │   │
│  │  - generate-stream step (suspends for each swipe)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PostgresStore                                               │   │
│  │  - Persists workflow runs (mastra_workflow_runs table)       │   │
│  │  - Uses DIRECT_URL to avoid PgBouncer DDL issues             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Suspend/Resume Pattern

### How Mastra Suspend Works

When a workflow step calls `suspend(payload)`:
1. The workflow execution pauses
2. The payload is stored as `suspendPayload` in the step's result
3. The workflow status becomes `'suspended'`
4. Control returns to the caller with information about what's suspended

When you call `run.resume({ step, resumeData })`:
1. The specified step receives `resumeData` in its execute function
2. The step processes the data and either:
   - Calls `suspend()` again (stays suspended)
   - Returns a value (completes and moves to next step)

### Critical Rule: Always Suspend Until Done

A step that needs multiple interactions **must always call `suspend()`** until it's truly complete. If you `return` early, the step completes and can't be resumed.

```typescript
// WRONG - Step completes after first user message, can't be resumed
execute: async ({ inputData, resumeData, suspend }) => {
  if (resumeData?.userMessage) {
    // Process message
    return { result: 'done' }; // Step is now COMPLETE
  }
  return suspend({ question: 'What is your name?' });
}

// CORRECT - Step stays suspended until explicitly complete
execute: async ({ inputData, resumeData, suspend }) => {
  // Process any incoming user message
  if (resumeData?.userMessage) {
    history.push({ role: 'user', content: resumeData.userMessage });
  }

  // Generate response
  const response = await agent.generate(...);

  // Check if conversation is complete
  if (response.isComplete) {
    return { conversationHistory: history, isComplete: true };
  }

  // Not complete - suspend and wait for next message
  return suspend({
    question: response.message,
    conversationHistory: history, // Include state for next resume!
  });
}
```

---

## State Management Challenge

### The Problem

Mastra's `run.getState()` doesn't reliably return workflow state between resume calls. When you call it, you may get an empty object `{}` instead of the actual state.

This means you **cannot rely on Mastra to persist and retrieve state** between suspend/resume cycles.

### The Solution: Client-Side State Round-Trip

We pass state from server → client → server on each interaction:

```
1. Workflow suspends with payload containing state
2. Server extracts state from suspendPayload, sends to client
3. Client stores state in React state
4. User interacts (sends message, swipes)
5. Client sends action + stored state back to server
6. Server passes state to workflow.resume()
7. Workflow step receives state in resumeData
8. Repeat from step 1
```

### Implementation Example

**Server Action (actions.ts):**
```typescript
export async function resumeChatSurvey(
  runId: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [] // State from client
): Promise<WorkflowStartResult> {
  const workflow = getWorkflow();
  const run = await workflow.createRunAsync({ runId });

  const result = await run.resume({
    step: 'discovery-chat',
    resumeData: {
      userMessage,
      conversationHistory  // Pass state to step
    },
  });

  // Extract new state from result to send back to client
  return formatWorkflowResult({ ... });
}
```

**Client Component (cs-experience.tsx):**
```typescript
// Store state received from server
const [workflowHistory, setWorkflowHistory] = useState<Array<...>>([]);

const handleSendMessage = async (message: string) => {
  // Pass stored state back to server
  const result = await resumeChatSurvey(runId, message, workflowHistory);

  // Store updated state for next call
  if (result.suspendedData?.conversationHistory) {
    setWorkflowHistory(result.suspendedData.conversationHistory);
  }
};
```

**Workflow Step (discovery-chat.ts):**
```typescript
execute: async ({ inputData, resumeData, suspend }) => {
  // Get state from resumeData (passed from client via server)
  let conversationHistory = resumeData?.conversationHistory || [];

  // Process user message
  if (resumeData?.userMessage) {
    conversationHistory.push({ role: 'user', content: resumeData.userMessage });
  }

  // ... generate response ...

  // Suspend with updated state (will be sent back to client)
  return suspend({
    conversationHistory: updatedHistory,  // State for next round-trip
    assistantMessage: response.message,
    suggestedResponses: response.suggestions,
  });
}
```

---

## Implementation Details

### Mastra Instance Setup (src/mastra/index.ts)

```typescript
import { Mastra } from '@mastra/core';
import { PostgresStore } from '@mastra/pg';

// Singleton to prevent hot-reload issues
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
};

// Use DIRECT_URL for DDL operations (PgBouncer interferes)
const storage = new PostgresStore({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
});

export const mastra = globalForMastra.mastra ?? new Mastra({
  agents: { discoveryAgent, generationAgent },
  workflows: { chatSurveyWorkflow },
  storage,
});

// Initialize storage tables
storage.init();

if (process.env.NODE_ENV !== 'production') {
  globalForMastra.mastra = mastra;
}
```

### Getting Workflow with Proper Binding

```typescript
// WRONG - loses 'this' context
const workflow = mastra.getWorkflow('chatSurveyWorkflow'); // May throw

// CORRECT - preserve 'this' binding
const getWorkflow = () => {
  const boundGetWorkflow = mastra.getWorkflow.bind(mastra);
  return boundGetWorkflow('chatSurveyWorkflow');
};
```

### Extracting Suspend Payload from Results

Mastra returns suspended step info in a nested structure:

```typescript
result = {
  status: 'suspended',
  suspended: [['step-name']],  // Array of arrays with step names
  steps: {
    'step-name': {
      status: 'suspended',
      suspendPayload: { ... }  // The actual data from suspend()
    }
  }
}
```

Extract it like this:

```typescript
function formatWorkflowResult(result) {
  if (result.suspended && result.steps) {
    // Get step name from suspended array
    const suspendedStepName = result.suspended[0]?.[0];

    if (suspendedStepName && result.steps[suspendedStepName]) {
      const payload = result.steps[suspendedStepName].suspendPayload;
      // Now you have the suspend payload data
    }
  }
}
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/mastra/index.ts` | Mastra instance with storage configuration |
| `src/mastra/workflows/chat-survey/index.ts` | Workflow definition with step chaining |
| `src/mastra/workflows/chat-survey/steps/discovery-chat.ts` | Multi-turn chat step |
| `src/mastra/workflows/chat-survey/steps/generate-stream.ts` | Swipe interaction step |
| `src/mastra/workflows/chat-survey/types.ts` | Zod schemas for validation |
| `src/mastra/agents/chat-survey/index.ts` | AI agents used by steps |
| `app/chat-survey/actions.ts` | Server actions for workflow control |
| `app/chat-survey/components/cs-experience.tsx` | Main client component |

---

## Common Pitfalls

### 1. Step Returns Instead of Suspending

**Symptom**: "step-name was not suspended" error on resume

**Cause**: Step returned a value when it should have called `suspend()`

**Fix**: Ensure step always calls `suspend()` until explicitly complete

### 2. Lost 'this' Context

**Symptom**: "Cannot read properties of undefined (reading '#workflows')"

**Cause**: `mastra.getWorkflow` called without proper binding

**Fix**: Use `.bind(mastra)` when storing the method reference

### 3. State Not Persisting

**Symptom**: Workflow loops, always at turn 1, loses context

**Cause**: `run.getState()` returns empty object

**Fix**: Use client-side state round-trip pattern

### 4. PgBouncer DDL Issues

**Symptom**: Storage tables not created, connection errors

**Cause**: PgBouncer in transaction mode can't handle DDL

**Fix**: Use `DIRECT_URL` for PostgresStore connection

### 5. Duplicate Messages in UI

**Symptom**: Same message appears twice

**Cause**: Adding to both message history state and current question state

**Fix**: Use separate states - `messages` for history, `currentQuestion` for pending

---

## Blueprint for New Workflows

### Step 1: Define Types (types.ts)

```typescript
import { z } from 'zod';

export const stepInputSchema = z.object({
  // Input from previous step or workflow start
});

export const suspendPayloadSchema = z.object({
  // Data to send to client when suspended
  // Include ALL state needed for next resume
});

export const resumeDataSchema = z.object({
  // Data client sends back to resume
  // Include user action + state from previous suspend
});
```

### Step 2: Create Workflow Step

```typescript
import { createStep } from '@mastra/core/workflows';

export const myStep = createStep({
  id: 'my-step',
  inputSchema: stepInputSchema,
  outputSchema: z.object({ /* final output when complete */ }),

  execute: async ({ inputData, resumeData, suspend }) => {
    // 1. Reconstruct state from resumeData (round-trip) or inputData (initial)
    let state = resumeData?.state || inputData?.initialState || defaultState;

    // 2. Process any user action from resumeData
    if (resumeData?.userAction) {
      state = processAction(state, resumeData.userAction);
    }

    // 3. Check completion condition
    if (isComplete(state)) {
      return { finalResult: state };
    }

    // 4. Generate next interaction
    const nextPrompt = await generateNext(state);

    // 5. Suspend with ALL state for next round-trip
    return suspend({
      prompt: nextPrompt,
      state: state,  // Client will store and send back
    });
  },
});
```

### Step 3: Create Server Actions

```typescript
'use server';

export async function startMyWorkflow(): Promise<Result> {
  const workflow = getWorkflow();
  const run = await workflow.createRunAsync();
  const result = await run.start({ inputData: { ... } });
  return formatResult(result, run.runId);
}

export async function resumeMyWorkflow(
  runId: string,
  userAction: string,
  state: StateType  // From client
): Promise<Result> {
  const workflow = getWorkflow();
  const run = await workflow.createRunAsync({ runId });
  const result = await run.resume({
    step: 'my-step',
    resumeData: { userAction, state },
  });
  return formatResult(result, runId);
}
```

### Step 4: Create Client Component

```typescript
'use client';

export function MyWorkflowUI() {
  // UI state
  const [currentPrompt, setCurrentPrompt] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  // Workflow state for round-trip
  const [workflowState, setWorkflowState] = useState<StateType>({});
  const [runId, setRunId] = useState<string | null>(null);

  const handleStart = async () => {
    const result = await startMyWorkflow();
    setRunId(result.runId);
    setCurrentPrompt(result.suspendedData?.prompt);
    setWorkflowState(result.suspendedData?.state || {});
  };

  const handleUserAction = async (action: string) => {
    if (!runId) return;

    // Pass stored state back to server
    const result = await resumeMyWorkflow(runId, action, workflowState);

    if (result.status === 'completed') {
      // Handle completion
    } else {
      setCurrentPrompt(result.suspendedData?.prompt);
      setWorkflowState(result.suspendedData?.state || {});
    }
  };

  return (/* UI */);
}
```

---

## Summary

The key insights for Mastra workflow integration:

1. **Always suspend until done** - Steps must call `suspend()` on every interaction until completion
2. **Use client-side state round-trip** - Don't rely on `getState()`, pass state through the client
3. **Bind mastra methods** - Use `.bind(mastra)` when extracting workflow methods
4. **Use DIRECT_URL** - Avoid PgBouncer for storage connections
5. **Extract suspendPayload correctly** - It's in `steps[stepName].suspendPayload`, not directly on result

This pattern enables robust, stateful multi-step workflows that survive across requests and maintain full context throughout the user interaction.
