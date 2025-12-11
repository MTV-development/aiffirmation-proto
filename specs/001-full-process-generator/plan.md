# Implementation Plan: Full Process Affirmation Generator

**Branch**: `001-full-process-generator` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-full-process-generator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a complete 4-phase affirmation generation experience (Discovery Wizard -> Review Loop -> Mid-Journey Check-In -> Collection Summary) with its own navigation menu item. It requires a new Mastra agent for personalized affirmation generation, React client components for the multi-step wizard and review UI, and integration with the existing KV store for configurable prompts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16, React 19, Mastra AI framework, Tailwind CSS 4, Shadcn-style components
**Storage**: Supabase (PostgreSQL) via Drizzle ORM, KV store for agent configuration
**Testing**: Manual testing via development server (no test framework in current project)
**Target Platform**: Web browser (desktop-first, responsive)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Affirmation generation within 5 seconds, wizard completion under 2 minutes
**Constraints**: Client-side state only (no session persistence), graceful fallback on API failures
**Scale/Scope**: Single user sessions, 5-8 affirmations per batch, unlimited collection size

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. KV-Driven Agent Configuration | PASS | Agent prompts will be stored in KV store as `versions.fp-01.system.default` |
| II. Modern Web Stack | PASS | Using App Router (`app/full-process/`), React 19, Tailwind CSS, TypeScript strict |
| III. Database-Backed State | PASS | KV store via Drizzle (server) / Supabase client (browser); no new schema tables needed |
| Development Workflow | PASS | Navigation via nav.config.ts, agent in src/mastra/agents/, API routes in app/api/ |
| Quality Gates | PASS | Will pass lint, build, TypeScript compilation |

**Result**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-full-process-generator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.md           # API contract documentation
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── full-process/                    # New route for Full Process Generator
│   ├── layout.tsx                   # Section layout with TopSubmenu
│   ├── full-process-layout-client.tsx  # Client layout wrapper
│   ├── page.tsx                     # Main page (Discovery wizard)
│   └── info/
│       └── page.tsx                 # Info/help page for the feature
├── api/
│   └── full-process/
│       └── generate/
│           └── route.ts             # API endpoint for affirmation generation

src/
├── mastra/
│   ├── agents/
│   │   └── full-process/
│   │       ├── index.ts             # Export barrel
│   │       └── agent.ts             # Full Process agent definition
│   └── index.ts                     # Register new agent
├── full-process/
│   ├── index.ts                     # Feature module exports
│   ├── types.ts                     # UserPreferences, AffirmationState interfaces
│   ├── constants.ts                 # Preset options (focus areas, challenges, tones)
│   └── hooks.ts                     # useFullProcessState, useImplementation hooks

components/
└── full-process/
    ├── discovery-wizard.tsx         # 4-step wizard component
    ├── step-focus.tsx               # Step 1: Primary Focus
    ├── step-timing.tsx              # Step 2: Timing
    ├── step-challenges.tsx          # Step 3: Challenges
    ├── step-tone.tsx                # Step 4: Tone
    ├── progress-bar.tsx             # Wizard progress indicator
    ├── affirmation-review.tsx       # Review loop component
    ├── affirmation-card.tsx         # Single affirmation display
    ├── mid-journey-checkin.tsx      # Check-in screen
    ├── adjustment-panel.tsx         # Preference adjustment modal
    └── collection-summary.tsx       # Final summary with export

lib/
└── agents/
    └── full-process.ts              # Client-side generation function

nav.config.ts                        # Add "Full Process" menu item

src/db/
└── seed.ts                          # Add FP-01 KV entries (system, prompt, model, _info)
```

**Structure Decision**: Following existing web application patterns in the codebase. The feature creates a parallel structure to `ag-aff-01` with its own route, agent module, and components.

## Database Seed Requirements

**CRITICAL**: The feature requires KV store entries to be seeded before it will function. The following entries must be added to `src/db/seed.ts`:

| Key | Purpose |
|-----|---------|
| `versions.fp-01._info.default` | Implementation metadata (name, description, author) |
| `versions.fp-01._model_name.default` | Model identifier (e.g., `openai/gpt-4o-mini`) |
| `versions.fp-01.system.default` | System prompt with tone adaptation and affirmation guidelines |
| `versions.fp-01.prompt.default` | User prompt template with preference variables |

See [data-model.md](./data-model.md#kv-store-seed-entries-required) for the complete seed entry definitions with Liquid templates.

After adding entries, run: `npm run db:seed`

## Complexity Tracking

> **No violations detected. This section is not applicable.**
