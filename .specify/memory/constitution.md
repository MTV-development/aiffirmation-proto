<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (new constitution)
Added sections:
  - I. KV-Driven Agent Configuration
  - II. Modern Web Stack
  - III. Database-Backed State
  - Development Workflow
  - Quality Gates
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no changes needed - Constitution Check references this file)
  - .specify/templates/spec-template.md ✅ (no changes needed - technology agnostic)
  - .specify/templates/tasks-template.md ✅ (no changes needed - generic structure)
Follow-up TODOs: None
-->

# Aiffirmation Constitution

## Core Principles

### I. KV-Driven Agent Configuration

All AI agent behavior MUST be configurable through the database-backed KV store with Liquid templating.

- Agent prompts and instructions MUST be stored in the KV store, not hardcoded
- KV keys MUST follow the format: `{namespace}.{version}.{keyName}.{implementation}`
- Templates MUST use LiquidJS syntax for variable interpolation
- New agent versions MUST be created as new KV entries, preserving prior versions
- System prompts MUST be retrievable via `renderTemplate()` service

**Rationale**: Externalizing prompts enables rapid iteration, A/B testing of agent behaviors,
and rollback without code deployments.

### II. Modern Web Stack

The application MUST use Next.js App Router patterns with React Server Components as the default.

- Pages MUST use the App Router pattern (`app/` directory structure)
- Components SHOULD be Server Components unless client interactivity is required
- Client Components MUST be explicitly marked with `'use client'` directive
- Styling MUST use Tailwind CSS utility classes
- TypeScript strict mode MUST be enabled; `any` types are prohibited except for external library gaps

**Rationale**: Server Components reduce client bundle size and improve performance.
Strict TypeScript catches errors at compile time.

### III. Database-Backed State

All persistent state MUST flow through Supabase with Drizzle ORM for type-safe access.

- Schema changes MUST be managed through Drizzle migrations (`npm run db:generate`, `npm run db:migrate`)
- Direct SQL queries are prohibited; use Drizzle query builder or ORM methods
- Server-side database access MUST use `src/services/` (Drizzle)
- Client-side database access MUST use `lib/supabase/` (Supabase client)
- Seed data MUST be maintained in `src/db/seed.ts` for reproducible development environments

**Rationale**: Drizzle provides compile-time type safety for queries and migrations.
Separating server/client access patterns prevents credential leakage.

## Development Workflow

All development MUST follow the established patterns in the codebase:

- **Navigation**: Add new sections via `nav.config.ts` (single source of truth)
- **Agents**: Register in `src/mastra/index.ts`, expose via API routes in `app/api/`
- **Environment**: Required variables MUST be documented in CLAUDE.md and validated at startup
- **Documentation**: CLAUDE.md serves as the primary development reference; README.md indexes all docs

## Quality Gates

Code changes MUST pass these gates before merge:

- `npm run lint` - ESLint checks MUST pass with zero errors
- `npm run build` - Production build MUST complete without errors
- TypeScript compilation MUST succeed with no type errors
- All KV template references MUST resolve (no undefined variable errors)

## Governance

This constitution supersedes all other development practices for this repository.

- **Amendments**: Require documentation of change rationale and version increment
- **Compliance**: All PRs MUST verify adherence to these principles
- **Complexity**: Any deviation from these principles MUST be justified in writing
- **Guidance**: Use CLAUDE.md for runtime development guidance

**Version**: 1.0.0 | **Ratified**: 2025-12-11 | **Last Amended**: 2025-12-11
