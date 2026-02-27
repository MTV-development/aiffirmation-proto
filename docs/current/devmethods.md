# Local Development Guide

## Prerequisites

- Node.js 20+
- npm
- Git

## Environment Setup

Create `.env.local` in the project root:

```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Dev Server

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). Hot reloads on file changes.

## Database Setup

First-time setup (in order):

```bash
npm run db:generate    # Generate migrations from schema
npm run db:migrate     # Apply migrations to database
npm run db:seed        # Populate KV store with prompts
```

After schema changes:

```bash
npm run db:generate    # Regenerate migrations
npm run db:migrate     # Apply new migrations
```

After adding new seed files:

```bash
npm run db:seed        # Re-populate KV store (upserts)
```

Inspect database:

```bash
npm run db:studio      # Open Drizzle Studio GUI
```

## Common Tasks

### Run E2E tests

```bash
node --import tsx e2e/fo-12.test.ts
```

Use `node --import tsx` (not `npx tsx`) for Windows Git Bash compatibility.

### Run linter

```bash
npm run lint
```

### Production build

```bash
npm run build
```

### Mastra Studio

```bash
npx mastra dev
```

Opens at [http://localhost:4111](http://localhost:4111) for agent testing and observability.

### Create a new FO version

1. Copy the latest version directory: `app/fo-XX/` → `app/fo-YY/`
2. Update step number guards in all components
3. Create seed file in `src/db/seeds/fo-YY.ts`
4. Register seeds in `src/db/seeds/index.ts`
5. Add navigation entry in `nav.config.ts`
6. Add overview card in `app/overview/page.tsx`
7. Run `npm run db:seed` to populate prompts
8. Create E2E test in `e2e/fo-YY.test.ts`
