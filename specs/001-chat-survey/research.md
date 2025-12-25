# Research: Chat-Survey Agent (CS-01)

**Branch**: `001-chat-survey` | **Date**: 2025-12-24
**Source**: [2025-12-24-chat-survey-research.md](../../docs/plans/2025-12-24-chat-survey/2025-12-24-chat-survey-research.md)

This document consolidates research findings from the original research document and additional investigation for implementation planning.

---

## Decision 1: Execution Model

**Decision**: Mastra Workflow with suspend/resume

**Rationale**:
- Two distinct phases (chat → swipe) require clear step boundaries
- Suspend/resume pattern enables multi-turn conversation without losing state
- Typed step boundaries via Zod schemas ensure reliable data handoff
- Server-driven state survives browser refresh and enables session resumption

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|-----------------|
| Client-Driven State (like AP-02) | State lost on browser clear, no cross-device support, large payloads as conversation grows |
| Mastra Memory (single agent) | Unstructured data, phases not clearly separated, agent must infer state transitions |

---

## Decision 2: Storage Backend

**Decision**: PostgreSQL via Supabase with `@mastra/pg` PostgresStore

**Rationale**:
- Netlify Functions are serverless with ephemeral filesystems
- Current `:memory:` LibSQLStore loses state between function invocations
- Project already uses Supabase for main database (Drizzle ORM)
- PostgresStore provides durable workflow snapshot persistence
- Connection pooling via `?pgbouncer=true` handles serverless connection limits

**Alternatives Considered**:

| Alternative | Rejected Because |
|-------------|-----------------|
| LibSQLStore (`:memory:`) | State lost between serverless invocations |
| LibSQLStore (`file:`) | Netlify has ephemeral filesystem, files not persisted |
| Upstash Redis | Additional service to manage, Supabase already available |

**Required Package**: `@mastra/pg`

---

## Decision 3: State Management Pattern

**Decision**: Hybrid - Workflow State for persistence, minimal Client State for UI

**Rationale**:
- Server owns accumulated state (conversation history, profile, affirmations)
- Client holds only `runId` and current display data
- Small payloads on each API call (just runId + user input)
- No state synchronization issues - server is source of truth

**State Distribution**:

| Data | Location | Purpose |
|------|----------|---------|
| `runId` | Client (localStorage) | Session identifier for resume |
| `conversationHistory` | Server (workflow state) | Multi-turn context |
| `userProfile` | Server (workflow state) | Extracted preferences |
| `approvedAffirmations` | Server (workflow state) | Swipe feedback |
| `skippedAffirmations` | Server (workflow state) | Negative feedback |
| `currentQuestion` / `currentAffirmation` | Client (React state) | Current display |

---

## Decision 4: Workflow Architecture

**Decision**: Three-step workflow with typed transitions

**Steps**:
1. **Discovery Chat** - Suspends for each user message, accumulates conversation
2. **Profile Builder** - LLM extracts structured profile from raw conversation
3. **Generation Stream** - Suspends for each swipe, generates with feedback loop

**Rationale**:
- Profile extraction is a distinct transformation step
- Clear contracts between steps via Zod schemas
- Each step can use different agents optimized for its task

**Workflow State Schema**:
```typescript
const workflowStateSchema = z.object({
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
  userProfile: userProfileSchema.optional(),
  approvedAffirmations: z.array(z.string()).optional(),
  skippedAffirmations: z.array(z.string()).optional(),
});
```

---

## Decision 5: Agent Architecture

**Decision**: Three specialized agents

| Agent | Purpose | Key Characteristics |
|-------|---------|---------------------|
| Discovery Agent | Guide conversation, ask questions | Open-ended questions, empathetic tone, goal extraction |
| Profile Extractor Agent | Extract structured profile | Structured output, summarization, pattern recognition |
| Generation Agent | Create personalized affirmations | Incorporate feedback, tone matching, diversity in approach |

**Rationale**:
- Each agent has distinct system prompt and optimization needs
- Discovery needs conversational warmth, Generation needs creativity
- Profile extraction benefits from structured output configuration
- All agents use KV store for configurable prompts (constitution compliance)

---

## Decision 6: UI Component Strategy

