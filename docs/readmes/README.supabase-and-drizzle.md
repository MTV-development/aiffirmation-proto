# Supabase + Drizzle Integration

This project uses a two-tool approach for database management:

1. **Drizzle ORM + Drizzle Kit**: Schema definition, migrations, and seeding (CLI/development time)
2. **Supabase JS Client**: Runtime database operations directly from the browser

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Development                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Drizzle   │───▶│   Drizzle   │───▶│    Supabase     │ │
│  │   Schema    │    │     Kit     │    │    Database     │ │
│  │ (schema.ts) │    │  (migrate)  │    │  (PostgreSQL)   │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         Runtime                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Browser   │───▶│  Supabase   │───▶│    Supabase     │ │
│  │    (React)  │    │  JS Client  │    │    Database     │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
aiffirmation-proto/
├── src/db/
│   ├── schema.ts      # Drizzle schema definitions
│   ├── index.ts       # Drizzle client (migrations only)
│   ├── seed.ts        # Database seeding script
│   └── reset.ts       # Database reset script
├── lib/supabase/
│   └── client.ts      # Supabase browser client
├── drizzle/           # Generated migration files
├── drizzle.config.ts  # Drizzle Kit configuration
└── .env.local         # Environment variables (gitignored)
```

## Environment Setup

Create a `.env.local` file in the project root:

```env
# Browser client (exposed to client via NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Direct connection for Drizzle migrations (never exposed to browser)
DIRECT_URL=postgresql://postgres.your-project:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
```

### Finding Your Credentials

| Variable | Where to Find |
|----------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API > anon/public key |
| `DIRECT_URL` | Supabase Dashboard > Project Settings > Database > Connection string > Direct |

## Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate SQL migration files from schema changes |
| `npm run db:migrate` | Apply migrations and seed the database |
| `npm run db:push` | Push schema directly and seed (good for prototyping) |
| `npm run db:reset` | Drop all tables, recreate schema, and seed |
| `npm run db:seed` | Run seed script only |
| `npm run db:studio` | Open Drizzle Studio GUI for database browsing |

## Workflow

### Initial Setup

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Add credentials to .env.local
# 3. Push schema and seed
npm run db:push
```

### Making Schema Changes

```bash
# 1. Edit src/db/schema.ts
# 2. Generate migration
npm run db:generate
# 3. Apply migration
npm run db:migrate
```

### Quick Prototyping

```bash
# Push schema changes directly (no migration files)
npm run db:push
```

### Starting Fresh

```bash
# Drop all tables and recreate
npm run db:reset
```

## Schema Definition

Schemas are defined in `src/db/schema.ts` using Drizzle ORM:

```typescript
import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

export const kvStore = pgTable('kv_store', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports for use in application
export type KVStoreEntry = typeof kvStore.$inferSelect;
export type NewKVStoreEntry = typeof kvStore.$inferInsert;
```

## Browser Client Usage

Use the Supabase client for all runtime database operations:

```typescript
import { supabase } from '@/lib/supabase/client';

// Fetch data
const { data, error } = await supabase
  .from('kv_store')
  .select('*')
  .order('key');

// Insert data
const { error } = await supabase
  .from('kv_store')
  .insert({ key: 'my.key', value: { foo: 'bar' } });

// Update data
const { error } = await supabase
  .from('kv_store')
  .update({ value: { foo: 'updated' } })
  .eq('key', 'my.key');

// Delete data
const { error } = await supabase
  .from('kv_store')
  .delete()
  .eq('key', 'my.key');
```

## Diagnostic Page

Visit `/settings/store` to see:
- Connection status checks
- API key validation
- Table existence verification
- Live data from the KV store

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct |
| "Connection refused" | Check `DIRECT_URL` password and host |
| "Table does not exist" | Run `npm run db:push` |
| "No data showing" | Run `npm run db:seed` |
| Environment vars not loading | Restart dev server after changing `.env.local` |

## Security Notes

- `NEXT_PUBLIC_*` variables are exposed to the browser
- `DIRECT_URL` is only used for migrations (never in browser)
- Row Level Security (RLS) is disabled for this prototype
- Never expose the `service_role` key to the browser
