# Principles and Architectural Choices

Patterns and decisions observed and established across the project.

## Architecture

### Next.js App Router with version-isolated routes
Each FO version lives in its own route directory (`app/fo-XX/`). Versions are independent — they share the `components/` directory for common UI primitives but have their own state machines, actions, and page components.

### One state machine per version
`app/fo-XX/components/fo-experience.tsx` is the single source of truth for flow logic in each version. It manages step progression, async calls, animation coordination, and data accumulation.

### Component props over shared type imports
Components define their own prop interfaces. The state machine wires everything. Constants are inlined in the component that uses them rather than imported from a shared `types.ts`. This keeps components self-contained and avoids coupling.

## AI & Templating

### Mastra for AI agents
AI agents are defined in `src/mastra/agents/fo-XX/`. Each version has its own agent definitions with version-specific system prompts.

### LiquidJS for prompt templating
Prompts are stored in the KV store as Liquid templates and rendered at runtime with context variables (conversation history, name, batch size, etc.).

### KV store namespace isolation per version
Each version uses its own KV namespace (e.g., `fo-12`). This prevents prompt changes in one version from affecting others and allows independent iteration.

## Development Pattern

### Copy-modify-iterate
New versions are created by copying the predecessor and modifying deltas. This preserves working code while allowing focused changes. When copying:
1. Update all step number guards
2. Verify counter formats match the new UI
3. Check prop interfaces are compatible with the new state machine
4. Register new seed files in `src/db/seeds/index.ts`

### Seed files: one per version
Each version has a dedicated seed file (`src/db/seeds/fo-XX.ts`) registered in `src/db/seeds/index.ts`. Run `npm run db:seed` after adding new seeds.

## Testing

### Playwright E2E with `node --import tsx` runner
E2E tests use Playwright via TypeScript, run with `node --import tsx e2e/fo-XX.test.ts`. Every UI epic must include E2E verification.

### Flexible assertions for LLM content
LLM-generated content varies between runs. Assert on structure (non-empty, minimum length) rather than exact text.

## Persistence

### Supabase + Drizzle ORM
PostgreSQL via Supabase for persistence, Drizzle ORM for type-safe schema management and migrations.

### Migration workflow
Schema changes → `npm run db:generate` → `npm run db:migrate` → verify in `npm run db:studio`.
