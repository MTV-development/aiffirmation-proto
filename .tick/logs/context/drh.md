# Epic Context: [drh] fo-09: AI Agents and KV Store

## 1. Relevant Code

### FO-08 Discovery Agent (base for FO-09)
- **`src/mastra/agents/fo-08/agent.ts`** — Discovery agent with `DEFAULT_INSTRUCTIONS` containing:
  - 5 Dimensions Framework (lines 6-14)
  - Hybrid Fragment generation rules (lines 16-113)
  - Output format with `reflectiveStatement` field (lines 126-143)
  - Exports: `fo08DiscoveryAgent` (static) + `createFO08DiscoveryAgent(implementation)` factory (line 191)

### FO-08 Affirmation Agent (base for FO-09)
- **`src/mastra/agents/fo-08/affirmation-agent.ts`** — Affirmation agent with:
  - Output format: JSON array of exactly **20** affirmation strings (line 102)
  - Feedback learning section (lines 83-98)
  - Exports: `fo08AffirmationAgent` + `createFO08AffirmationAgent(implementation)` (line 114)

### FO-08 Index Exports
- **`src/mastra/agents/fo-08/index.ts`** — Exports discovery, affirmation, and summary agents. FO-09 index should export only discovery + affirmation (no summary).

### Services Layer
- **`src/services/index.ts`** — Re-exports `getAgentSystemPrompt`, `getAgentModelName`, `getModel`, `renderTemplate`, `getTemplateText`
- Agent factory pattern: `getAgentSystemPrompt(agentId, implementation)` fetches from KV key `versions.{agentId}.system.{implementation}`

### Seed File
- **`src/db/seed.ts`** — Large file. FO-08 entries at lines 4274-4712. Key structure per agent:
  - `_info.default` — metadata (name, text description, author, createdAt)
  - `_model_name.default` — model string, e.g. `"openai/gpt-4o-mini"`
  - `_temperature.default` — temperature string, e.g. `"0.8"` or `"0.9"`
  - `system.default` — full system prompt text
  - `prompt.default` — Liquid template with `{{ name }}`, `{{ familiarity }}`, `{{ exchanges }}`, etc.

### Feedback Pattern (actions.ts)
- **`app/fo-08/actions.ts:389-455`** — `buildAffirmationPrompt()` shows the feedback section structure:
  - `## Feedback from Previous Batches`
  - `### Approved Affirmations (generate more like these):` numbered list
  - `### Skipped Affirmations (avoid similar patterns):` numbered list
  - `### All Previous Affirmations (do not repeat these):` combined list

## 2. Architecture Notes

### Agent Creation Pattern
```typescript
import { Agent } from '@mastra/core/agent';
import { getAgentModelName, getAgentSystemPrompt, getModel } from '@/src/services';

export async function createFO09DiscoveryAgent(implementation: string = 'default'): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt('fo-09-discovery', implementation);
  const modelName = await getAgentModelName('fo-09-discovery', implementation);
  return new Agent({
    id: `fo-09-discovery-agent-${implementation}`,
    name: 'FO-09 Discovery',
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: getModel(modelName || undefined),
  });
}
```

### KV Store Key Convention
```
versions.{agent-id}.{key-type}.{implementation}
```
- Agent IDs: `fo-09-discovery`, `fo-09-affirmation`
- Key types: `_info`, `_model_name`, `_temperature`, `system`, `prompt`
- Implementations: `default`, `with_feedback` (new for FO-09 affirmation)

### Prompt Template Variables (Liquid)
Discovery: `{{ name }}`, `{{ familiarity }}`, `{{ initialTopic }}`, `{{ screenNumber }}`, `{{ exchanges }}`
Affirmation: `{{ name }}`, `{{ familiarity }}`, `{{ initialTopic }}`, `{{ exchanges }}`, `{{ feedback.approved }}`, `{{ feedback.skipped }}`

## 3. Key Changes from FO-08

### Discovery Agent (`agent.ts`)
1. **Remove `reflectiveStatement`** from output format entirely (both gathering and ready states)
2. **Add complete sentences section** for screen 1 — new prompt section "Generating Complete Sentences (First Screen Only)" per spec lines 201-233
3. **Keep hybrid fragments** for screens 2+ (same as FO-08)
4. **Accept topics parameter** — `generateFirstScreenFragments` references user's selected topics
5. **Same field names** — both modes use `initialFragments`/`expandedFragments`

### Affirmation Agent (`affirmation-agent.ts`)
1. **5 affirmations** instead of 20 — update output format line
2. **Feedback loop support** — prompt must support receiving loved/discarded/all-previous
3. **No summary agent** — FO-09 index only exports discovery + affirmation

### KV Seed Entries
- 11 entries total (5 discovery + 6 affirmation)
- New `prompt.with_feedback` variant for affirmation agent
- Spec provides exact feedback section template (spec lines 140-153)

## 4. Naming Conventions

| FO-08 | FO-09 |
|-------|-------|
| `fo08DiscoveryAgent` | `fo09DiscoveryAgent` |
| `createFO08DiscoveryAgent` | `createFO09DiscoveryAgent` |
| `fo08AffirmationAgent` | `fo09AffirmationAgent` |
| `createFO08AffirmationAgent` | `createFO09AffirmationAgent` |
| `fo-08-discovery` (KV agent-id) | `fo-09-discovery` |
| `fo-08-affirmation` (KV agent-id) | `fo-09-affirmation` |

## 5. File Creation Checklist

| File | Action |
|------|--------|
| `src/mastra/agents/fo-09/agent.ts` | Create (from FO-08, modify prompts) |
| `src/mastra/agents/fo-09/affirmation-agent.ts` | Create (from FO-08, 5 affirmations + feedback) |
| `src/mastra/agents/fo-09/index.ts` | Create (export discovery + affirmation only) |
| `src/db/seed.ts` | Modify (add 11 FO-09 entries after FO-08 block) |

## 6. Validation

After implementation, run:
```bash
npm run db:seed    # Seed KV store with new entries
npm run build      # Verify no TypeScript errors
```