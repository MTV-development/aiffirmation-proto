# Chat-Survey Agent Research Document

**Date:** 2025-12-24
**Status:** Research Phase
**Agent Codename:** CS-01 (Chat-Survey)

---

## Executive Summary

This document outlines the research and technical approach for building a new Mastra-based agent that combines a conversational survey phase with personalized affirmation generation. The agent operates in two distinct phases:

1. **Phase 1: Discovery Chat** - An interactive conversation that explores what the user wants to achieve with affirmations
2. **Phase 2: Swipe-Based Generation** - One-by-one affirmation generation (like AP-02) but enriched with insights from Phase 1, where discards feed back into subsequent generations

This creates a hybrid experience: the personalization depth of a guided interview combined with the low-friction discovery of swipe interaction.

---

## Problem Statement

Current affirmation agents in the project fall into two categories:

| Agent Type | Examples | Strength | Weakness |
|------------|----------|----------|----------|
| **Survey-First** | FP-01, FP-02 | Deep personalization via structured input | Requires upfront user effort; users may not know what they need |
| **Zero-Input** | AP-02 | Immediate value; behavioral learning via swipes | Cold start problem; takes many swipes to learn preferences |

**The Gap:** There's no agent that combines conversational discovery (to understand the *why*) with reactive generation (to refine the *what*). Users who want personalized affirmations often don't know exactly what they need until they explore it in conversation.

---

## Proposed Solution: Two-Phase Workflow

### Phase 1: Discovery Chat

A conversational AI guides the user through understanding their affirmation goals:

