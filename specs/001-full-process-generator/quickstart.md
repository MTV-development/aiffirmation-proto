# Quickstart Guide: Full Process Affirmation Generator

**Branch**: `001-full-process-generator` | **Date**: 2025-12-11

## Prerequisites

- Node.js 18+ installed
- Environment variables configured (see `.env.local.example`)
- Database seeded with KV entries

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Ensure these are in your `.env.local`:

```bash
OPENAI_API_KEY=sk-...              # Or OPENROUTER_API_KEY
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Seed KV Store Entries

The feature requires these KV entries to be seeded:

```bash
npm run db:seed
```

If implementing manually, add these entries to the KV store:

| Key | Value Type |
|-----|------------|
| `versions.fp-01.system.default` | System prompt template |
| `versions.fp-01.prompt.default` | User prompt template |
| `versions.fp-01.model.default` | Model name string |

### 4. Start Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000/full-process](http://localhost:3000/full-process)

## Feature Walkthrough

### Phase 1: Discovery Wizard

1. **Step 1 - Primary Focus**: Select a focus area card OR enter custom text
2. **Step 2 - Timing**: Select one or more timing options OR enter custom timing
3. **Step 3 - Challenges**: Toggle challenge badges (optional) OR enter custom challenge
4. **Step 4 - Tone**: Select a tone card OR enter custom description
5. Click **"Find Affirmations"** to proceed

### Phase 2: Review Loop

- View affirmations one at a time
- Click **heart** to add to collection
- Click **X** to skip
- Progress bar shows current position in batch
- Counter shows total liked

### Phase 3: Mid-Journey Check-In

Appears automatically at milestones (5, 10, 15+ likes):

- **"Yes, Keep Going"**: Continue reviewing
- **"Let's Adjust"**: Modify challenges/tone for future batches
- **"I'm happy with my collection"**: Go to summary

### Phase 4: Collection Summary

- View all collected affirmations numbered
- **Copy All**: Copy to clipboard
- **Download as Text**: Save as `.txt` file
- **Start Over**: Reset and begin again

## Development Tips

### Testing Different Flows

- **Quick path**: Complete wizard, like 5 affirmations, finish at check-in
- **Adjustment path**: Like 5, adjust preferences, verify new affirmations differ
- **Early exit**: Like 1-4, click "Finish Early"
- **Error handling**: Disconnect network during generation to see fallback

### Debugging

Check browser console for:
- `[fp-01] Implementation:` - Current implementation being used
- `[fp-01] Model:` - Model being called
- `[fp-01] System prompt:` - First 200 chars of system prompt
- `[fp-01] User prompt:` - Full user prompt sent

### Modifying Prompts

1. Navigate to Settings > KV Editor
2. Select version `fp-01`
3. Edit `system` or `prompt` entries
4. Changes take effect immediately on next generation

## Common Issues

### "No affirmations generated"

- Check that KV entries exist for `versions.fp-01.*`
- Verify `OPENAI_API_KEY` or `OPENROUTER_API_KEY` is set
- Check browser console for API errors

### "Fallback affirmations showing"

- API is unreachable or returning errors
- Check network connectivity
- Verify API key has sufficient credits

### "Navigation item not appearing"

- Ensure `nav.config.ts` has the Full Process entry
- Restart dev server after modifying nav config
