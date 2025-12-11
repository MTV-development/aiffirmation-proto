# Plan: Good Ten v2 - Mastra Agent with Server Actions

**Date**: 2025-12-11
**Status**: Planning
**Goal**: Create a new "Good Ten v2" agent that demonstrates Mastra agents running server-side via Next.js Server Actions

## Overview

This is a **proof-of-concept** implementation to demonstrate the Server Actions pattern before potentially migrating all agents. The existing Good Ten (gt-01) will remain unchanged with its direct OpenRouter integration.

## Architecture Comparison

### Current: Good Ten (gt-01) - Direct OpenRouter

```
┌─────────────────────┐     fetch()      ┌─────────────────────┐
│  Client Component   │ ───────────────> │   OpenRouter API    │
│  ('use client')     │ <─────────────── │   (direct call)     │
│  page.tsx           │                  │                     │
└─────────────────────┘                  └─────────────────────┘
        │
        │ imports
        ▼
┌─────────────────────┐
│  lib/agents/        │
│  - openrouter-client│  ← NEXT_PUBLIC_OPENROUTER_API_KEY (exposed)
│  - template-engine  │  ← Fetches from Supabase client-side
└─────────────────────┘
```

### New: Good Ten v2 (gt-02) - Server Actions + Mastra

```
┌─────────────────────┐   Server Action   ┌─────────────────────┐
│  Client Component   │ ────────────────> │  actions.ts         │
│  ('use client')     │ <──────────────── │  ('use server')     │
│  page.tsx           │   JSON Response   │                     │
└─────────────────────┘                   └──────────┬──────────┘
                                                     │
                                                     │ calls
                                                     ▼
                                          ┌─────────────────────┐
                                          │  Mastra Agent       │
                                          │  agent.generate()   │
                                          │                     │
                                          │  - OPENROUTER_API_KEY (server-only)
                                          │  - KV via Drizzle (server-side)
                                          │  - Temperature control
                                          │  - Tracing/observability
                                          └─────────────────────┘
```

## Benefits of Server Actions Pattern

1. **Security**: API key stays server-side (`OPENROUTER_API_KEY` not `NEXT_PUBLIC_*`)
2. **Mastra Features**: Full access to memory, tools, tracing, temperature control
3. **Consistency**: Same agent code works in UI and Mastra Studio
4. **Simplicity**: No separate API route files needed
5. **Type Safety**: Automatic serialization with TypeScript types

## Implementation Plan

### Phase 1: Setup (New Agent Infrastructure)

| Task | File | Description |
|------|------|-------------|
| T01 | `src/db/seed.ts` | Add gt-02 KV entries (copy from gt-01 with version change) |
| T02 | `src/mastra/agents/ag-good-ten-v2/agent.ts` | Create Mastra agent definition |
| T03 | `src/mastra/agents/ag-good-ten-v2/index.ts` | Create barrel export |
| T04 | `src/mastra/index.ts` | Register goodTenV2Agent with Mastra instance |

### Phase 2: Server Action

| Task | File | Description |
|------|------|-------------|
| T05 | `app/ag-good-ten-v2/actions.ts` | Create server action for generation |

### Phase 3: UI (Copy from Good Ten)

| Task | File | Description |
|------|------|-------------|
| T06 | `src/ag-good-ten-v2/index.ts` | Create feature module (reuse themes from gt-01) |
| T07 | `src/ag-good-ten-v2/implementation-context.tsx` | Create implementation context |
| T08 | `src/ag-good-ten-v2/implementation-selector.tsx` | Create implementation selector |
| T09 | `app/ag-good-ten-v2/layout.tsx` | Create layout with implementation provider |
| T10 | `app/ag-good-ten-v2/good-ten-v2-layout-client.tsx` | Create client layout wrapper |
| T11 | `app/ag-good-ten-v2/page.tsx` | Create demo page (calls server action) |
| T12 | `app/ag-good-ten-v2/info/page.tsx` | Create info page |
| T13 | `nav.config.ts` | Add "Good Ten v2" navigation entry |

### Phase 4: Verification

| Task | Description |
|------|-------------|
| T14 | Run `npm run db:seed` to add gt-02 entries |
| T15 | Test generation via UI at `/ag-good-ten-v2` |
| T16 | Verify agent works in Mastra Studio (`npx mastra dev`) |
| T17 | Compare output quality with gt-01 |

## File Details

### T01: KV Store Seed Entries (`src/db/seed.ts`)

Add these entries (copy of gt-01 with `gt-02` version):

```typescript
// GT-02: Good Ten v2 - Server Actions Demo
{
  key: 'versions.gt-02._info.default',
  value: {
    name: 'Default',
    text: `Good Ten v2 - Demonstrates Mastra agents with Next.js Server Actions.
Same affirmation quality as gt-01, but runs server-side with full Mastra features.`,
    author: 'System',
    createdAt: '2025-12-11',
  },
},
{
  key: 'versions.gt-02._model_name.default',
  value: {
    text: 'openai/gpt-4o-mini',
  },
},
{
  key: 'versions.gt-02._temperature.default',
  value: {
    text: '0.8',
  },
},
{
  key: 'versions.gt-02.system.default',
  value: {
    text: `[Same as gt-01.system.default]`,
  },
},
{
  key: 'versions.gt-02.prompt.default',
  value: {
    text: `[Same as gt-01.prompt.default]`,
  },
},
```

