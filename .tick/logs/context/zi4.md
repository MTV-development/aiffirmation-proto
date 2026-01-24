# Epic Context: zi4 - FO-05: Discovery Agent

## Relevant Code
- `src/mastra/agents/fo-04/agent.ts` - Reference discovery agent (~175 lines)
- `src/mastra/agents/fo-04/affirmation-agent.ts` - Affirmation agent to copy
- `src/mastra/agents/fo-04/index.ts` - Export barrel pattern
- `app/fo-04/actions.ts` - Server actions with JSON parsing (~430 lines)

## Architecture
- Mastra Agent framework for AI agents
- Agents have system prompts defined as DEFAULT_INSTRUCTIONS
- Factory functions create agents with configurable implementations
- Server actions call agents and parse JSON responses

## Key Differences from FO-04
- Output uses `initialFragments` and `expandedFragments` (not chips)
- Fragments are half-finished sentences like "I'm feeling sad because..."
- Generate exactly 5 initial + 8 expanded = 13 total fragments
- System prompt must instruct to vary reflective statements
- buildDiscoveryPrompt must include both question AND answer

## Testing
- Build command: `npm run build`
- Verify agents export correctly

## Conventions
- Agent IDs follow pattern: `fo-05-discovery-agent`
- Use getModel() and getAgentSystemPrompt() from services
- JSON response parsing with fallback extraction
