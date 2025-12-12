# Implementation Plan: Full Process 2 - Feedback-Aware Affirmation Generation

**Branch**: `002-full-process-feedback` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-full-process-feedback/spec.md`

## Summary

Create a new AI agent (FP-02) that generates affirmations while learning from user feedback patterns. Unlike FP-01 which only avoids repeating shown affirmations, FP-02 analyzes which affirmations users approved (liked) versus skipped to generate better-aligned subsequent batches. The implementation is entirely backend-focused with no UI changes - identical UX to FP-01. FP-02 is a completely independent implementation with its own agent directory, KV store namespace, and seed data.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16, React 19, Mastra AI framework, LiquidJS
**Storage**: Supabase (PostgreSQL) with Drizzle ORM for KV store
**Testing**: Manual testing via Mastra Studio (`npx mastra dev`)
**Target Platform**: Web application (Node.js server, modern browsers)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <5 seconds for affirmation generation (per SC-003)
**Constraints**: Handle up to 50 approved + 50 skipped affirmations per session (per SC-004)
**Scale/Scope**: Single agent addition, ~5-6 files modified/created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. KV-Driven Agent Configuration

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Agent prompts stored in KV store | ✅ PASS | FP-02 prompts in `versions.fp-02.*` namespace |
| KV keys follow format `{namespace}.{version}.{keyName}.{implementation}` | ✅ PASS | e.g., `versions.fp-02.system.default` |
| Templates use LiquidJS syntax | ✅ PASS | Prompt template uses `{{ approvedAffirmations }}` etc. |
| New agent versions as new KV entries | ✅ PASS | FP-02 is new namespace, FP-01 unchanged |
| System prompts via `renderTemplate()` | ✅ PASS | Uses existing service pattern |

### II. Modern Web Stack

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| App Router pattern | ✅ PASS | No new routes needed (uses existing full-process route) |
| Server Components default | ✅ PASS | Agent runs server-side via server action |
| Client Components marked | ✅ N/A | No UI changes |
| Tailwind CSS | ✅ N/A | No UI changes |
| TypeScript strict mode | ✅ PASS | Agent code in strict TypeScript |

### III. Database-Backed State

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Drizzle migrations for schema | ✅ N/A | No schema changes (uses existing KV store) |
| No direct SQL | ✅ PASS | Uses Drizzle via `src/services/` |
| Server-side via `src/services/` | ✅ PASS | Agent uses existing KV service |
| Seed data in `src/db/seed.ts` | ✅ PASS | FP-02 entries added to seed |

### Development Workflow

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Agents registered in `src/mastra/index.ts` | ✅ PASS | FP-02 agent exported and registered |

### Quality Gates

| Gate | Verification |
|------|--------------|
| `npm run lint` | Will verify before merge |
| `npm run build` | Will verify before merge |
| TypeScript compilation | Will verify before merge |
| KV template references resolve | Will verify via Mastra Studio |

**Constitution Check Result**: ✅ ALL GATES PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-full-process-feedback/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── mastra/
│   ├── agents/
│   │   └── full-process-2/       # NEW: FP-02 agent directory
│   │       ├── index.ts          # NEW: Agent exports
│   │       └── agent.ts          # NEW: Agent implementation
│   └── index.ts                  # MODIFY: Register FP-02
├── db/
│   └── seed.ts                   # MODIFY: Add FP-02 KV entries
└── services/
    └── (existing - no changes)

app/
└── full-process/
    └── actions.ts                # MODIFY: Add FP-02 action or make version configurable
```

**Structure Decision**: Following existing Next.js App Router structure with Mastra agents. FP-02 gets its own directory under `src/mastra/agents/` mirroring the FP-01 pattern. No new routes or components needed.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