- What areas of life they want to focus on
- Current challenges or pain points
- Desired emotional tone and style
- Past experiences with affirmations (what worked/didn't)
- Underlying motivations and aspirations

**Output:** A structured "User Profile" containing themes, tone preferences, and key insights.

### Phase 2: Reactive Affirmation Stream

Using the profile from Phase 1:

- Generate affirmations one-by-one (or in small batches)
- Present with swipe UI (like AP-02)
- Swipe right = approve, stored in "favorites"
- Swipe left = discard, fed back to improve next generation
- Each subsequent affirmation is informed by both the original profile AND the swipe feedback

**Key Innovation:** Unlike AP-02's cold start, this phase begins with rich context from the chat, dramatically reducing the exploration period.

---

## Mastra Workflows: Technical Research

### Version Context

This project uses:
- `@mastra/core`: ^0.24.6
- `@mastra/memory`: ^0.15.12
- `@mastra/libsql`: ^0.16.3
- `mastra` CLI: ^0.18.6

All research below is verified against these versions.

### Workflow Fundamentals

Mastra workflows provide structured task execution with full control over step sequencing, data flow, and state management.

**Reference:** https://mastra.ai/docs/workflows/overview

```typescript
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";

const myWorkflow = createWorkflow({
  id: "my-workflow",
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})
  .then(step1)
  .then(step2)
  .commit();
```

### Creating Steps

Steps are the atomic units of workflows:

```typescript
const step1 = createStep({
  id: "step-1",
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ formatted: z.string() }),
  execute: async ({ inputData }) => {
    return { formatted: inputData.message.toUpperCase() };
  }
});
```

### State Management Across Steps

Workflows support shared state via `stateSchema`:

```typescript
const stepWithState = createStep({
  id: "stateful-step",
  stateSchema: z.object({
    userProfile: z.object({
      themes: z.array(z.string()),
      tone: z.string(),
    }).optional(),
  }),
  execute: async ({ state, setState, inputData }) => {
    // Read from shared state
    const existing = state.userProfile;

    // Update shared state (available to all subsequent steps)
    setState({
      ...state,
      userProfile: { themes: ["growth"], tone: "gentle" }
    });

    return { /* step output */ };
  }
});
```

### Control Flow Options

Mastra provides rich control flow primitives:

| Method | Purpose |
|--------|---------|
| `.then(step)` | Sequential execution |
| `.parallel([step1, step2])` | Concurrent execution |
| `.branch([[cond, step], ...])` | Conditional branching |
| `.dowhile(step, condition)` | Loop while true |
| `.dountil(step, condition)` | Loop until true |
| `.foreach(step, { concurrency })` | Iterate over arrays |
| `.map(transform)` | Transform data between steps |

**Reference:** https://mastra.ai/docs/workflows/control-flow

### Suspend and Resume (Critical for Chat Phase)

Workflows can pause for user input using `suspend()` and `resume()`:

**Reference:** https://mastra.ai/docs/workflows/suspend-and-resume

```typescript
const chatStep = createStep({
  id: "collect-preferences",
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({
    preferences: z.object({
      themes: z.array(z.string()),
      tone: z.string(),
    })
  }),
  // Schema for data provided on resume
  resumeSchema: z.object({
    userMessage: z.string()
  }),
  execute: async ({ suspend, resumeData, mastra, inputData }) => {
    const agent = mastra.getAgent("surveyAgent");

    // If we have resume data, process it
    if (resumeData?.userMessage) {
      // Process user's answer and continue conversation
      const response = await agent.generate(resumeData.userMessage);
      // ... determine if we need more info or can conclude
    }

    // If we need more input, suspend
    await suspend({
      question: "What areas of life would you like to focus on?",
      context: "Current conversation context..."
    });
  }
});
```

**Resuming a workflow:**

```typescript
const workflow = mastra.getWorkflow("chatSurveyWorkflow");
const run = await workflow.createRunAsync();

// Start - will suspend at first user input request
const result1 = await run.start({ inputData: { userId: "123" } });

if (result1.status === "suspended") {
  // User provides input...
  const result2 = await run.resume({
    step: result1.suspended[0], // Resume the suspended step
    resumeData: { userMessage: "I want to focus on self-confidence" }
  });
}
```

### Using Agents in Workflow Steps

Agents can be invoked within workflow steps:

**Reference:** https://mastra.ai/docs/workflows/using-with-agents-and-tools

```typescript
const agentStep = createStep({
  id: "generate-affirmation",
  inputSchema: z.object({ profile: userProfileSchema }),
  outputSchema: z.object({ affirmation: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent("affirmationAgent");

    const response = await agent.generate(
      `Generate one affirmation for user with profile: ${JSON.stringify(inputData.profile)}`
    );

    return { affirmation: response.text };
  }
});
```

### Running Workflows

**Start mode (blocking):**

```typescript
const run = await workflow.createRunAsync();
const result = await run.start({
  inputData: { userId: "123" }
});
console.log(result.status); // "success" | "suspended" | "failed"
```

**Stream mode (for real-time UI updates):**

```typescript
const run = await workflow.createRunAsync();
const result = await run.stream({
  inputData: { userId: "123" }
});

for await (const chunk of result.fullStream) {
  console.log(chunk); // Step progress, outputs, etc.
}
```

---

## Current Project Architecture Reference

### Existing Agent Patterns

The project uses a **static + factory pattern** for agents:

**Location:** `src/mastra/agents/{agent-name}/agent.ts`

```typescript
// Static agent for Mastra registration
export const agentName = new Agent({
  name: "AgentName",
  instructions: DEFAULT_INSTRUCTIONS,
  model: getModel(),
});

// Dynamic factory for runtime customization
export async function createAgentName(
  implementation: string = "default"
): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt("agent-id", implementation);
  const modelName = await getAgentModelName("agent-id", implementation);

  return new Agent({
    name: "AgentName",
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: getModel(modelName || undefined),
  });
}
```

### KV Store Configuration Pattern

System prompts and settings are configurable via the KV store:

**Key Pattern:** `versions.{agentId}.{key}.{implementation}`

| Key | Purpose |
|-----|---------|
| `system` | System prompt override |
| `prompt` | User prompt template |
| `_temperature` | LLM temperature |
| `_model_name` | Model selection |

### Server Action Pattern

Agents are consumed via Next.js Server Actions:

**Location:** `app/{agent-name}/actions.ts`

```typescript
"use server";

export async function generateAffirmations(params: GenerateParams) {
  // 1. Validate input
  // 2. Render prompt template from KV
  // 3. Create agent with dynamic config
  // 4. Call agent.generate()
  // 5. Parse response
  // 6. Return structured result
}
```

### AP-02 Swipe UI Pattern (Reference Implementation)

**Location:** `components/alt-process-2/ap2-experience.tsx`

Key patterns from AP-02:

1. **State Management:**
   ```typescript
   interface AP2State {
     phase: 'stream' | 'tune' | 'saved';
     currentIndex: number;
     affirmationQueue: string[];
     savedAffirmations: string[];
     skippedAffirmations: string[];
     shownAffirmations: string[];
     totalSwipes: number;
     tonePreference: 'neutral' | 'gentle' | 'strong' | null;
   }
   ```

2. **Infinite Scroll with Buffer:**
   - Fetch 10-12 affirmations initially
   - When queue drops to 3 remaining, fetch more in background
   - Pass saved/skipped history to inform new generations

3. **Swipe Handler:**
   ```typescript
   const handleSwipe = (direction: SwipeDirection, affirmation: string) => {
     if (direction === 'right') {
       // Save affirmation
       savedAffirmations.push(affirmation);
     } else {
       // Skip - use for negative learning
       skippedAffirmations.push(affirmation);
     }
     currentIndex++;
     totalSwipes++;
   };
   ```

4. **Behavioral Learning:**
   - Phase 1 (0-10 swipes): Exploration with intentional diversity
   - Phase 2 (10+ swipes): Progressive personalization

---

## Proposed Architecture for CS-01

### File Structure

```
src/mastra/
├── workflows/
│   └── chat-survey/
│       ├── index.ts              # Workflow definition
│       ├── steps/
│       │   ├── discovery-chat.ts # Phase 1: Conversational discovery
│       │   ├── profile-builder.ts# Extract structured profile from chat
│       │   └── generate-stream.ts# Phase 2: Generate affirmations
│       └── types.ts              # Shared types and schemas
├── agents/
│   └── chat-survey/
│       ├── index.ts              # Re-exports
│       ├── discovery-agent.ts    # Conversational discovery agent
│       └── generation-agent.ts   # Affirmation generation agent

app/chat-survey/
├── layout.tsx
├── page.tsx
├── actions.ts                    # Server actions for workflow control
└── components/
    ├── index.ts
    ├── types.ts
    ├── chat-phase.tsx            # Phase 1 UI (chat interface)
    ├── swipe-phase.tsx           # Phase 2 UI (swipe cards)
    └── cs-experience.tsx         # Main orchestrator
```

### Workflow Definition

```typescript
// src/mastra/workflows/chat-survey/index.ts
import { createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { discoveryChatStep } from "./steps/discovery-chat";
import { profileBuilderStep } from "./steps/profile-builder";
import { generateStreamStep } from "./steps/generate-stream";

export const userProfileSchema = z.object({
  themes: z.array(z.string()),
  challenges: z.array(z.string()),
  tone: z.enum(["gentle", "assertive", "balanced", "spiritual"]),
  insights: z.array(z.string()),
  conversationSummary: z.string(),
});

export const chatSurveyWorkflow = createWorkflow({
  id: "chat-survey-workflow",
  inputSchema: z.object({
    userId: z.string(),
    sessionId: z.string(),
  }),
  outputSchema: z.object({
    profile: userProfileSchema,
    affirmations: z.array(z.string()),
  }),
  stateSchema: z.object({
    conversationHistory: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })).optional(),
    userProfile: userProfileSchema.optional(),
    generatedAffirmations: z.array(z.string()).optional(),
    approvedAffirmations: z.array(z.string()).optional(),
    skippedAffirmations: z.array(z.string()).optional(),
  }),
})
  // Phase 1: Multi-turn discovery conversation
  .then(discoveryChatStep)

  // Extract structured profile from conversation
  .then(profileBuilderStep)

  // Phase 2: Generate affirmations with feedback loop
  .then(generateStreamStep)

  .commit();
```

### Discovery Chat Step (with Suspend/Resume)

```typescript
// src/mastra/workflows/chat-survey/steps/discovery-chat.ts
import { createStep } from "@mastra/core/workflows";
import { z } from "zod";

export const discoveryChatStep = createStep({
  id: "discovery-chat",
  inputSchema: z.object({
    userId: z.string(),
    sessionId: z.string(),
  }),
  outputSchema: z.object({
    conversationComplete: z.boolean(),
    conversationHistory: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })),
  }),
  suspendSchema: z.object({
    assistantMessage: z.string(),
    turnNumber: z.number(),
    suggestedResponses: z.array(z.string()).optional(),
  }),
  resumeSchema: z.object({
    userMessage: z.string(),
  }),
  execute: async ({ inputData, state, setState, suspend, resumeData, mastra }) => {
    const discoveryAgent = mastra.getAgent("discoveryAgent");
    const history = state.conversationHistory || [];

    // If resuming with user message
    if (resumeData?.userMessage) {
      history.push({ role: "user", content: resumeData.userMessage });
    }

    // Generate next assistant turn
    const response = await discoveryAgent.generate(
      buildDiscoveryPrompt(history),
      { /* agent options */ }
    );

    history.push({ role: "assistant", content: response.text });

    // Update state
    setState({ ...state, conversationHistory: history });

    // Check if conversation is complete (agent decides)
    const isComplete = detectConversationComplete(response.text);

    if (!isComplete) {
      // Need more user input
      await suspend({
        assistantMessage: response.text,
        turnNumber: history.length,
        suggestedResponses: extractSuggestions(response.text),
      });
    }

    return {
      conversationComplete: true,
      conversationHistory: history,
    };
  }
});
```

### Generation Stream Step (with Feedback Loop)

```typescript
// src/mastra/workflows/chat-survey/steps/generate-stream.ts
import { createStep } from "@mastra/core/workflows";
import { z } from "zod";

export const generateStreamStep = createStep({
  id: "generate-stream",
  inputSchema: z.object({
    profile: userProfileSchema,
  }),
  outputSchema: z.object({
    affirmation: z.string(),
    batchComplete: z.boolean(),
  }),
  suspendSchema: z.object({
    affirmation: z.string(),
    index: z.number(),
  }),
  resumeSchema: z.object({
    action: z.enum(["approve", "skip"]),
    affirmation: z.string(),
  }),
  execute: async ({ inputData, state, setState, suspend, resumeData, mastra }) => {
    const generationAgent = mastra.getAgent("generationAgent");

    // Process previous swipe feedback
    if (resumeData) {
      const approved = state.approvedAffirmations || [];
      const skipped = state.skippedAffirmations || [];

      if (resumeData.action === "approve") {
        approved.push(resumeData.affirmation);
      } else {
        skipped.push(resumeData.affirmation);
      }

      setState({ ...state, approvedAffirmations: approved, skippedAffirmations: skipped });
    }

    // Generate next affirmation with full context
    const response = await generationAgent.generate(
      buildGenerationPrompt({
        profile: inputData.profile,
        approved: state.approvedAffirmations || [],
        skipped: state.skippedAffirmations || [],
      })
    );

    const affirmation = parseAffirmation(response.text);

    // Suspend to show affirmation and wait for swipe
    await suspend({
      affirmation,
      index: (state.generatedAffirmations?.length || 0) + 1,
    });
  }
});
```

---

## Data Handoff Between Phases: Workflow State vs. Conversation Memory

A critical architectural question: **How does information flow from Phase 1 (chat) to Phase 2 (generation)?**

### The Two Options

| Approach | Mechanism | Data Location |
|----------|-----------|---------------|
| **Workflow State** | `stateSchema` + `setState()` | Persisted in Mastra storage |
| **Conversation Memory** | `@mastra/memory` thread | Persisted in LibSQL/memory storage |

### Recommendation: Workflow State (Not Conversation Memory)

For this use case, **workflow state is the correct choice**. Here's why:

#### Why NOT Conversation Memory

Mastra's conversation memory (`@mastra/memory`) is designed for:
- Maintaining chat history within a single agent's context
- Allowing the LLM to reference previous messages naturally
- Multi-turn conversations where the model needs raw message access

However, conversation memory has limitations for cross-phase handoff:

1. **Unstructured Data:** Memory stores raw conversation text, not structured profiles
2. **Context Window Limits:** Long chats consume tokens; structured summaries are more efficient
3. **Wrong Abstraction:** Memory is for "what was said," not "what was learned"
4. **Phase Separation:** Phase 2 doesn't need chat history—it needs extracted insights

#### Why Workflow State IS the Right Choice

Workflow state via `stateSchema` provides:

1. **Structured Data:** Define exact schema for user profile
2. **Type Safety:** Zod validation at each step boundary
3. **Explicit Handoff:** Clear contract between Phase 1 output and Phase 2 input
4. **Persistence:** Automatically saved to storage provider (LibSQL)
5. **Survives Restarts:** State persists across suspend/resume cycles

### How the Handoff Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         WORKFLOW STATE                          │
│  stateSchema: {                                                │
│    conversationHistory: [...],    // Phase 1 accumulates       │
│    userProfile: {...},            // Profile-builder extracts  │
│    approvedAffirmations: [...],   // Phase 2 accumulates       │
│    skippedAffirmations: [...]     // Phase 2 accumulates       │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PHASE 1        │  │   PROFILE        │  │   PHASE 2        │
│   Discovery      │  │   Builder        │  │   Generation     │
│   Chat Step      │  │   Step           │  │   Stream Step    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ READS:           │  │ READS:           │  │ READS:           │
│ - (none)         │  │ - conversation-  │  │ - userProfile    │
│                  │  │   History        │  │ - approved/      │
│ WRITES:          │  │                  │  │   skipped        │
│ - conversation-  │  │ WRITES:          │  │                  │
│   History        │  │ - userProfile    │  │ WRITES:          │
│                  │  │                  │  │ - approved/      │
│ OUTPUT:          │  │ OUTPUT:          │  │   skipped        │
│ - conversation-  │  │ - profile        │  │                  │
│   History        │  │                  │  │ OUTPUT:          │
│                  │  │                  │  │ - affirmation    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Code Example: State-Based Handoff

```typescript
// Step 1: Discovery Chat - writes to state
const discoveryChatStep = createStep({
  id: "discovery-chat",
  stateSchema: workflowStateSchema, // Shared state
  execute: async ({ state, setState, suspend, resumeData }) => {
    const history = state.conversationHistory || [];

    if (resumeData?.userMessage) {
      history.push({ role: "user", content: resumeData.userMessage });
    }

    // ... generate response ...

    // WRITE to state (not memory!)
    setState({
      ...state,
      conversationHistory: history,
    });

    // Output goes to next step's input
    return { conversationHistory: history };
  }
});

// Step 2: Profile Builder - reads conversation, writes profile
const profileBuilderStep = createStep({
  id: "profile-builder",
  inputSchema: z.object({
    conversationHistory: conversationHistorySchema,
  }),
  outputSchema: z.object({
    profile: userProfileSchema,
  }),
  stateSchema: workflowStateSchema,
  execute: async ({ inputData, state, setState, mastra }) => {
    const agent = mastra.getAgent("profileExtractorAgent");

    // Use LLM to extract structured profile from raw conversation
    const response = await agent.generate(
      `Extract user preferences from this conversation:
       ${JSON.stringify(inputData.conversationHistory)}

       Return JSON with: themes, challenges, tone, insights`,
      { structuredOutput: { schema: userProfileSchema } }
    );

    const profile = response.object;

    // WRITE structured profile to state
    setState({
      ...state,
      userProfile: profile,
    });

    // Pass to Phase 2
    return { profile };
  }
});

// Step 3: Generation - reads profile, uses for generation
const generateStreamStep = createStep({
  id: "generate-stream",
  inputSchema: z.object({
    profile: userProfileSchema, // <-- Receives structured data from Step 2
  }),
  stateSchema: workflowStateSchema,
  execute: async ({ inputData, state, setState, mastra }) => {
    const agent = mastra.getAgent("affirmationAgent");

    // Generate using STRUCTURED profile, not raw chat
    const response = await agent.generate(
      buildPrompt({
        themes: inputData.profile.themes,
        tone: inputData.profile.tone,
        challenges: inputData.profile.challenges,
        // Plus swipe feedback from state
        approved: state.approvedAffirmations || [],
        skipped: state.skippedAffirmations || [],
      })
    );

    return { affirmation: response.text };
  }
});
```

### Key Insight: The Profile Builder Step

The crucial component is the **Profile Builder Step** that sits between phases:

1. **Input:** Raw conversation history (accumulated during chat)
2. **Processing:** LLM extracts structured insights
3. **Output:** Typed `UserProfile` object

This step transforms unstructured chat into structured data that Phase 2 can efficiently use. The generation agent never sees the raw conversation—it receives a clean, typed profile.

### When Would You Use Conversation Memory?

Conversation memory is appropriate when:
- A single agent needs to reference its own prior messages
- You want the LLM to have natural access to "what we discussed"
- The same agent handles both phases (not our case)

For CS-01, we have **separate agents for each phase**, so workflow state with explicit data transformation is cleaner.

### Storage Configuration

Both workflow state and conversation memory use the same underlying storage:

```typescript
// src/mastra/index.ts
export const mastra = new Mastra({
  agents: { ... },
  workflows: { chatSurveyWorkflow },
  storage: new LibSQLStore({ url: ':memory:' }), // Or file-based for persistence
});
```

For production, use file-based or external database storage to survive restarts.

---

## Client-Server State Management: The Critical Architecture Question

A key challenge: **Where does state actually live, and how do client and server stay synchronized?**

### Current Pattern in This Project: Client-Driven State

Looking at the existing AP-02 and FP-02 implementations, they use a **client-driven state** pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ localStorage / React State                                  ││
│  │ - savedAffirmations: string[]                               ││
│  │ - skippedAffirmations: string[]                             ││
│  │ - conversationHistory: Message[]                            ││
│  │ - currentIndex: number                                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Server Action Call
                              │ (passes state as parameters)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Next.js Action)                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ generateAP02({                                              ││
│  │   savedAffirmations,    // ← Client passes current state    ││
│  │   skippedAffirmations,  // ← Client passes current state    ││
│  │   totalSwipes,          // ← Client passes current state    ││
│  │   ...                                                       ││
│  │ })                                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Mastra Agent (STATELESS)                                    ││
│  │ - Receives full context in prompt                           ││
│  │ - Has no memory of previous calls                           ││
│  │ - Returns affirmations                                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight:** The existing agents are **stateless**. All state lives in the client (React + localStorage). The server action receives state as parameters and passes it to the agent via the prompt.

### How This Works in AP-02 Today

From [ap2-experience.tsx](../../../components/alt-process-2/ap2-experience.tsx):

```typescript
// State lives in React + localStorage
const { state, setState } = useLocalStorageState<AP2State>('ap02.state.v1', initialAP2State);

// Server action receives state as parameters
const fetchMore = async () => {
  const result = await generateAP02({
    savedAffirmations: state.savedAffirmations,    // Client passes state
    skippedAffirmations: state.skippedAffirmations, // Client passes state
    totalSwipes: state.totalSwipes,                 // Client passes state
    // ...
  });

  // Client updates its own state with response
  setState(prev => ({
    ...prev,
    affirmationQueue: [...prev.affirmationQueue, ...result.affirmations],
  }));
};
```

From [actions.ts](../../../app/alt-process-2/actions.ts):

```typescript
// Server action builds prompt from client-provided state
export async function generateAP02(options: AP02GenerateRequest) {
  // No server-side state - everything comes from `options`
  const userPrompt = buildPrompt({
    savedAffirmations: options.savedAffirmations,   // From client
    skippedAffirmations: options.skippedAffirmations, // From client
    // ...
  });

  // Agent is stateless - all context is in the prompt
  const result = await agent.generate(userPrompt);
  return parseResponse(result.text);
}
```

### The Workflow Alternative: Server-Driven State

Mastra workflows offer a different model where **state lives on the server**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Minimal State                                               ││
│  │ - runId: string (workflow instance identifier)             ││
│  │ - currentQuestion / currentAffirmation (from suspend)      ││
│  │ - UI-only state (loading, errors)                          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ resume({ runId, resumeData })
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Mastra Workflow)                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Workflow Snapshot Storage (LibSQL/Postgres/Upstash)        ││
│  │ - runId: "abc123"                                          ││
│  │ - status: "suspended"                                      ││
│  │ - state: {                                                 ││
│  │     conversationHistory: [...],                            ││
│  │     userProfile: {...},                                    ││
│  │     approvedAffirmations: [...],                           ││
│  │     skippedAffirmations: [...]                             ││
│  │   }                                                        ││
│  │ - suspendedAt: "discovery-chat"                            ││
│  │ - resumePayload: { question: "..." }                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Workflow Step (STATEFUL via snapshot)                      ││
│  │ - Reads state from snapshot                                ││
│  │ - Processes resumeData                                     ││
│  │ - Updates state                                            ││
│  │ - Either completes or suspends again                       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Snapshots: How Server State Persists

