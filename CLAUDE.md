# CLAUDE.md

Quick reference for Claude Code. For detailed documentation, see `docs/current/_overview.md`.

## Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint

# Database
npm run db:seed          # Populate KV store with prompts (required before testing new versions)
npm run db:studio        # Open Drizzle Studio GUI
npm run db:generate      # Generate migrations from schema changes
npm run db:migrate       # Apply migrations

# Testing
node --import tsx e2e/fo-01.test.ts   # Run E2E test (use this, not npx tsx)

# AI Development
npx mastra dev           # Mastra Studio (http://localhost:4111)
```

## Project Structure

```
app/                    # Next.js App Router (pages, layouts, routes)
  fo-01/, fo-02/, ...   # Agent version UIs
components/             # Shared React components
src/
  mastra/agents/        # AI agent definitions
  services/             # KV store, template engine
  db/                   # Drizzle schema, seed scripts
docs/
  current/              # Technical documentation
  projects/             # Project specs (e.g., 2026-01-17-FO-02/SPEC.md)
e2e/                    # Playwright E2E tests
```

## Documentation

**Always check docs before implementing.** Start with `docs/current/_overview.md`.

| Topic | Document |
|-------|----------|
| E2E Testing | `docs/current/e2e-testing.md` (setup), `docs/current/e2e/README.md` (knowledge base hub) |
| Navigation | `docs/current/navigation.md` |
| KV Store & Prompts | `docs/current/keyvaluestore-and-template-engine.md` |
| Mastra Agents | `docs/current/mastra.md` |
| Database | `docs/current/supabase-and-drizzle.md` |
| Project Specs | `docs/projects/<date>-<id>/SPEC.md` |

## Environment Variables

Required in `.env.local`:
```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Planning UI Work with E2E Testing

When using `/sdd-local:createplan` for UI features, follow these principles:

1. **UI Chunk = Epic = E2E Scope**: Break UI work into logical chunks, where each chunk is an epic with its own E2E scope
2. **E2E is integrated, not bolted on**: Every UI tick includes E2E verification, not just the last tick
3. **Tick-level guidance**: Every UI tick should reference `docs/current/e2e/tick-quick-reference.md`

**Key documents for planning:**
- `docs/current/e2e/ui-epic-structure.md` - How to structure UI tasks as epics
- `docs/current/e2e/tick-quick-reference.md` - Minimal knowledge for any tick doing E2E
- `docs/current/e2e/README.md` - Full knowledge base hub

**E2E configuration:** Project-specific settings (framework, runner, serialization, timeouts) are defined in `docs/current/e2e/e2e-config.md`. This is read by sdd-local commands to generate project-appropriate plans and epics.

**Every UI tick should answer:**
- What TypeScript test verifies this?
- What screenshot proves success?
- What's the run command?
- Where's the project cookbook?

See `docs/current/e2e/ui-epic-structure.md` for complete guidance.

### E2E Knowledge Base (`docs/current/e2e/`)

| Document | Purpose |
|----------|---------|
| [README.md](docs/current/e2e/README.md) | Hub index and quick navigation |
| [e2e-config.md](docs/current/e2e/e2e-config.md) | Project E2E config (framework, runner, serialization) |
| [ui-epic-structure.md](docs/current/e2e/ui-epic-structure.md) | How to structure UI tasks as epics with E2E |
| [tick-quick-reference.md](docs/current/e2e/tick-quick-reference.md) | Minimal E2E knowledge for individual ticks |
| [playwright-patterns.md](docs/current/e2e/playwright-patterns.md) | Reusable Playwright TypeScript patterns |
| [troubleshooting.md](docs/current/e2e/troubleshooting.md) | Common issues and fixes |
| [autonomous-execution.md](docs/current/e2e/autonomous-execution.md) | Autonomous E2E test execution via subagents |
| [epic-writing-guide.md](docs/current/e2e/epic-writing-guide.md) | Guide for writing E2E epics |
| [cookbook-template.md](docs/current/e2e/cookbook-template.md) | Template for E2E test cookbooks |
| [project-e2e-directory.md](docs/current/e2e/project-e2e-directory.md) | Project-level E2E directory conventions |
