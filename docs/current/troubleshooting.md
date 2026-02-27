# Troubleshooting

General troubleshooting guide. For E2E-specific issues, see [e2e/troubleshooting.md](e2e/troubleshooting.md).

## KV Store

### Missing seeds / empty prompts
**Symptom:** Agent returns empty or error responses. UI shows no content.
**Fix:** Run `npm run db:seed` to populate the KV store. Verify the version's seed file is registered in `src/db/seeds/index.ts`.

### Namespace mismatch
**Symptom:** Version uses prompts from a different version.
**Fix:** Check that the seed file and agent both reference the correct namespace (e.g., `fo-12`). Each version must use its own namespace.

### Seed changes not taking effect
**Symptom:** Updated seed content doesn't appear after reseeding.
**Fix:** Seeds use upsert — running `npm run db:seed` again will overwrite existing entries. If issues persist, check for caching in the KV service layer.

## Mastra Agents

### API key issues
**Symptom:** `OPENAI_API_KEY` errors, 401 responses.
**Fix:** Verify `OPENAI_API_KEY` is set in `.env.local`. Restart the dev server after changing env vars.

### Model configuration
**Symptom:** Unexpected model behavior or model not found errors.
**Fix:** Check the agent definition in `src/mastra/agents/fo-XX/`. Verify model ID is valid (e.g., `gpt-4o`).

### Mastra Studio not loading
**Symptom:** `npx mastra dev` fails or shows errors.
**Fix:** Ensure all agent files compile without errors. Check that `src/mastra/index.ts` exports are correct.

## Database

### Migration drift
**Symptom:** Schema doesn't match what Drizzle expects. Errors on startup.
**Fix:**
```bash
npm run db:generate    # Regenerate migrations from current schema
npm run db:migrate     # Apply pending migrations
```

### Connection issues
**Symptom:** `DATABASE_URL` connection errors.
**Fix:** Verify `DATABASE_URL` in `.env.local` points to a running Supabase instance. Check network connectivity.

### Drizzle Studio won't open
**Symptom:** `npm run db:studio` fails.
**Fix:** Ensure `DATABASE_URL` is set and the database is accessible. Try `npx drizzle-kit studio` directly for more verbose output.

## Build & Dev Server

### Next.js build errors
**Symptom:** `npm run build` fails.
**Fix:** Run `npm run lint` first to catch syntax issues. Common causes:
- Missing imports in newly created files
- Type errors in component props
- Server/client component boundary issues (missing `"use client"` directive)

### Dev server port conflict
**Symptom:** Port 3000 already in use.
**Fix:** Kill the existing process or use `npm run dev -- -p 3001`.

### Hot reload not working
**Symptom:** Changes don't appear in browser.
**Fix:** Check for TypeScript compilation errors in the terminal. Hard refresh the browser. Restart the dev server if needed.

## Version Creation (Copy-Modify-Iterate)

### Step guard errors after renumbering
**Symptom:** Components render at wrong steps or don't render at all.
**Fix:** After copying a version, grep for all step number guards and update them. Search for patterns like `currentStep !== X` and `step === X`.

### Missing navigation entry
**Symptom:** New version doesn't appear in the nav menu.
**Fix:** Add the version to `nav.config.ts` with Demo and Info children. Add a card to `app/overview/page.tsx`.
