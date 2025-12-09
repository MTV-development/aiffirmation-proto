# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- `npm run dev` - Start development server with hot reload (http://localhost:3000)
- `npm run build` - Create production build
- `npm run lint` - Run ESLint checks
- `npx mastra dev` - Start Mastra Studio for agent testing (http://localhost:4111)

### Database Commands (Supabase + Drizzle)

- `npm run db:generate` - Generate SQL migration files from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:push` - Push schema directly (good for prototyping)
- `npm run db:studio` - Open Drizzle Studio GUI for database browsing
- `npm run db:seed` - Run seed script to populate demo data

## Architecture

This is a Next.js 16 application using the App Router pattern with React 19 and TypeScript.

**Key directories:**
- `app/` - Next.js App Router (pages, layouts, and routes)
- `components/` - Shared React components (Sidebar, TopSubmenu, KV Editor)
- `lib/supabase/` - Supabase browser client
- `lib/kv/` - KV store service for browser-side access
- `src/db/` - Drizzle schema, migrations client, and seed scripts
- `src/services/` - Template engine and KV store access (server-side)
- `src/mastra/` - Mastra AI agent definitions and tools

**Stack:**
- Next.js 16 with App Router (React Server Components by default)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4 for styling
- Supabase (database) with Drizzle ORM (schema/migrations)
- Mastra AI framework for agents
- LiquidJS for template rendering

## KV Store & Template Engine

The app uses a database-backed KV store for configurable prompts with Liquid templating.

**Key format:** `{namespace}.{version}.{keyName}.{implementation}`
- Example: `versions.af-01.system.default`

**Template rendering:**
```typescript
import { renderTemplate } from '@/src/services';

const { output, variables } = await renderTemplate({
  key: 'prompt',
  version: 'af-01',
  implementation: 'default',
  variables: { themes: ['Gratitude'] }
});
```

The engine fetches all KV entries for a version/implementation, makes them available as Liquid variables, and renders. KV keys can reference each other: `{{ numberInstruction }}` in `system` can pull text from a `numberInstruction` key.

**Two KV service files:**
- `src/services/kv-store.ts` - Server-side access via Drizzle
- `lib/kv/service.ts` - Browser-side access via Supabase client (for KV Editor UI)

## Mastra AI Agents

Agents are defined in `src/mastra/agents/`. The Mastra instance in `src/mastra/index.ts` uses a singleton pattern to prevent hot-reload errors.

**Adding a new agent:**
1. Create agent file in `src/mastra/agents/`
2. Register in `src/mastra/index.ts`
3. Create API route in `app/api/`

**Agent with configurable prompts (like AF-01):**
```typescript
import { Agent } from '@mastra/core/agent';
import { renderTemplate } from '@/src/services';

const { output: systemPrompt } = await renderTemplate({
  key: 'system',
  version: 'af-01',
  implementation: implToUse,
  variables: userVariables,
});

const agent = new Agent({
  name: 'AF-1',
  instructions: systemPrompt,
  model: 'openai/gpt-4o-mini',
});
```

## Navigation System

Navigation uses a **single source of truth** in `nav.config.ts`. The `navTree` array defines all routes, labels, and submenus.

**Adding a new section:**
1. Add entry to `navTree` in `nav.config.ts`
2. Create route folder under `app/` with `layout.tsx` and `page.tsx`
3. Section layouts inject `TopSubmenu` using the nav config

## Environment Variables

Required in `.env.local`:
```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Further Documentation

For detailed documentation on any topic, **always start with the central [README.md](README.md)** in the project root. It serves as the index to all documentation and is kept up-to-date as the project evolves.
