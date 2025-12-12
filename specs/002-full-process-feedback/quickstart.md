# Quickstart: Full Process 2 - Feedback-Aware Affirmation Generation

**Branch**: `002-full-process-feedback`

## Prerequisites

- Node.js 18+
- npm
- Supabase database configured (see main README)
- Environment variables set in `.env.local`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Seed the Database

This adds FP-02 KV entries:

```bash
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Application available at http://localhost:3000

## Testing FP-02

### Via Mastra Studio

1. Start Mastra Studio:
   ```bash
   npx mastra dev
   ```

2. Open http://localhost:4111

3. Select the `FP-2` agent from the agent list

4. Test with a prompt like:
   ```
   Please generate 8 personalized affirmations for me.

   ## My Preferences
   - **Focus Area**: Career
   - **Challenges I Face**: imposter syndrome, work-life balance
   - **Tone I Prefer**: Gentle & Compassionate

   ## Affirmations I Liked
   - I am enough.
   - I trust my abilities.
   - My work has value.

   ## Affirmations I Skipped
   - I am unstoppable in my career.
   - Nothing can hold me back.
   - I dominate every challenge.
   ```

5. Verify response:
   - Returns JSON array of 8 affirmations
   - Affirmations lean toward gentle, shorter style (like approved)
   - Avoids assertive/commanding style (like skipped)

### Via Full Process UI

1. Navigate to http://localhost:3000/full-process

2. Complete discovery wizard (focus, challenges, tone)

3. Review first batch of affirmations:
   - Like some affirmations (click heart/like)
   - Skip others (click skip/next)

4. Continue to second batch

5. Verify second batch reflects patterns:
   - More similar to liked affirmations
   - Less similar to skipped affirmations

## Verification Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` completes successfully
- [ ] FP-02 agent appears in Mastra Studio
- [ ] KV entries exist: `versions.fp-02.*`
- [ ] Agent generates valid JSON array response
- [ ] Feedback influences generation (manual verification)

## File Locations

| File | Purpose |
|------|---------|
| `src/mastra/agents/full-process-2/agent.ts` | FP-02 agent implementation |
| `src/mastra/agents/full-process-2/index.ts` | Agent exports |
| `src/mastra/index.ts` | Mastra registration (includes FP-02) |
| `src/db/seed.ts` | Seed data with FP-02 KV entries |
| `app/full-process/actions.ts` | Server action for FP-02 generation |

## Troubleshooting

### Agent not appearing in Mastra Studio

1. Verify agent is exported from `src/mastra/agents/full-process-2/index.ts`
2. Verify agent is registered in `src/mastra/index.ts`
3. Restart Mastra Studio: `npx mastra dev`

### KV entries not found

1. Run seed script: `npm run db:seed`
2. Check database via Drizzle Studio: `npm run db:studio`
3. Look for keys starting with `versions.fp-02.`

### Generation returns fallback affirmations

1. Check console for error messages
2. Verify OpenAI API key is set in `.env.local`
3. Check model name in KV store: `versions.fp-02._model_name.default`

## Next Steps

After verifying FP-02 works:

1. Run `/speckit.tasks` to generate implementation tasks
2. Configure which agent version the UI uses (FP-01 vs FP-02)
3. Set up A/B testing if desired