### T02: Mastra Agent (`src/mastra/agents/ag-good-ten-v2/agent.ts`)

```typescript
import { Agent } from '@mastra/core/agent';
import { getAgentSystemPrompt, getModel } from '@/src/services';

const DEFAULT_INSTRUCTIONS = `[Same as gt-01]`;

// Static agent for Mastra registration
export const goodTenV2Agent = new Agent({
  name: 'Good-Ten-v2',
  instructions: DEFAULT_INSTRUCTIONS,
  model: getModel(),
});

/**
 * Create a Good Ten v2 agent with system prompt from KV store
 */
export async function createGoodTenV2Agent(implementation: string = 'default'): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt('gt-02', implementation);

  return new Agent({
    name: 'Good-Ten-v2',
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: getModel(),
  });
}
```

### T05: Server Action (`app/ag-good-ten-v2/actions.ts`)

```typescript
'use server';

import { createGoodTenV2Agent } from '@/src/mastra/agents/ag-good-ten-v2';
import { renderTemplate, getAgentModelName } from '@/src/services';
import { getKVText } from '@/src/services/kv-store';

type GenerateOptions = {
  themes: string[];
  additionalContext?: string;
  implementation?: string;
};

type GenerateResult = {
  affirmations: string;
  model: string;
};

export async function generateAffirmationsV2(options: GenerateOptions): Promise<GenerateResult> {
  const { themes, additionalContext, implementation = 'default' } = options;

  if (!themes || themes.length === 0) {
    throw new Error('At least one theme is required');
  }

  // Build template variables
  const templateVariables = {
    themes,
    themeCount: themes.length,
    additionalContext: additionalContext?.trim() || null,
  };

  // Render user prompt from KV store
  const { output: userPrompt } = await renderTemplate({
    key: 'prompt',
    version: 'gt-02',
    implementation,
    variables: templateVariables,
  });

  // Get temperature from KV store (with fallback)
  const temperatureStr = await getKVText('gt-02', '_temperature', implementation);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.8;

  // Create agent with KV-configured system prompt
  const agent = await createGoodTenV2Agent(implementation);

  // Get model name for response
  const modelName = await getAgentModelName('gt-02', implementation);

  console.log('[gt-02] Implementation:', implementation);
  console.log('[gt-02] Model:', modelName || 'env default');
  console.log('[gt-02] Temperature:', temperature);
  console.log('[gt-02] User prompt:', userPrompt);

  // Generate with Mastra agent
  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  console.log('[gt-02] Response:', result.text);

  return {
    affirmations: result.text,
    model: modelName || 'default',
  };
}
```

### T11: Page (`app/ag-good-ten-v2/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { affirmationThemes } from '@/src/ag-good-ten'; // Reuse themes
import { useImplementation } from '@/src/ag-good-ten-v2';
import { generateAffirmationsV2 } from './actions';

export default function GoodTenV2Page() {
  const { implementation } = useImplementation();
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [affirmations, setAffirmations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ... same UI as gt-01, but calls generateAffirmationsV2 server action

  const handleSubmit = async () => {
    if (selectedThemes.length === 0) return;

    setIsLoading(true);
    setError(null);
    setAffirmations(null);

    try {
      const result = await generateAffirmationsV2({
        themes: selectedThemes.map(
          (id) => affirmationThemes.find((t) => t.id === id)?.label ?? id
        ),
        additionalContext,
        implementation,
      });

      setAffirmations(result.affirmations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component (copy from gt-01)
}
```

### T13: Navigation (`nav.config.ts`)

```typescript
{
  label: "Good Ten v2",
  href: "/ag-good-ten-v2",
  children: [
    { label: "Demo", href: "/ag-good-ten-v2" },
    { label: "Info", href: "/ag-good-ten-v2/info" },
  ],
},
```

## Key Differences from gt-01

| Aspect | gt-01 (Current) | gt-02 (New) |
|--------|-----------------|-------------|
| API Key | `NEXT_PUBLIC_OPENROUTER_API_KEY` | `OPENROUTER_API_KEY` |
| Execution | Client-side browser | Server-side Node.js |
| KV Access | Supabase client (`lib/kv/`) | Drizzle server (`src/services/`) |
| Agent | Direct OpenRouter fetch | Mastra `agent.generate()` |
| Temperature | Not configurable | KV-configurable |
| Tracing | Console logs only | Mastra observability |
| Mastra Studio | Not accessible | Full access |

## Testing Checklist

- [ ] Generation produces same quality affirmations as gt-01
- [ ] Implementation selector works
- [ ] Temperature from KV store is applied
- [ ] Agent visible in Mastra Studio (`npx mastra dev`)
- [ ] No `NEXT_PUBLIC_*` env vars used
- [ ] Error handling works correctly
- [ ] Loading states display properly

## Future Migration Path

Once gt-02 is validated:

1. **AF-01**: Create `af-02` using same pattern
2. **FP-01**: Refactor to use server action (already has Mastra agent)
3. **Deprecate**: Remove `lib/agents/openrouter-client.ts`
4. **Clean up**: Remove `NEXT_PUBLIC_OPENROUTER_*` env vars

## Notes

- Reuse `affirmationThemes` from `src/ag-good-ten/themes.ts` (no need to duplicate)
- The server action file must be in the `app/` directory (not `lib/` or `src/`)
- Temperature is stored as string in KV store, parsed to float in server action
