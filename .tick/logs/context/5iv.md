# Epic Context: 5iv - mastra-1-0: Environment validation

## Relevant Code
- `package.json` - Current Mastra package versions (beta)
- `src/mastra/index.ts` - Main Mastra instance configuration
- `docs/projects/2026-01-26-mastra-1-0-upgrade/2026-01-26-mastra-1-0-upgrade-spec.md` - Full spec

## Architecture
- Project uses Next.js with Mastra for AI agents
- Mastra agents defined in `src/mastra/agents/`
- PostgresStore for workflow persistence

## Testing
- Build command: `npm run build`
- TypeScript check: `npx tsc --noEmit`
- E2E tests: `node --import tsx e2e/fo-05.test.ts`

## Conventions
- Mastra v1 requires Node.js 22.13.0+
- Current packages are beta versions (1.0.0-beta.x)
- Target is stable @latest versions

## Key Prerequisite
Node.js version must be >= 22.13.0 for Mastra v1 stable
