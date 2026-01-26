# Epic Context: pck - mastra-1-0: Codemod and package updates

## Relevant Code
- `package.json` - Package versions to update
- `src/mastra/**/*.ts` - All Mastra-related code that codemod will update
- `src/mastra/tools/weather-tool.ts` - Tool execute signature
- `src/mastra/index.ts` - Main Mastra instance

## Architecture
- 19 agents across `src/mastra/agents/`
- 1 workflow with 3 steps in `src/mastra/workflows/chat-survey/`
- 1 tool (weather-tool)

## Codemod Changes Expected
- Imports updated to subpath entry points (`@mastra/core/agent`, `@mastra/core/tools`)
- `RuntimeContext` → `RequestContext` renames
- `createTool` execute signature changes to `(inputData, context)`
- Collection accessor renames (`.get*` → `.list*`)

## Package Versions
Current (beta):
- mastra: ^1.0.0-beta.12
- @mastra/core: ^1.0.0-beta.19
- @mastra/pg: ^1.0.0-beta.11
- @mastra/memory: ^1.0.0-beta.10
- @mastra/loggers: ^1.0.0-beta.3
- @mastra/libsql: ^1.0.0-beta.10

Target: All @latest (stable)

## Testing
- After codemod: `npx tsc --noEmit`
- After package update: `npm run build`