When a workflow suspends, Mastra automatically captures a **snapshot** containing:

- `runId` - Unique identifier for this workflow execution
- `status` - Current state (running, suspended, completed, failed)
- `context` - All step outputs, timestamps, and execution path
- `state` - The shared workflow state from `stateSchema`
- `suspendPayload` - Data provided to `suspend()`
- `resumePayload` - Expected data structure for resumption

The snapshot is stored in your configured storage provider:

```typescript
// Mastra configuration with storage
export const mastra = new Mastra({
  workflows: { chatSurveyWorkflow },
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL,
  }),
  // Or LibSQLStore, UpstashStore, etc.
});
```

### Comparison: Client-Driven vs. Server-Driven State

| Aspect | Client-Driven (Current AP-02) | Server-Driven (Workflow) |
|--------|------------------------------|--------------------------|
| **State Location** | localStorage + React | Mastra storage (DB) |
| **Persistence** | Browser-specific | Cross-device, cross-session |
| **State Transfer** | Client sends full state each call | Client sends only `runId` + user input |
| **Recovery** | Lost on browser clear | Survives indefinitely |
| **Complexity** | Simple, familiar React | Requires understanding workflows |
| **Multi-device** | No sync | Same `runId` works anywhere |
| **Server Load** | Stateless (scales easily) | Stateful (requires storage reads) |

