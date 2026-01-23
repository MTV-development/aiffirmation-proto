# Epic Context: [nt7] FO-03: Agent & Backend

## Relevant Code

### Reference Pattern: FO-02 Agent
**`src/mastra/agents/fo-02/agent.ts`** (104 lines)
- `DEFAULT_INSTRUCTIONS`: Complete affirmation guidelines (lines 4-85)
- `fo02Agent`: Static Agent instance with default config (lines 87-92)
- `createFO02Agent(implementation)`: Factory that loads system prompt from KV store (lines 94-104)

Key imports:
```typescript
import { Agent } from '@mastra/core/agent';
import { getAgentModelName, getAgentSystemPrompt, getModel } from '@/src/services';
```

**`src/mastra/agents/fo-02/index.ts`**: Re-exports `fo02Agent` and `createFO02Agent`

### Reference Pattern: FO-02 Server Actions
**`app/fo-02/actions.ts`** (157 lines)
- Interface `FO02GenerateBatchOptions` (lines 6-13): name, intention, batchNumber, approvedAffirmations, skippedAffirmations, implementation
- Interface `FO02GenerateBatchResult` (lines 15-18): affirmations[], error?
- `parseAffirmationsResponse(text)` (lines 24-61): Handles JSON array parsing with fallbacks
- `generateAffirmationBatchFO02(options)` (lines 67-157): Main server action

Key logic flow (lines 87-148):
1. Select prompt key: `prompt_initial` (batch 1) or `prompt_with_feedback` (2-3)
2. Build templateVariables with name, intention, feedback arrays
3. Call `renderTemplate()` with version='fo-02'
4. Get temperature from KV store via `getKVText()`
5. Create agent via `createFO02Agent(implementation)`
6. Call `agent.generate(userPrompt, { modelSettings: { temperature } })`
7. Parse response with `parseAffirmationsResponse()`

### KV Store Seed Data
**`src/db/seed.ts`** - FO-02 entries (lines 1611-1781)

Keys pattern for FO-02:
- `versions.fo-02._info.default` - Description
- `versions.fo-02._model_name.default` - Model ID (e.g., 'openai/gpt-4o-mini')
- `versions.fo-02._temperature.default` - Temperature value (e.g., '0.9')
- `versions.fo-02.system.default` - System prompt (not used directly; agent uses DEFAULT_INSTRUCTIONS fallback)
- `versions.fo-02.prompt_initial.default` - First batch prompt template
- `versions.fo-02.prompt_with_feedback.default` - Subsequent batch prompt template

Template variables used in FO-02:
- `{{ name }}`, `{{ intention }}`
- `{{ approvedAffirmations }}`, `{{ skippedAffirmations }}`, `{{ allPreviousAffirmations }}`

### Services Layer
**`src/services/index.ts`**: Exports
- `getKVValue`, `getKVText`, `getAgentSystemPrompt`, `getAgentPromptTemplate`, `getAgentModelName`
- `renderTemplate`, `getTemplateText`
- `getModel`, `getModelName`

## Architecture Notes

### Data Flow
1. **Onboarding UI** collects user data → calls server action
2. **Server action** builds template variables → `renderTemplate()` → creates agent → `agent.generate()`
3. **Agent** uses system prompt (KV or default) + user prompt → returns JSON array
4. **Server action** parses response → returns to UI

### KV Key Convention
```
versions.{agent-id}.{key-name}.{implementation}
```
- `_temperature`, `_model_name`, `_system_prompt` use underscore prefix for config
- `prompt_initial`, `prompt_with_feedback` are user prompt templates

### Template Engine
Uses LiquidJS. Key patterns:
- Arrays: `{{ topics | join: ", " }}`
- Conditionals: `{% if approvedAffirmations.size > 0 %}...{% endif %}`
- Loops: `{% for aff in approvedAffirmations %}{{ aff }}{% endfor %}`

## FO-03 Specific Requirements

### Data Model (from spec lines 137-158)
```typescript
interface FO03OnboardingData {
  name: string;
  familiarity: 'new' | 'some' | 'very';
  topics: string[];
  situation: { text: string; chips: string[] };
  feelings: { text: string; chips: string[] };
  whatHelps: { text: string; chips: string[] };
}
```

### Template Variables for FO-03
Must support:
- `{{ name }}`, `{{ familiarity }}`
- `{{ topics }}` (array)
- `{{ situation_text }}`, `{{ situation_chips }}` (or structured object)
- `{{ feelings_text }}`, `{{ feelings_chips }}`
- `{{ whatHelps_text }}`, `{{ whatHelps_chips }}`
- `{{ approvedAffirmations }}`, `{{ skippedAffirmations }}` (for feedback batches)

### Agent Instructions
Should guide LLM to use richer context from FO-03's multi-step onboarding. The DEFAULT_INSTRUCTIONS in FO-02 (lines 4-85 of agent.ts) provide the base affirmation guidelines—FO-03 can reuse these with additions for handling topics, situation, feelings, and whatHelps fields.

## Conventions

### Naming
- Agent ID: `fo-03`
- Function: `generateAffirmationBatchFO03`
- Factory: `createFO03Agent`
- KV keys: `versions.fo-03.*`

### Error Handling
- Return `{ affirmations: [], error: 'message' }` on failure
- Use console.log with `[fo-03]` prefix for debugging
- Check for empty name with explicit validation (see FO-02 lines 79-85)

### Prompt Templates
- Use Liquid `{% if %}` for optional sections
- Use `{% for %}` for arrays
- Combine chips and text meaningfully (e.g., show both if present)

## Testing

No specific unit tests exist for agents. Test via:
1. `npm run db:seed` to populate KV store
2. Manual testing through UI or `npx mastra dev`
3. E2E tests in `e2e/` use Playwright

## Files to Create/Modify

| Task | File | Action |
|------|------|--------|
| [6ji] | `src/db/seed.ts` | Add FO-03 entries to `demoData` array |
| [v3c] | `src/mastra/agents/fo-03/agent.ts` | Create agent with DEFAULT_INSTRUCTIONS |
| [v3c] | `src/mastra/agents/fo-03/index.ts` | Re-export agent factory |
| [9rc] | `app/fo-03/actions.ts` | Create server action with FO-03 options interface |