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
| E2E Testing | `docs/current/e2e-testing.md` |
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