### Recommended Approach for CS-01: Hybrid

For the chat-survey workflow, a **hybrid approach** may be optimal:

1. **Phase 1 (Chat):** Use workflow with suspend/resume
   - State persists on server (survives page refresh mid-conversation)
   - User can return to conversation later
   - Structured profile extraction happens server-side

2. **Phase 2 (Swipe):** Could use either approach:
   - **Option A:** Continue workflow (server state) - simpler, consistent
   - **Option B:** Hand off to client state (like AP-02) - proven pattern, familiar

### Implementation: Server Actions for Workflow Control

```typescript
// app/chat-survey/actions.ts
'use server';

import { mastra } from '@/src/mastra';

export interface WorkflowStartResult {
  runId: string;
  status: 'running' | 'suspended' | 'completed';
  suspendedData?: {
    step: string;
    question?: string;
    suggestedResponses?: string[];
  };
  result?: {
    affirmations: string[];
    profile: UserProfile;
  };
}

export async function startChatSurvey(userId: string): Promise<WorkflowStartResult> {
  const workflow = mastra.getWorkflow('chat-survey-workflow');
  const run = await workflow.createRunAsync();

  const result = await run.start({
    inputData: { userId, sessionId: crypto.randomUUID() },
    initialState: {
      conversationHistory: [],
      approvedAffirmations: [],
      skippedAffirmations: [],
    },
  });

  return {
    runId: run.runId,
    status: result.status,
    suspendedData: result.status === 'suspended' ? {
      step: result.suspended[0],
      ...result.suspendPayload,
    } : undefined,
  };
}

export async function resumeChatSurvey(
  runId: string,
  userMessage: string
): Promise<WorkflowStartResult> {
  const workflow = mastra.getWorkflow('chat-survey-workflow');

  // Retrieve existing run (loads snapshot from storage)
  const run = await workflow.resumeRun(runId);

  const result = await run.resume({
    step: 'discovery-chat', // Or dynamically from snapshot
    resumeData: { userMessage },
  });

  return {
    runId,
    status: result.status,
    suspendedData: result.status === 'suspended' ? {
      step: result.suspended[0],
      ...result.suspendPayload,
    } : undefined,
    result: result.status === 'completed' ? result.output : undefined,
  };
}

export async function swipeAffirmation(
  runId: string,
  action: 'approve' | 'skip',
  affirmation: string
): Promise<WorkflowStartResult> {
  const workflow = mastra.getWorkflow('chat-survey-workflow');
  const run = await workflow.resumeRun(runId);

  const result = await run.resume({
    step: 'generate-stream',
    resumeData: { action, affirmation },
  });

  return {
    runId,
    status: result.status,
    suspendedData: result.status === 'suspended' ? {
      step: result.suspended[0],
      affirmation: result.suspendPayload.affirmation,
    } : undefined,
  };
}
```

