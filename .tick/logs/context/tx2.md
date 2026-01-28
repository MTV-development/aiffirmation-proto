# Epic Context: tx2 - fo-08: AI Agents and KV Store Setup

## Relevant Code

- `src/mastra/agents/fo-07/agent.ts` - Source for discovery agent structure (has DEFAULT_INSTRUCTIONS pattern)
- `src/mastra/agents/fo-07/affirmation-agent.ts` - Source for affirmation agent to copy
- `src/mastra/agents/fo-07/summary-agent.ts` - Source for summary agent to copy
- `src/mastra/agents/fo-07/index.ts` - Export pattern to follow
- `src/db/seed.ts` - KV store seeding file to add FO-08 prompts
- `src/services/index.ts` - Agent helper functions (getAgentModelName, getAgentSystemPrompt, getModel)

## Architecture

- Each agent version has its own folder under `src/mastra/agents/fo-XX/`
- Agents use a factory pattern: `createFO08DiscoveryAgent(implementation)`
- DEFAULT_INSTRUCTIONS serves as fallback if KV store template not found
- KV store keys follow pattern: `versions.fo-08-{agent}._info.default`, etc.
- Agent IDs follow pattern: `fo-08-discovery-agent`, `fo-08-affirmation`, `fo-08-summary`

## Key Spec Details

FO-08 discovery agent must include:
- FO-07's 5 Dimensions framework (Emotional Baseline, Inner Dialogue, Needs & Longings, Believability Threshold, Life Context)
- NEW: Hybrid fragment generation section (suggest direction + invite completion)
- Output format: 8 `initialFragments` + 15 `expandedFragments` + optional `reflectiveStatement`
- Extensive examples of hybrid fragments by dimension

Affirmation and summary agents: Copy from FO-07 unchanged (just update IDs)

## Testing

- Verify grep for agent IDs in created files
- Run `npm run db:seed` after adding prompts to seed.ts

## Conventions

- Agent IDs: `fo-08-{type}-agent` or `fo-08-{type}`
- Use same structure as FO-07 for factory function
- KV namespace: `versions.fo-08-*`
