# Mastra AI Agent Framework


This document explains our Mastra implementation for building AI agents with tool use, memory, and observability.

## Overview

[Mastra](https://mastra.ai) is a TypeScript AI agent framework that provides:
- **Agents**: LLM-powered assistants with custom instructions
- **Tools**: Functions that agents can call to perform actions
- **Memory**: Conversation history persistence
- **Observability**: Tracing and debugging via Mastra Studio

## Project Structure

All Mastra files live in `src/mastra/` (single source of truth for both Next.js and Mastra CLI):

```
src/mastra/
├── index.ts                    # Mastra instance configuration (singleton)
├── agents/
│   ├── ag-aff-01/              # Affirmation agent v1
│   ├── ag-good-ten/            # Good Ten agent
│   ├── full-process/           # Full process agent
│   ├── full-process-2/         # Full process v2
│   ├── full-process-3/         # Full process v3
│   ├── alt-process-1/          # Alternative process v1
│   ├── alt-process-2/          # Alternative process v2
│   ├── chat-survey/            # Multi-agent chat survey system
│   │   ├── discovery-agent.ts
│   │   ├── generation-agent.ts
│   │   └── profile-extractor-agent.ts
│   └── weather-agent.ts        # Demo weather agent
├── tools/
│   └── weather-tool.ts         # Weather API tool (demo)
└── workflows/
    └── chat-survey/            # Chat survey workflow
        ├── index.ts
        ├── types.ts
        └── steps/
            ├── discovery-chat.ts
            ├── generate-stream.ts
            └── profile-builder.ts
```

## Current Implementation

### Core Agents

The project has multiple affirmation-focused agents:

| Agent | Location | Purpose |
|-------|----------|---------|
| AG-AFF-01 | `agents/ag-aff-01/` | Original affirmation generator |
| Full Process 1-3 | `agents/full-process*/` | Full affirmation generation workflows |
| Alt Process 1-2 | `agents/alt-process-*/` | Alternative generation approaches |
| Chat Survey | `agents/chat-survey/` | Multi-agent discovery and generation |

### Agent Architecture

Agents use configurable prompts from the KV store:

```typescript
import { Agent } from '@mastra/core/agent';
import { getAgentSystemPrompt, getAgentModelName, getModel } from '@/src/services';

export async function createAgent(implementation: string = 'default'): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt('agent-id', implementation);
  const modelName = await getAgentModelName('agent-id', implementation);

  return new Agent({
    id: `agent-${implementation}`,
    name: 'Agent Name',
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: getModel(modelName || undefined),
  });
}
```

### Workflows

The chat-survey workflow orchestrates multiple agents:

1. **Discovery Agent** - Conversational exploration of user preferences
2. **Profile Extractor** - Extracts structured profile from conversation
3. **Generation Agent** - Creates personalized affirmations

### Demo: Weather Agent

A simple demo agent for testing the Mastra setup:

**Location**: `src/mastra/agents/weather-agent.ts`

- **Model**: OpenAI GPT-4o-mini
- **Tool**: `weatherTool` - fetches weather from Open-Meteo API

## Running Locally

### Option 1: Next.js App

The weather demo is integrated into the Next.js app:

```bash
npm run dev
```

Access the chat UI at: http://localhost:3000/weatherdemo

**API endpoint**: `POST /api/weatherdemo`
```json
{ "message": "What's the weather in Tokyo?" }
```

### Option 2: Mastra Studio (Local)

Mastra Studio provides a rich UI for testing agents with full observability:

```bash
npx mastra dev
```

Access Studio at: http://localhost:4111

Features:
- Interactive chat with agents
- Tool execution traces
- Prompt experimentation
- Evaluation running

### Option 3: Mastra Cloud

For team collaboration and production observability:

1. Sign up at https://cloud.mastra.ai
2. Get your access token
3. Add to `.env.local`:
   ```
   MASTRA_CLOUD_ACCESS_TOKEN=your-token
   ```
4. Traces will be sent to your cloud dashboard

## Configuration

### Environment Variables

Required in `.env.local`:

```bash
OPENAI_API_KEY=sk-...  # Required for the weather agent
```

Optional:
```bash
MASTRA_CLOUD_ACCESS_TOKEN=...  # For cloud observability
```

### Next.js Configuration

The `next.config.ts` must include:

```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
};
```

### Mastra Instance

The Mastra instance in `src/mastra/index.ts` uses a singleton pattern to prevent "AI Tracing instance already registered" errors during Next.js hot reload:

```ts
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
};

export const mastra =
  globalForMastra.mastra ??
  new Mastra({
    agents: { weatherAgent },
    // ... config
  });

if (process.env.NODE_ENV !== 'production') {
  globalForMastra.mastra = mastra;
}
```

## Adding New Agents

### 1. Create Agent File

```ts
// src/mastra/agents/my-agent.ts
import { Agent } from '@mastra/core/agent';

export const myAgent = new Agent({
  name: 'My Agent',
  instructions: `Your system prompt here...`,
  model: 'openai/gpt-4o-mini',
  tools: { /* your tools */ },
});
```

### 2. Register Agent

Add to `src/mastra/index.ts`:

```ts
import { myAgent } from './agents/my-agent';

export const mastra = new Mastra({
  agents: { weatherAgent, myAgent },
  // ...
});
```

### 3. Create API Route

```ts
// app/api/my-agent/route.ts
import { mastra } from '@/src/mastra';

export async function POST(req) {
  const { message } = await req.json();
  const agent = mastra.getAgent('myAgent');
  const result = await agent.generate(message);
  return Response.json({ response: result.text });
}
```

## Adding New Tools

### 1. Create Tool File

```ts
// src/mastra/tools/my-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const myTool = createTool({
  id: 'my-tool',
  description: 'What this tool does',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ context }) => {
    // Your tool logic
    return { result: 'done' };
  },
});
```

### 2. Add to Agent

```ts
import { myTool } from '../tools/my-tool';

export const myAgent = new Agent({
  // ...
  tools: { myTool },
});
```

## Observability Comparison

| Feature | Next.js Direct | Mastra Studio | Mastra Cloud |
|---------|----------------|---------------|--------------|
| Agent execution | Yes | Yes | Yes |
| Tool call traces | Logs only | Full UI | Full UI |
| Prompt testing | No | Yes | Yes |
| Team sharing | No | No | Yes |
| Production ready | Yes | Dev only | Yes |

## Troubleshooting

### "AI Tracing instance already registered"

This happens during Next.js hot reload. The singleton pattern in `src/mastra/index.ts` should prevent this. If it persists:

```bash
rm -rf .next .mastra
npm run dev
```

### "mastra: command not found"

Clear the shell hash and use npx:

```bash
hash -r
npx mastra dev
```

### Port conflicts

Mastra Studio uses port 4111, Next.js uses port 3000. If ports are busy:

```bash
# Find and kill processes
npx kill-port 3000 4111
```

## Dependencies

```json
{
  "@mastra/core": "^1.0.0-beta.19",
  "@mastra/libsql": "^1.0.0-beta.10",
  "@mastra/loggers": "^1.0.0-beta.3",
  "@mastra/memory": "^1.0.0-beta.10",
  "@mastra/pg": "^1.0.0-beta.11",
  "mastra": "^1.0.0-beta.12"
}
```

## Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [Mastra GitHub](https://github.com/mastra-ai/mastra)
- [Mastra Cloud](https://cloud.mastra.ai)
- [Next.js Integration Guide](https://mastra.ai/docs/frameworks/web-frameworks/next-js)