### Client Component: Minimal State

```typescript
// components/chat-survey/cs-experience.tsx
'use client';

import { useState, useEffect } from 'react';
import { startChatSurvey, resumeChatSurvey, swipeAffirmation } from '@/app/chat-survey/actions';

export function CSExperience() {
  // Minimal client state - just track the workflow run
  const [runId, setRunId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'chat' | 'swipe'>('chat');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentAffirmation, setCurrentAffirmation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Optionally persist runId to localStorage for recovery
  useEffect(() => {
    const saved = localStorage.getItem('cs-runId');
    if (saved) setRunId(saved);
  }, []);

  useEffect(() => {
    if (runId) localStorage.setItem('cs-runId', runId);
  }, [runId]);

  const handleStart = async () => {
    setIsLoading(true);
    const result = await startChatSurvey('user-123');
    setRunId(result.runId);

    if (result.status === 'suspended') {
      setCurrentQuestion(result.suspendedData?.question || '');
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!runId) return;
    setIsLoading(true);

    const result = await resumeChatSurvey(runId, message);

    if (result.status === 'suspended') {
      if (result.suspendedData?.step === 'generate-stream') {
        // Transitioned to Phase 2
        setPhase('swipe');
        setCurrentAffirmation(result.suspendedData.affirmation || '');
      } else {
        // Still in chat
        setCurrentQuestion(result.suspendedData?.question || '');
      }
    }
    setIsLoading(false);
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!runId) return;
    setIsLoading(true);

    const result = await swipeAffirmation(
      runId,
      direction === 'right' ? 'approve' : 'skip',
      currentAffirmation
    );

    if (result.status === 'suspended') {
      setCurrentAffirmation(result.suspendedData?.affirmation || '');
    }
    setIsLoading(false);
  };

  // Render chat or swipe UI based on phase
  return phase === 'chat'
    ? <ChatPhase question={currentQuestion} onSend={handleSendMessage} />
    : <SwipePhase affirmation={currentAffirmation} onSwipe={handleSwipe} />;
}
```

### Key Takeaway: State Flows Through Server Actions

The critical insight is:

1. **Client holds minimal state:** Just the `runId` and current display data
2. **Server holds all accumulated state:** Via workflow snapshots in storage
3. **Each interaction:** Client sends `runId` + user input → Server loads snapshot, processes, updates, returns new display data
4. **No state synchronization needed:** Server is the source of truth

This differs from the current AP-02 pattern where the client is the source of truth and must send the entire state to the server on each call.

---

## Serverless Deployment: State Persistence on Netlify

**Critical Issue:** The current project configuration will NOT support workflow state persistence on Netlify.

### The Problem: Ephemeral Filesystems

