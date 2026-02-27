# devmeta.md — Aiffirmation Proto

Project-specific configuration for devmeta commands.

## Testing

```bash
# E2E tests (per version)
node --import tsx e2e/fo-01.test.ts
node --import tsx e2e/fo-12.test.ts

# Linting
npm run lint

# Production build
npm run build
```

## Environment

- **Dev server:** `npm run dev` → http://localhost:3000
- **Mastra Studio:** `npx mastra dev` → http://localhost:4111
- **Database GUI:** `npm run db:studio`

### Required `.env.local`

```
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Database Setup

```bash
npm run db:generate    # Generate migrations from schema changes
npm run db:migrate     # Apply migrations
npm run db:seed        # Populate KV store (required before testing new versions)
```

## Rules

- **KV namespace isolation**: Each FO version uses its own KV namespace (e.g., `fo-12`). Never share prompts across versions.
- **Copy-modify-iterate**: New versions copy the predecessor and modify deltas. Always check step guards, counter formats, and prop interfaces when renumbering.
- **E2E required for every UI epic**: Every UI chunk must include E2E test verification. See `docs/current/e2e/README.md`.
- **E2E runner**: Use `node --import tsx`, not `npx tsx` (Windows Git Bash compatibility).
- **Seed registration**: Every new seed file must be registered in `src/db/seeds/index.ts`.
- **Component props over shared imports**: Components define their own prop interfaces; the state machine wires everything.
- **One state machine per version**: `app/fo-XX/components/fo-experience.tsx` is the single source of truth for flow logic.

## Epochs

- **Current epoch**: `docs/epochs/current.md`
- **Epoch docs**: `docs/epochs/epoch-XX/_overview.md`

## Documentation

- **Living docs**: `docs/current/` — architecture, patterns, troubleshooting
- **Project specs**: `docs/projects/<date>-<id>/SPEC.md`
- **Self-learning**: `docs/devmeta/` — lessons, diary, implementation log
