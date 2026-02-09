# TK Worker Memory

## Project Structure

- Server actions are in `app/[feature]/actions.ts`
- KV store templates are seeded from `src/db/seeds/[feature].ts`
- After updating seed files, always run `npm run db:seed` to update the database

## Common Patterns

### Template Variables in Server Actions

When updating server actions to pass new variables to templates:
1. Update the seed file first with new variable names
2. Run `npm run db:seed` to update the database
3. Update the server action to pass the new variables
4. The template engine uses Liquid syntax: `{{ variable_name }}`

### TypeScript Compilation

Always run `npx tsc --noEmit` before closing a task to catch type errors.

## FO-10 Specific

- Questions are hardcoded in `FO10_QUESTIONS` array in `types.ts`
- Chip generation happens at steps 5-7
- Step N uses question index N-4 from the array (step 5 → index 1, step 6 → index 2, etc.)
- Conversation history should be formatted as natural Q&A strings, not structured objects
- E2E test verified: `node --import tsx e2e/fo-10.test.ts` - conversational Q&A format produces contextually relevant chips

## E2E Testing

- Run E2E tests with `node --import tsx e2e/[test-file].test.ts`
- Always start dev server in background first: `npm run dev &` and wait 20s
- FO-10 test takes ~2-3 minutes and covers all 15 steps including AI generation