From the [Mastra Serverless Deployment docs](https://mastra.ai/en/docs/deployment/serverless-platforms):

> "LibSQLStore writes to the local filesystem, which is not supported in cloud environments that use ephemeral file systems."

The current Mastra configuration uses in-memory storage:

```typescript
// src/mastra/index.ts (CURRENT - WILL NOT WORK FOR WORKFLOWS ON NETLIFY)
export const mastra = new Mastra({
  agents: { ... },
  storage: new LibSQLStore({
    url: ':memory:',  // ❌ Lost between function invocations
  }),
});
```

**What happens on Netlify:**

1. User starts chat workflow → Netlify spins up function instance A
2. Workflow suspends, snapshot saved to `:memory:`
3. Function instance A terminates (serverless = ephemeral)
4. User sends next message → Netlify spins up function instance B
5. Instance B has no access to instance A's memory → **Snapshot lost, workflow broken**

### Why Current Agents Work (But Workflows Won't)

The existing agents (AP-02, FP-02, etc.) work on Netlify because they're **stateless**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT PATTERN (WORKS)                      │
│                                                                 │
│  Client State ──► Server Action ──► Stateless Agent ──► Result │
│  (localStorage)   (receives full    (no persistence   (returned │
│                    context as        needed)           to client)│
│                    parameters)                                  │
└─────────────────────────────────────────────────────────────────┘

Each function invocation is independent. No server-side state needed.
```

Workflows with suspend/resume require persistent storage:

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW PATTERN (BROKEN)                    │
│                                                                 │
│  Invocation 1: start() ──► suspend() ──► save to :memory: ──┐  │
│                                                              │  │
│  ❌ Function terminates, memory lost                         │  │
│                                                              │  │
│  Invocation 2: resume(runId) ──► load from :memory: ──► FAIL│  │
│                                    (nothing there!)             │
└─────────────────────────────────────────────────────────────────┘
```

### Solution: External Storage Providers

For Netlify (and any serverless platform), you must use an external storage provider:

| Provider | Package | Best For |
|----------|---------|----------|
| **Upstash Redis** | `@mastra/upstash` | Serverless (recommended) |
| **PostgreSQL** | `@mastra/pg` | Existing Supabase DB |
| **MongoDB** | `@mastra/mongodb` | Document stores |

### Option 1: Upstash (Serverless-Native)

[Upstash](https://upstash.com/) provides serverless Redis with per-request pricing:

```typescript
// src/mastra/index.ts (FOR NETLIFY/SERVERLESS)
import { Mastra } from '@mastra/core/mastra';
import { UpstashStore } from '@mastra/upstash';

export const mastra = new Mastra({
  agents: { ... },
  workflows: { chatSurveyWorkflow },
  storage: new UpstashStore({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  }),
});
```

**Pros:**
- Zero cold start (HTTP-based, not TCP)
- Pay-per-request pricing
- Global edge replication
- No connection pooling issues

**Cons:**
- Additional service to manage
- Costs scale with usage

### Option 2: PostgreSQL via Supabase (Recommended for This Project)

Since this project already uses Supabase, this is the simplest path to enabling workflows on Netlify:

```typescript
// src/mastra/index.ts (USING EXISTING SUPABASE)
import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';

export const mastra = new Mastra({
  agents: { ... },
  workflows: { chatSurveyWorkflow },
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
});
```

**How it works on Netlify:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     NETLIFY FUNCTIONS                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │ Function A    │  │ Function B    │  │ Function C    │        │
│  │ (ephemeral)   │  │ (ephemeral)   │  │ (ephemeral)   │        │
│  │               │  │               │  │               │        │
│  │ start()       │  │ resume()      │  │ resume()      │        │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘        │
│          │                  │                  │                │
└──────────┼──────────────────┼──────────────────┼────────────────┘
           │                  │                  │
           │ save snapshot    │ load snapshot    │ load snapshot
           │                  │ save snapshot    │ save snapshot
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE POSTGRESQL                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ mastra_workflow_snapshots table                             ││
│  │ ┌─────────────────────────────────────────────────────────┐ ││
│  │ │ runId: "abc123"                                         │ ││
│  │ │ status: "suspended"                                     │ ││
│  │ │ currentStep: "discovery-chat"                           │ ││
│  │ │ state: { conversationHistory, userProfile, ... }        │ ││
│  │ │ suspendPayload: { question: "What challenges..." }      │ ││
│  │ └─────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Each Netlify function invocation:**
1. Receives `runId` from client
2. Loads workflow snapshot from Supabase
3. Processes user input
4. Updates workflow state
5. Saves new snapshot to Supabase
6. Returns suspend payload to client
7. Function terminates (state is safe in DB)

**Pros:**
- Reuses existing Supabase database
- No additional service to configure
- SQL-queryable workflow data (can inspect/debug via Drizzle Studio)
- Already have `DATABASE_URL` configured
- Single source of truth for all app data

**Cons:**
- Connection pooling needed for serverless (use `?pgbouncer=true` in connection string)
- Slightly higher latency than Redis (~10-20ms vs ~5ms)
- Postgres connection overhead per request

**Required Package:**

```bash
npm install @mastra/pg
```

**Connection String for Netlify:**

Supabase provides a pooled connection URL specifically for serverless:

```bash
# In Netlify environment variables
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

The `?pgbouncer=true` is critical - it uses Supabase's connection pooler instead of direct connections, which is required for serverless where each function invocation would otherwise create a new connection.

### Option 3: Hybrid Dev/Prod Storage

For convenience during development, use different storage per environment:

```typescript
// src/mastra/index.ts (HYBRID DEV/PROD)
import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import { PostgresStore } from '@mastra/pg';

const getStorage = () => {
  // Local development: use file-based LibSQL (fast, no external deps)
  if (process.env.NODE_ENV === 'development') {
    return new LibSQLStore({
      url: 'file:./mastra-dev.db',
    });
  }

  // Production (Netlify): use Supabase PostgreSQL
  return new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  });
};

