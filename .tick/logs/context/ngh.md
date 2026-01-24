# Epic Context: ngh - FO-05 Summary: Agent & Backend

## Relevant Code
- `src/mastra/agents/fo-05/agent.ts` - Discovery agent (reference for structure)
- `src/mastra/agents/fo-05/affirmation-agent.ts` - Affirmation agent (reference for context handling)
- `src/mastra/agents/fo-05/index.ts` - Export file to update
- `app/fo-05/actions.ts` - Server actions with GatheringContext interface

## Architecture
- Agents use Mastra Agent framework
- Agents get system prompt from KV store or use default
- Server actions call agents via createXXXAgent() then agent.generate()
- GatheringContext contains: name, familiarity, initialTopic, exchanges[]

## Testing
- Build command: `npm run build`
- No unit tests required for prototype

## Conventions
- Agent files export createFO05XXXAgent function
- Use getAgentModelName, getAgentSystemPrompt, getModel from services
- Default instructions defined as const, passed to Agent constructor
- Error handling returns empty string for graceful degradation
