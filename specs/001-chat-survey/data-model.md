# Data Model: Chat-Survey Agent (CS-01)

**Branch**: `001-chat-survey` | **Date**: 2025-12-24

This document defines the data structures used in the CS-01 workflow.

---

## Core Entities

### 1. Workflow State

The primary state container persisted by Mastra workflow engine.

```typescript
interface WorkflowState {
  // Phase 1: Discovery Chat
  conversationHistory?: ConversationMessage[];

  // Phase 1 → Phase 2: Extracted Profile
  userProfile?: UserProfile;

  // Phase 2: Swipe Tracking
  approvedAffirmations?: string[];
  skippedAffirmations?: string[];
  generatedAffirmations?: string[];
}
```

**Storage**: Mastra PostgresStore (workflow snapshot table)
**Lifecycle**: Created on workflow start, updated on each suspend/resume, retained until explicit deletion

---

### 2. Conversation Message

Individual message in the discovery chat conversation.

```typescript
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;  // ISO 8601, optional for ordering
}
```

**Validation Rules**:
- `role` must be exactly 'user' or 'assistant'
- `content` must be non-empty string
- Messages ordered chronologically (array order = time order)

---

### 3. User Profile

Structured extraction from discovery conversation.

```typescript
interface UserProfile {
  themes: string[];           // Life areas of focus
  challenges: string[];       // Current difficulties
  tone: TonePreference;       // Desired affirmation style
  insights: string[];         // Key personal insights
  conversationSummary: string; // Brief summary for generation context
}

type TonePreference = 'gentle' | 'assertive' | 'balanced' | 'spiritual';
```

**Validation Rules**:
- `themes` must have at least 1 item
- `challenges` can be empty (user may not share)
- `tone` must be one of the four options
- `conversationSummary` should be < 500 characters

**State Transitions**:
- Created by Profile Builder step
- Read by Generation Stream step
- Immutable once created (not updated during swipe phase)

---

### 4. Session Identifier

Client-side reference to server workflow.

```typescript
interface SessionReference {
  runId: string;              // Mastra workflow run ID (UUID)
  phase: 'chat' | 'swipe';    // Current phase for UI routing
  startedAt: string;          // ISO 8601 timestamp
}
```

**Storage**: Client localStorage (`cs01.session.v1`)
**Lifecycle**: Created on session start, cleared on explicit reset

---

### 5. Suspend Payload (Chat Phase)

Data returned to client when workflow suspends during discovery.

```typescript
interface ChatSuspendPayload {
  assistantMessage: string;      // Message to display
  turnNumber: number;            // Current turn count
  suggestedResponses?: string[]; // Optional quick-reply suggestions
}
```

---

### 6. Suspend Payload (Swipe Phase)

Data returned to client when workflow suspends during generation.

```typescript
interface SwipeSuspendPayload {
  affirmation: string;           // Affirmation to display
  index: number;                 // Ordinal position in session
}
```

---

### 7. Resume Data (Chat Phase)

Data sent by client to resume workflow during discovery.

```typescript
interface ChatResumeData {
  userMessage: string;           // User's response
}
```

---

### 8. Resume Data (Swipe Phase)

Data sent by client to resume workflow during generation.

```typescript
interface SwipeResumeData {
  action: 'approve' | 'skip';    // User's swipe decision
  affirmation: string;           // The affirmation they acted on
}
```

---

## Zod Schemas (Implementation Reference)

```typescript
import { z } from 'zod';

// Conversation Message
export const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  timestamp: z.string().optional(),
});

// Tone Preference
export const tonePreferenceSchema = z.enum([
  'gentle',
  'assertive',
  'balanced',
  'spiritual'
]);

// User Profile
export const userProfileSchema = z.object({
  themes: z.array(z.string()).min(1),
  challenges: z.array(z.string()),
  tone: tonePreferenceSchema,
  insights: z.array(z.string()),
  conversationSummary: z.string().max(500),
});

// Workflow State
export const workflowStateSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema).optional(),
  userProfile: userProfileSchema.optional(),
  approvedAffirmations: z.array(z.string()).optional(),
  skippedAffirmations: z.array(z.string()).optional(),
  generatedAffirmations: z.array(z.string()).optional(),
});

// Suspend Payloads
export const chatSuspendPayloadSchema = z.object({
  assistantMessage: z.string(),
  turnNumber: z.number(),
  suggestedResponses: z.array(z.string()).optional(),
});

export const swipeSuspendPayloadSchema = z.object({
  affirmation: z.string(),
  index: z.number(),
});

// Resume Data
export const chatResumeDataSchema = z.object({
  userMessage: z.string().min(1),
});

export const swipeResumeDataSchema = z.object({
  action: z.enum(['approve', 'skip']),
  affirmation: z.string(),
});
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      WORKFLOW STATE                              │
│  (Mastra PostgresStore - workflow_snapshots table)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Conversation    │    │ User Profile    │                    │
│  │ History         │───►│ (extracted)     │                    │
│  │                 │    │                 │                    │
│  │ - role          │    │ - themes[]      │                    │
│  │ - content       │    │ - challenges[]  │                    │
│  │ - timestamp?    │    │ - tone          │                    │
│  └─────────────────┘    │ - insights[]    │                    │
│                         │ - summary       │                    │
│                         └────────┬────────┘                    │
│                                  │                              │
│                                  ▼                              │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Approved        │    │ Skipped         │                    │
│  │ Affirmations[]  │    │ Affirmations[]  │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ runId reference
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT STATE                                │
│  (localStorage - cs01.session.v1)                               │
├─────────────────────────────────────────────────────────────────┤
│  - runId (links to workflow)                                    │
│  - phase ('chat' | 'swipe')                                     │
│  - startedAt                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow by Phase

### Phase 1: Discovery Chat

1. **Workflow Start** → Empty `conversationHistory`
2. **Each Turn**:
   - User sends `ChatResumeData.userMessage`
   - Message appended to `conversationHistory`
   - Agent generates response
   - Response appended to `conversationHistory`
   - Workflow suspends with `ChatSuspendPayload`
3. **Phase Transition** → `conversationHistory` complete

### Profile Extraction

1. **Input**: `conversationHistory`
2. **Processing**: LLM extracts structured data
3. **Output**: `UserProfile` written to workflow state

### Phase 2: Swipe Generation

1. **Each Swipe**:
   - User sends `SwipeResumeData` (approve/skip)
   - Affirmation added to appropriate list
   - New affirmation generated using profile + feedback
   - Workflow suspends with `SwipeSuspendPayload`
2. **Session End**: User navigates away, workflow remains suspended

---

## KV Store Keys (Agent Configuration)

| Key Pattern | Purpose |
|-------------|---------|
| `versions.cs-01.system_discovery.{impl}` | Discovery agent system prompt |
| `versions.cs-01.system_generation.{impl}` | Generation agent system prompt |
| `versions.cs-01.prompt_extract.{impl}` | Profile extraction prompt template |
| `versions.cs-01._temperature_discovery.{impl}` | Discovery agent temperature |
| `versions.cs-01._temperature_generation.{impl}` | Generation agent temperature |
| `versions.cs-01._model_name.{impl}` | Model override for agents |

---

## Notes

- All Zod schemas should be defined in `src/mastra/workflows/chat-survey/types.ts`
- Schemas are shared between workflow steps and server actions
- Client types can be derived from Zod schemas using `z.infer<typeof schema>`