export const mastra = new Mastra({
  agents: { ... },
  workflows: { chatSurveyWorkflow },
  storage: getStorage(),
});
```

This gives you:
- **Local dev:** Fast file-based storage, no network calls, works offline
- **Production:** Durable PostgreSQL via existing Supabase, works across serverless invocations

### What Gets Stored

From [Mastra Storage docs](https://mastra.ai/en/docs/storage/overview), the storage layer persists:

| Data Type | Purpose |
|-----------|---------|
| **Workflow Snapshots** | Suspended workflow state (runId, step outputs, stateSchema data) |
| **Memory Threads** | Conversation history for agents with memory |
| **Traces** | OpenTelemetry observability data |
| **Eval Datasets** | Evaluation run scores |

For CS-01 workflows, the critical data is **workflow snapshots** containing:
- `conversationHistory` from Phase 1
- `userProfile` extracted by Profile Builder
- `approvedAffirmations` / `skippedAffirmations` from Phase 2

### Environment Variables for Netlify

Add to Netlify environment variables:

```bash
# Option 1: Upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Option 2: Supabase (already configured)
DATABASE_URL=postgresql://...?pgbouncer=true
```

### Migration Path

1. **Phase 1:** Keep current agents stateless (works on Netlify today)
2. **Phase 2:** Add Upstash or PostgresStore before implementing CS-01 workflow
3. **Phase 3:** Implement workflow with suspend/resume (now persists correctly)

### Key Insight: Client-Driven State Still Works

If you want to avoid external storage complexity, the **client-driven state pattern** (like AP-02) works fine on Netlify:

```typescript
// Client sends full state on each call
const result = await generateCS01({
  conversationHistory: state.conversationHistory,  // Client owns this
  userProfile: state.userProfile,                   // Client owns this
  savedAffirmations: state.savedAffirmations,       // Client owns this
  skippedAffirmations: state.skippedAffirmations,   // Client owns this
});
```

This is effectively "stateless serverless" - the server action receives all context it needs and returns results. No workflow snapshots needed, no external storage required.

**Trade-off:** You lose the benefits of server-driven state (cross-device sync, guaranteed persistence, smaller payloads), but deployment is simpler.

---

## Architectural Comparison: Client-Driven vs. Workflow vs. Mastra Memory

This section clarifies the **fundamental architectural differences** between the three approaches - they differ in more than just where state is stored.

### The Three Patterns

| Pattern | State Owner | Execution Model | Phase Awareness |
|---------|-------------|-----------------|-----------------|
| **Client-Driven** | Client (React/localStorage) | Stateless server calls | None (client decides) |
| **Mastra Workflow** | Server (workflow snapshots) | Orchestrated steps with suspend/resume | Built-in step sequencing |
| **Mastra Memory** | Server (memory threads) | Single agent with conversation history | None (agent infers) |

### Pattern 1: Client-Driven State (Current AP-02 Pattern)

**Architecture:** Client owns all state, server is a pure function.

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ React State + localStorage                                  │ │
│ │ - phase: 'chat' | 'swipe'                                   │ │
│ │ - conversationHistory: Message[]                            │ │
│ │ - userProfile: UserProfile | null                           │ │
│ │ - approvedAffirmations: string[]                            │ │
│ │ - skippedAffirmations: string[]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ Passes ALL state on each call    │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVER (Stateless)                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ async function generateNext(fullState) {                    │ │
│ │   // No memory of previous calls                            │ │
│ │   // All context comes from parameters                      │ │
│ │   const prompt = buildPrompt(fullState);                    │ │
│ │   const result = await agent.generate(prompt);              │ │
│ │   return result;  // Client updates its own state           │ │
│ │ }                                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Execution Flow:**
1. Client decides when to transition phases (based on its own logic)
2. Client sends entire accumulated state to server on each call
3. Server action builds prompt from received state
4. Agent generates (no memory, no awareness of prior calls)
5. Server returns result, client updates its state

**Key Characteristics:**
- **No server-side orchestration** - client controls all flow
- **Stateless scaling** - any server instance can handle any request
- **Large payloads** - state grows with conversation length
- **Browser-bound** - state lost if user clears localStorage

### Pattern 2: Mastra Workflow with Suspend/Resume

**Architecture:** Server owns state and orchestrates execution flow.

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (Thin)                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Minimal React State                                         │ │
│ │ - runId: string                                             │ │
│ │ - currentDisplay: { question?: string, affirmation?: string }│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ Sends only runId + user input    │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVER (Stateful Workflow)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Workflow Engine                                             │ │
│ │ ┌─────────────┐   ┌─────────────┐   ┌─────────────┐         │ │
│ │ │ Step 1:     │──►│ Step 2:     │──►│ Step 3:     │         │ │
│ │ │ Discovery   │   │ Profile     │   │ Generate    │         │ │
│ │ │ Chat        │   │ Builder     │   │ Stream      │         │ │
│ │ │ (suspends)  │   │ (auto)      │   │ (suspends)  │         │ │
│ │ └─────────────┘   └─────────────┘   └─────────────┘         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Workflow Snapshot (PostgreSQL)                              │ │
│ │ - runId, status, currentStep                                │ │
│ │ - stateSchema: { conversationHistory, userProfile, ... }    │ │
│ │ - suspendPayload, resumePayload                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Execution Flow:**
1. Client calls `start()` → Workflow begins at Step 1
2. Step 1 runs, suspends, workflow saves snapshot to DB
3. Client receives suspend payload (question to display)
4. User responds → Client calls `resume(runId, userInput)`
5. Workflow loads snapshot, continues from suspension point
6. Step 1 completes → Step 2 runs automatically (no user input needed)
7. Step 3 begins, suspends with affirmation
8. ...repeat resume/suspend cycle

**Key Characteristics:**
- **Server orchestrates flow** - step sequencing is defined in workflow
- **Typed step boundaries** - Zod schemas validate data between steps
- **Small payloads** - client sends only `runId` + current input
- **Cross-device** - resume from any device with same `runId`
- **Durable** - survives server restarts, deployments

### Pattern 3: Mastra Memory (Single Agent with Thread)

**Architecture:** Single agent maintains conversation memory, infers phases.

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ React State                                                 │ │
│ │ - threadId: string                                          │ │
│ │ - phase: 'chat' | 'swipe' (client infers from response)     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ Sends threadId + current message │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ SERVER (Agent with Memory)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Single Agent                                                │ │
│ │ - Has access to full conversation history via threadId      │ │
│ │ - System prompt instructs: "First discover needs, then..."  │ │
│ │ - Agent decides when to transition phases                   │ │
│ │ - No explicit step boundaries                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Memory Thread (PostgreSQL)                                  │ │
│ │ - threadId: "abc123"                                        │ │
│ │ - messages: [                                               │ │
│ │     { role: "assistant", content: "What brings you..." },   │ │
│ │     { role: "user", content: "I struggle with..." },        │ │
│ │     { role: "assistant", content: "Here's an affirmation..."}│ │
│ │   ]                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Execution Flow:**
1. Client calls agent with `threadId` + message
2. Agent loads conversation history from memory
3. Agent sees full context, generates response
4. Memory automatically appends new messages
5. Client interprets response to determine UI state

**Key Characteristics:**
- **Agent controls flow** - phases are implicit in conversation
- **Unstructured state** - memory stores raw messages, not typed data
- **Natural conversation** - agent has full context for coherent dialogue
- **No explicit handoff** - agent must infer when to switch behaviors
- **Context window risk** - long conversations consume tokens

### Architectural Comparison Table

| Dimension | Client-Driven | Workflow | Memory |
|-----------|---------------|----------|--------|
| **Who decides phase transitions?** | Client code | Workflow step graph | Agent (via prompt) |
| **State structure** | Client-defined types | Zod schemas | Raw message array |
| **Data extraction** | Client parses responses | Dedicated step | Agent must extract inline |
| **Payload size** | Grows with state | Fixed (runId + input) | Fixed (threadId + input) |
| **Server storage** | None | Snapshots (structured) | Threads (messages) |
| **Multi-agent** | Manual coordination | Steps can use different agents | Single agent |
| **Testability** | Unit test client logic | Test each step in isolation | Test agent behavior |
| **Error recovery** | Client must handle | Workflow can retry steps | Conversation continues |

### When to Use Each Pattern

**Use Client-Driven when:**
- Simple request/response pattern
- No need for cross-device persistence
- You want full control in React
- Avoiding external storage complexity
- Stateless scaling is priority

**Use Workflow when:**
- Multiple distinct phases with different logic
- Need structured data handoff between phases
- Want server to orchestrate the flow
- Require durable persistence
- Different agents/tools per phase

**Use Memory when:**
- Single conversational agent
- Natural dialogue is priority
- Phases are fluid, not discrete
- Agent should "remember" context
- Simpler than workflow, more persistent than client

### For CS-01: Why Workflow is Recommended

The chat-survey use case has characteristics that favor the workflow pattern:

1. **Distinct phases** - Discovery (chat) and Generation (swipe) have different UX patterns
2. **Structured handoff** - Need to extract typed `UserProfile` from conversation
3. **Different agents** - Discovery agent asks questions, Generation agent creates affirmations
4. **Swipe feedback** - Accumulates as structured data, not conversation messages
5. **Phase transition** - Clear point where "interview is done, now generating"

Memory would work for Phase 1 alone, but struggles with Phase 2's swipe mechanics (not conversational). Client-driven would work but loses persistence benefits.

### Hybrid Possibility: Memory for Chat, Client for Swipe

A middle-ground architecture:

```typescript
// Phase 1: Use memory-enabled agent for discovery
const discoveryAgent = new Agent({
  name: 'DiscoveryAgent',
  instructions: '...',
  model: getModel(),
});

// Server action maintains thread
export async function chat(threadId: string, message: string) {
  return discoveryAgent.generate(message, {
    memory: { threadId, resourceId: 'discovery' },
  });
}

// When discovery completes, extract profile and hand off to client
export async function completeDiscovery(threadId: string) {
  const messages = await mastra.getStorage().getMessages({ threadId });
  const profile = await extractProfile(messages); // LLM extraction
  return profile; // Client takes over from here
}

