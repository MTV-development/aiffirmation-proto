# Quickstart: Chat-Survey Agent (CS-01)

**Branch**: `001-chat-survey` | **Date**: 2025-12-24

This guide provides the minimal steps to get CS-01 running locally.

---

## Prerequisites

- Node.js 20+
- npm 10+
- Existing aiffirmation-proto project setup working
- Supabase project configured (existing `DATABASE_URL`)

---

## Step 1: Install New Dependency

```bash
npm install @mastra/pg
```

This adds PostgreSQL storage support for Mastra workflows.

---

## Step 2: Update Mastra Configuration

Edit `src/mastra/index.ts` to use PostgresStore:

```typescript
import { Mastra } from '@mastra/core/mastra';
import { PostgresStore } from '@mastra/pg';
import { PinoLogger } from '@mastra/loggers';

// Import workflow (after creating it)
import { chatSurveyWorkflow } from './workflows/chat-survey';

// ... existing agent imports ...

export const mastra = new Mastra({
  agents: {
    weatherAgent,
    af1Agent,
    goodTenAgent,
    fullProcessAgent,
    fullProcess2Agent,
    fullProcess3Agent,
    // CS-01 agents will be added here
  },
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

---

## Step 3: Create Workflow Directory Structure

```bash
# Create directories
mkdir -p src/mastra/workflows/chat-survey/steps
mkdir -p src/mastra/agents/chat-survey
mkdir -p app/chat-survey/components
```

---

## Step 4: Create Types File

Create `src/mastra/workflows/chat-survey/types.ts`:

```typescript
import { z } from 'zod';

export const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export const tonePreferenceSchema = z.enum([
  'gentle',
  'assertive',
  'balanced',
  'spiritual'
]);

export const userProfileSchema = z.object({
  themes: z.array(z.string()).min(1),
  challenges: z.array(z.string()),
  tone: tonePreferenceSchema,
  insights: z.array(z.string()),
  conversationSummary: z.string(),
});

export const workflowStateSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema).optional(),
  userProfile: userProfileSchema.optional(),
  approvedAffirmations: z.array(z.string()).optional(),
  skippedAffirmations: z.array(z.string()).optional(),
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type TonePreference = z.infer<typeof tonePreferenceSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type WorkflowState = z.infer<typeof workflowStateSchema>;
```

---

## Step 5: Create Minimal Workflow

Create `src/mastra/workflows/chat-survey/index.ts`:

```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  workflowStateSchema,
  userProfileSchema,
  conversationMessageSchema
} from './types';

// Placeholder step - implement fully later
const discoveryChatStep = createStep({
  id: 'discovery-chat',
  inputSchema: z.object({}),
  outputSchema: z.object({
    conversationHistory: z.array(conversationMessageSchema),
  }),
  suspendSchema: z.object({
    assistantMessage: z.string(),
    turnNumber: z.number(),
  }),
  resumeSchema: z.object({
    userMessage: z.string(),
  }),
  execute: async ({ suspend }) => {
    // Placeholder - suspends immediately
    await suspend({
      assistantMessage: 'Welcome! What brings you here today?',
      turnNumber: 1,
    });
    return { conversationHistory: [] };
  },
});

export const chatSurveyWorkflow = createWorkflow({
  id: 'chat-survey-workflow',
  inputSchema: z.object({}),
  outputSchema: z.object({
    profile: userProfileSchema.optional(),
  }),
  stateSchema: workflowStateSchema,
})
  .then(discoveryChatStep)
  .commit();
```

---

## Step 6: Create Basic Server Action

Create `app/chat-survey/actions.ts`:

```typescript
'use server';

import { mastra } from '@/src/mastra';

export interface WorkflowStartResult {
  runId: string;
  status: string;
  suspendedData?: {
    step: string;
    assistantMessage?: string;
    turnNumber?: number;
  };
  error?: string;
}

export async function startChatSurvey(): Promise<WorkflowStartResult> {
  try {
    const workflow = mastra.getWorkflow('chat-survey-workflow');
    const run = await workflow.createRunAsync();

    const result = await run.start({
      inputData: {},
    });

    return {
      runId: run.runId,
      status: result.status,
      suspendedData: result.status === 'suspended' ? {
        step: result.suspended[0],
        ...result.suspendPayload,
      } : undefined,
    };
  } catch (error) {
    return {
      runId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## Step 7: Create Basic Page

Create `app/chat-survey/page.tsx`:

```typescript
import { CSExperience } from './components/cs-experience';

export default function ChatSurveyPage() {
  return <CSExperience />;
}
```

Create `app/chat-survey/components/cs-experience.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { startChatSurvey } from '../actions';

export function CSExperience() {
  const [message, setMessage] = useState('Click Start to begin');
  const [runId, setRunId] = useState<string | null>(null);

  const handleStart = async () => {
    setMessage('Starting...');
    const result = await startChatSurvey();

    if (result.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setRunId(result.runId);
      setMessage(result.suspendedData?.assistantMessage || 'Ready');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chat Survey (CS-01)</h1>
      <p className="mb-4">{message}</p>
      {runId && <p className="text-sm text-gray-500">Run ID: {runId}</p>}
      <button
        onClick={handleStart}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Start New Session
      </button>
    </div>
  );
}
```

---

## Step 8: Add Route to Navigation

Edit `nav.config.ts` to add the new route:

```typescript
{
  label: 'Chat Survey',
  href: '/chat-survey',
  submenu: [
    { label: 'Experience', href: '/chat-survey' },
    { label: 'Info', href: '/chat-survey/info' },
  ],
},
```

---

## Step 9: Verify Setup

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/chat-survey
# Click "Start New Session"
# Should see welcome message from workflow
```

---

## Verification Checklist

- [ ] `@mastra/pg` installed
- [ ] Mastra config uses PostgresStore
- [ ] Workflow types defined
- [ ] Basic workflow created and registered
- [ ] Server action works
- [ ] Page loads and starts session
- [ ] Navigation shows new route

---

## Next Steps

After quickstart verification:

1. Implement full discovery-chat step with multi-turn logic
2. Implement profile-builder step
3. Implement generate-stream step
4. Build chat phase UI
5. Adapt swipe phase UI from AP-02
6. Add session resumption logic
7. Configure KV store prompts

---

## Troubleshooting

**"Workflow not found" error**:
- Ensure workflow is exported from `src/mastra/workflows/chat-survey/index.ts`
- Ensure workflow is registered in `src/mastra/index.ts`

**Database connection error**:
- Verify `DATABASE_URL` in `.env.local`
- Ensure Supabase project is running
- Check connection string has `?pgbouncer=true` for serverless

**TypeScript errors**:
- Run `npm run lint` to check for issues
- Ensure Zod schemas match expected types
