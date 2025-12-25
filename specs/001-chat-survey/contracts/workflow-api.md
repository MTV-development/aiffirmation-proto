# API Contracts: Chat-Survey Agent (CS-01)

**Branch**: `001-chat-survey` | **Date**: 2025-12-24

This document defines the server action interfaces for the CS-01 workflow.

---

## Overview

CS-01 uses Next.js Server Actions to control the Mastra workflow. All actions are defined in `app/chat-survey/actions.ts`.

---

## Server Actions

### 1. startChatSurvey

Start a new chat-survey session.

**Signature**:
```typescript
'use server';

export async function startChatSurvey(): Promise<WorkflowStartResult>
```

**Input**: None (anonymous session)

**Output**:
```typescript
interface WorkflowStartResult {
  runId: string;                    // Workflow instance ID (store in client)
  status: 'running' | 'suspended' | 'completed' | 'failed';
  suspendedData?: {
    step: string;                   // Current step name
    assistantMessage?: string;      // Message to display (chat phase)
    turnNumber?: number;            // Turn count (chat phase)
    suggestedResponses?: string[];  // Quick replies (chat phase)
    affirmation?: string;           // Affirmation to display (swipe phase)
    index?: number;                 // Affirmation count (swipe phase)
  };
  error?: string;                   // Error message if failed
}
```

**Behavior**:
1. Creates new Mastra workflow run
2. Starts workflow with empty initial state
3. Workflow suspends at first discovery question
4. Returns runId and first question

**Example Response**:
```json
{
  "runId": "abc123-def456-...",
  "status": "suspended",
  "suspendedData": {
    "step": "discovery-chat",
    "assistantMessage": "Hi! I'm here to help you discover affirmations that truly resonate with you. What brings you here today, and what area of your life would you most like to focus on?",
    "turnNumber": 1,
    "suggestedResponses": [
      "I'm feeling anxious and need calm",
      "I want to build confidence",
      "I'm going through a big life change"
    ]
  }
}
```

---

### 2. resumeChatSurvey

Send a message during the discovery chat phase.

**Signature**:
```typescript
'use server';

export async function resumeChatSurvey(
  runId: string,
  userMessage: string
): Promise<WorkflowStartResult>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | string | Workflow run ID from startChatSurvey |
| `userMessage` | string | User's response message |

**Output**: Same as `WorkflowStartResult`

**Behavior**:
1. Loads workflow snapshot from storage
2. Resumes discovery-chat step with user message
3. Agent processes message, generates response
4. Either suspends again (more questions) or transitions to next step
5. If profile extraction completes, suspends at first affirmation

**Phase Transition Detection**:
- If `suspendedData.step === 'generate-stream'`, client should switch to swipe UI
- Profile has been extracted and first affirmation is ready

**Example Response (continuing chat)**:
```json
{
  "runId": "abc123-def456-...",
  "status": "suspended",
  "suspendedData": {
    "step": "discovery-chat",
    "assistantMessage": "That's really insightful. What kind of tone feels most supportive to you - something gentle and nurturing, or more direct and empowering?",
    "turnNumber": 3
  }
}
```

**Example Response (transitioning to swipe)**:
```json
{
  "runId": "abc123-def456-...",
  "status": "suspended",
  "suspendedData": {
    "step": "generate-stream",
    "affirmation": "I trust my ability to navigate uncertainty with grace.",
    "index": 1
  }
}
```

---

### 3. swipeAffirmation

Process a swipe action during the generation phase.

**Signature**:
```typescript
'use server';

export async function swipeAffirmation(
  runId: string,
  action: 'approve' | 'skip',
  affirmation: string
): Promise<WorkflowStartResult>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | string | Workflow run ID |
| `action` | 'approve' \| 'skip' | Swipe direction (right=approve, left=skip) |
| `affirmation` | string | The affirmation that was swiped |

**Output**: Same as `WorkflowStartResult`

**Behavior**:
1. Loads workflow snapshot
2. Adds affirmation to appropriate list (approved/skipped)
3. Generates next affirmation using updated feedback
4. Suspends with new affirmation