// Phase 2: Client-driven (like AP-02)
// Client stores profile + swipe feedback in localStorage
// Stateless generation calls
```

This gets memory benefits for the conversational phase without needing full workflow complexity, while keeping the proven client-driven pattern for swipes.

---

## Alternative Approaches Considered

### Approach A: Pure Workflow (Recommended)

Use Mastra workflows with suspend/resume for the entire flow.

**Pros:**
- Clean state management across phases
- Built-in persistence (survives page refresh)
- Type-safe data flow between steps
- Native support for human-in-the-loop patterns

**Cons:**
- Requires understanding workflow concepts
- More boilerplate than simple agent calls

### Approach B: Agent with Thread Memory

Use a single agent with conversation memory to maintain state.

**Pros:**
- Simpler implementation
- Natural conversation flow

**Cons:**
- Less structured data extraction
- Harder to separate phases cleanly
- No built-in persistence for swipe feedback

### Approach C: Hybrid Agent + State Machine

Use agents for generation but manage phase transitions in React state.

**Pros:**
- Familiar React patterns
- Flexible UI control

**Cons:**
- State management complexity
- No server-side persistence
- Risk of client/server state divergence

**Recommendation:** Approach A (Pure Workflow) provides the cleanest architecture for this use case, with built-in support for multi-turn conversations and human-in-the-loop patterns.

---

## UI/UX Considerations

### Phase 1: Chat Interface

- Clean, focused chat UI
- Show agent's questions prominently
- Quick-reply buttons for common responses
- Progress indicator ("Getting to know you...")
- "Skip to affirmations" option for impatient users

### Phase Transition

- Visual celebration of completing discovery
- Preview of extracted themes/insights
- "Personalized affirmations incoming..."

### Phase 2: Swipe Interface

- Familiar swipe mechanics (like AP-02)
- Visual indicator showing Phase 1 context is being used
- "Based on your conversation" badge on first few cards
- Stats showing approval/skip patterns
- Option to return to chat for refinement

---

## Next Steps

1. **Finalize workflow architecture** - Decide on exact step boundaries
2. **Design discovery agent prompts** - What questions to ask, how to conclude
3. **Design generation agent prompts** - How to incorporate chat insights + swipe feedback
4. **Implement workflow skeleton** - Basic workflow with placeholder steps
5. **Implement Phase 1 UI** - Chat interface with suspend/resume
6. **Implement Phase 2 UI** - Adapt AP-02 swipe components
7. **Connect UI to workflow** - Server actions for start/resume
8. **Testing and refinement** - End-to-end flow testing

---

## References

### Mastra Documentation

- [Workflows Overview](https://mastra.ai/docs/workflows/overview)
- [Workflow Steps](https://mastra.ai/docs/workflows/steps)
- [Control Flow](https://mastra.ai/docs/workflows/control-flow)
- [Suspend and Resume](https://mastra.ai/docs/workflows/suspend-and-resume)
- [Using Agents in Workflows](https://mastra.ai/docs/workflows/using-with-agents-and-tools)
- [Agents Overview](https://mastra.ai/docs/agents/overview)

### Project Files

- [README.mastra.md](../../readmes/README.mastra.md) - Project Mastra documentation
- [AP-02 Spec](../2025-12-18-fresh-take-b/2025-12-18-ap-02-spec.md) - Swipe UI reference
- [Mastra Index](../../../src/mastra/index.ts) - Mastra instance configuration
- [AP-02 Experience](../../../components/alt-process-2/ap2-experience.tsx) - Swipe UI implementation

### Installed Package Versions

```json
{
  "@mastra/core": "^0.24.6",
  "@mastra/libsql": "^0.16.3",
  "@mastra/loggers": "^0.10.19",
  "@mastra/memory": "^0.15.12",
  "mastra": "^0.18.6"
}
```

---

## Implementation Decision

**Date:** 2025-12-24
**Status:** Approved

### Chosen Architecture: Mastra Workflow with PostgreSQL Storage

After evaluating the three architectural patterns (Client-Driven, Workflow, Memory), the decision is to implement CS-01 using:

- **Execution Model:** Mastra Workflow with suspend/resume
- **Storage Backend:** PostgreSQL via Supabase
- **Deployment Target:** Netlify Functions (serverless)

### Why This Choice

1. **Workflow pattern** provides clean phase separation between Discovery Chat and Affirmation Generation
2. **Server-driven state** ensures durability across page refreshes and enables cross-device resume
3. **Typed step boundaries** via Zod schemas ensure reliable data handoff between phases
4. **PostgreSQL/Supabase** reuses existing infrastructure patterns from this project

### Supabase Configuration

A **new Supabase project instance** will be provisioned for CS-01 workflow storage. This follows the same configuration pattern as the current aiffirmation-proto project but with separate credentials.

**Connection Pattern (same as current project):**

```bash
# Pooled connection for serverless (Netlify Functions)
# Uses pgbouncer on port 6543
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection for migrations (Drizzle)
# Uses direct port 5432
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Key Configuration Notes:**
- `?pgbouncer=true` is required for serverless connection pooling
- Port `6543` for pooled connections (runtime)
- Port `5432` for direct connections (migrations only)
- Host pattern: `aws-0-[region].pooler.supabase.com` (varies by region)

### Required Package Installation

```bash
npm install @mastra/pg
```

### Mastra Configuration Change

Update `src/mastra/index.ts` to use PostgreSQL storage:

```typescript
import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';
import { PinoLogger } from '@mastra/loggers';

// Import workflow (to be created)
import { chatSurveyWorkflow } from './workflows/chat-survey';

export const mastra = new Mastra({
  agents: { /* existing agents */ },
  workflows: { chatSurveyWorkflow },
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    enabled: false,
  },
});
```

### Environment Variables

Add to `.env.local` (development) and Netlify environment variables (production):

```bash
# New Supabase instance for CS-01 workflows
# (Different values from existing project Supabase)
CS01_DATABASE_URL=postgresql://postgres.[new-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
CS01_DIRECT_URL=postgresql://postgres.[new-project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Note:** The exact environment variable names may be adjusted during implementation. The key point is that CS-01's Mastra storage will use a separate Supabase instance from the main application database.

### Implementation Phases

1. **Phase 1: Infrastructure Setup**
   - Provision new Supabase project
   - Install `@mastra/pg`
   - Update Mastra configuration to use PostgresStore
   - Verify storage works locally

2. **Phase 2: Workflow Implementation**
   - Create workflow skeleton with typed schemas
   - Implement Discovery Chat step with suspend/resume
   - Implement Profile Builder step
   - Implement Generation Stream step

3. **Phase 3: UI Implementation**
   - Chat interface for Phase 1
   - Swipe interface for Phase 2 (adapt from AP-02)
   - Server actions for workflow control

4. **Phase 4: Deployment**
   - Configure Netlify environment variables
   - Test end-to-end on Netlify
   - Verify workflow persistence across function invocations
