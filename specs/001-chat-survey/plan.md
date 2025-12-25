# Implementation Plan: Chat-Survey Agent (CS-01)

**Branch**: `001-chat-survey` | **Date**: 2025-12-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-chat-survey/spec.md`
**Research Reference**: [2025-12-24-chat-survey-research.md](../../docs/plans/2025-12-24-chat-survey/2025-12-24-chat-survey-research.md)

## Summary

Implement a two-phase affirmation generation experience:
1. **Discovery Chat** - Conversational AI gathers user preferences via guided questions
2. **Swipe-Based Generation** - Affirmations generated one-by-one, informed by chat insights and swipe feedback

Technical approach: Mastra Workflow with suspend/resume, PostgreSQL storage via Supabase for serverless persistence, Next.js App Router for UI.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**: Next.js 16, React 19, Mastra 0.24.6, Zod 4.x, Framer Motion 12.x
**Storage**: PostgreSQL via Supabase (existing) + Mastra PostgresStore for workflow snapshots
**Testing**: Manual testing (no test framework currently configured)
**Target Platform**: Web (Netlify Functions for serverless)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: First affirmation < 3s after discovery, no wait between swipes
**Constraints**: Serverless function timeout limits, connection pooling required
**Scale/Scope**: Single-user sessions, moderate concurrent users (prototype stage)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. KV-Driven Agent Configuration | PASS | Discovery and Generation agents will use KV store for prompts |
| II. Modern Web Stack | PASS | Next.js App Router, React Server Components, Tailwind CSS |
| III. Database-Backed State | PASS | Workflow state via PostgresStore (Supabase), structured via Zod schemas |
| Development Workflow | PASS | New route in nav.config.ts, agents registered in mastra/index.ts |
| Quality Gates | PASS | Will run lint/build before merge |

**Pre-Design Gate Status**: PASS - All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-chat-survey/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── workflow-api.md  # Server action contracts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/mastra/
├── workflows/
│   └── chat-survey/
│       ├── index.ts              # Workflow definition and export
│       ├── steps/
│       │   ├── discovery-chat.ts # Phase 1: Multi-turn conversation
│       │   ├── profile-builder.ts# Extract structured profile from chat
│       │   └── generate-stream.ts# Phase 2: Generate affirmations with feedback
│       └── types.ts              # Shared Zod schemas
├── agents/
│   └── chat-survey/
│       ├── index.ts              # Re-exports
│       ├── discovery-agent.ts    # Conversational discovery agent
│       └── generation-agent.ts   # Affirmation generation agent

app/chat-survey/
├── layout.tsx                    # Route layout with nav integration
├── page.tsx                      # Main page component
├── actions.ts                    # Server actions for workflow control
└── components/
    ├── index.ts                  # Re-exports
    ├── types.ts                  # Client-side types
    ├── chat-phase.tsx            # Phase 1 UI (chat interface)
    ├── swipe-phase.tsx           # Phase 2 UI (card swipe)
    ├── saved-screen.tsx          # View saved affirmations
    └── cs-experience.tsx         # Main orchestrator component

components/chat-survey/           # Shared UI components (if needed)
└── [reusable components]
```

**Structure Decision**: Web application pattern following existing project conventions. New feature adds workflow infrastructure under `src/mastra/workflows/` and a new App Router route under `app/chat-survey/`. Swipe UI components can be adapted from existing `components/alt-process-2/`.

## Complexity Tracking

> No violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design completion.*

| Principle | Compliance | Verification |
|-----------|------------|--------------|
| I. KV-Driven Agent Configuration | PASS | Data model includes KV key patterns for agent prompts (see data-model.md) |
| II. Modern Web Stack | PASS | Design uses App Router, Server Components for page, Client Components for interactive UI |
| III. Database-Backed State | PASS | PostgresStore for workflows, existing Drizzle patterns for any new tables |
| Development Workflow | PASS | Nav config update documented in quickstart.md, agent registration planned |
| Quality Gates | PASS | Quickstart includes verification checklist |

**Post-Design Gate Status**: PASS - Design maintains constitution compliance.

---

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](research.md) | Consolidated technical decisions |
| Data Model | [data-model.md](data-model.md) | Entity definitions and Zod schemas |
| API Contracts | [contracts/workflow-api.md](contracts/workflow-api.md) | Server action specifications |
| Quickstart | [quickstart.md](quickstart.md) | Minimal setup guide |

---

## Next Steps

Run `/speckit.tasks` to generate implementation tasks from this plan.