**Example Response**:
```json
{
  "runId": "abc123-def456-...",
  "status": "suspended",
  "suspendedData": {
    "step": "generate-stream",
    "affirmation": "My worth is not defined by my productivity.",
    "index": 5
  }
}
```

---

### 4. skipToSwipe

Skip the discovery phase and go directly to swipe mode.

**Signature**:
```typescript
'use server';

export async function skipToSwipe(runId?: string): Promise<WorkflowStartResult>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | string? | Optional existing run ID to skip discovery |

**Output**: Same as `WorkflowStartResult`

**Behavior**:
1. If runId provided: Fast-forward existing workflow to generate-stream
2. If no runId: Create new workflow with empty profile, skip to generation
3. Return first affirmation (exploration mode)

**Notes**:
- Empty profile triggers "exploration" mode in generation agent
- Similar behavior to AP-02's initial diverse generation

---

### 5. getSessionState

Retrieve current session state for resumption.

**Signature**:
```typescript
'use server';

export async function getSessionState(
  runId: string
): Promise<SessionStateResult>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | string | Workflow run ID to query |

**Output**:
```typescript
interface SessionStateResult {
  exists: boolean;                  // Whether session exists
  status?: 'running' | 'suspended' | 'completed' | 'failed';
  phase?: 'chat' | 'swipe';        // Current phase for UI routing
  savedCount?: number;              // Number of approved affirmations
  suspendedData?: {                 // Current suspend state
    // ... same as WorkflowStartResult.suspendedData
  };
  error?: string;
}
```

**Behavior**:
1. Loads workflow snapshot
2. Returns current state without modifying
3. Used on page load to determine resume UI

---

### 6. getSavedAffirmations

Retrieve all approved affirmations from current session.

**Signature**:
```typescript
'use server';

export async function getSavedAffirmations(
  runId: string
): Promise<SavedAffirmationsResult>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | string | Workflow run ID |

**Output**:
```typescript
interface SavedAffirmationsResult {
  affirmations: string[];
  error?: string;
}
```

**Behavior**:
1. Loads workflow state
2. Returns `approvedAffirmations` array
3. Empty array if none saved

---

### 7. removeSavedAffirmation

Remove an affirmation from the saved list.

**Signature**:
```typescript
'use server';

export async function removeSavedAffirmation(
  runId: string,
  affirmation: string
): Promise<{ success: boolean; error?: string }>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `runId` | string | Workflow run ID |
| `affirmation` | string | Affirmation to remove |

**Behavior**:
1. Loads workflow state
2. Removes affirmation from `approvedAffirmations`
3. Updates workflow snapshot
4. Returns success status

---

## Error Handling

All actions return errors in a consistent format:

```typescript
// Success
{ runId: "...", status: "suspended", ... }

// Error
{ runId: "...", status: "failed", error: "Session not found" }
```

**Common Error Cases**:

| Error | HTTP-like Status | Message |
|-------|------------------|---------|
| Session not found | 404 | "Session not found or expired" |
| Invalid state | 400 | "Cannot resume from current state" |
| Rate limit | 429 | "Please wait a moment before continuing" |
| Server error | 500 | "Something went wrong. Please try again." |

---

## Client Usage Example

```typescript
// Start new session
const { runId, suspendedData } = await startChatSurvey();
localStorage.setItem('cs01.runId', runId);

// Chat interaction
const result = await resumeChatSurvey(runId, "I'm feeling anxious");

// Check for phase transition
if (result.suspendedData?.step === 'generate-stream') {
  // Switch to swipe UI
  setPhase('swipe');
  setCurrentAffirmation(result.suspendedData.affirmation);
} else {
  // Continue chat
  setCurrentQuestion(result.suspendedData?.assistantMessage);
}

// Swipe interaction
const nextResult = await swipeAffirmation(runId, 'approve', currentAffirmation);
setCurrentAffirmation(nextResult.suspendedData?.affirmation);
```

---

## Rate Limiting

Server actions should implement rate limiting:

| Action | Limit | Window |
|--------|-------|--------|
| `startChatSurvey` | 10 | per minute per IP |
| `resumeChatSurvey` | 30 | per minute per runId |
| `swipeAffirmation` | 60 | per minute per runId |

Implementation via standard Next.js middleware or Vercel/Netlify edge configuration.