**Decision**: Adapt existing AP-02 components, add chat interface

**Reusable from AP-02**:
- `SwipeCard` - Card display and swipe gestures
- `CardStack` - Card stack rendering
- `BottomBar` - Navigation and actions
- `SavedScreen` - View saved affirmations
- `useLocalStorageState` - Minimal client state persistence

**New Components**:
- `ChatPhase` - Chat bubble interface for discovery
- `CSExperience` - Orchestrator managing phase transitions

**Rationale**:
- AP-02 swipe mechanics are proven and battle-tested
- Consistent UX across the app for swipe interactions
- Only chat interface is truly new functionality

---

## Decision 7: Session Resumption Strategy

**Decision**: localStorage `runId` + server workflow snapshot

**Flow**:
1. On session start, store `runId` in localStorage
2. On page load, check localStorage for existing `runId`
3. If found, offer "Continue previous session" option
4. On continue, resume workflow from server snapshot
5. On "Start new", clear localStorage and begin fresh workflow

**Rationale**:
- Minimal client storage (just UUID)
- Full state recovered from server
- Works across browser refresh, tab close/reopen
- Does not support cross-device (acceptable for MVP per spec)

---

## Decision 8: Conversation Completion Detection

**Decision**: Agent-driven with turn limit fallback

**Strategy**:
- Discovery agent prompted to conclude when sufficient info gathered
- Agent response includes marker (e.g., "I think I understand your needs now...")
- Backend detects completion marker to transition phases
- Hard limit at 7 turns to prevent infinite conversations

**Markers to Detect**:
- Explicit summary statement
- Transition phrase ("Let's create some affirmations...")
- Or: Structured output with `conversationComplete: true` flag

**Rationale**:
- Natural conversation flow, not abrupt cutoff
- Agent has context to judge information sufficiency
- Fallback ensures sessions don't hang

---

## Decision 9: Affirmation Generation Feedback Loop

**Decision**: Include last 5 approved and last 10 skipped in generation prompt

**Rationale**:
- Approved: Pattern reinforcement ("more like these")
- Skipped: Pattern avoidance ("avoid these patterns")
- Limited history prevents token overflow
- Recent feedback more relevant than older

**Buffer Strategy** (from AP-02):
- Pre-generate 10-12 affirmations initially
- Fetch more when queue drops to 3 remaining
- Background fetch to prevent user waiting

---

## Decision 10: Error Handling Strategy

**Decision**: Graceful degradation with user feedback

**Scenarios**:

| Error | Handling |
|-------|----------|
| Network failure mid-chat | Save client input, retry on reconnect, show "reconnecting..." |
| Workflow resume fails | Offer "Start fresh" option, log error for debugging |
| LLM rate limit | Retry with exponential backoff, show "Taking a moment..." |
| Invalid workflow state | Reset workflow, inform user session was reset |

**Rationale**:
- Users should never see raw error messages
- Sessions should be recoverable where possible
- Transparent about what's happening (loading states)

---

## Open Questions (Resolved)

All NEEDS CLARIFICATION items from initial research have been resolved:

| Question | Resolution |
|----------|------------|
| Storage backend for Netlify? | PostgreSQL via Supabase with pgbouncer pooling |
| New Supabase instance? | Use existing project Supabase, add workflow tables |
| Conversation completion logic? | Agent-driven with 7-turn fallback |
| Skip discovery behavior? | Proceed with empty profile, explore mode like AP-02 |

---

## Dependencies to Install

```bash
npm install @mastra/pg
```

---

## Environment Variables to Add

```bash
# For Mastra PostgresStore (use existing DATABASE_URL or dedicated)
# Already available: DATABASE_URL from Supabase config
```

Note: The existing `DATABASE_URL` from the project's Supabase instance can be used for Mastra workflow storage. No separate database instance required.

---

## References

- [Original Research Document](../../docs/plans/2025-12-24-chat-survey/2025-12-24-chat-survey-research.md)
- [Mastra Workflows Documentation](https://mastra.ai/docs/workflows/overview)
- [Mastra Suspend/Resume](https://mastra.ai/docs/workflows/suspend-and-resume)
- [Mastra PostgresStore](https://mastra.ai/en/docs/storage/overview)
