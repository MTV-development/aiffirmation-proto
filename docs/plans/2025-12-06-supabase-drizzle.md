# Supabase + Drizzle Integration Plan

## Overview

This plan outlines the integration of Supabase with Drizzle ORM for managing database schema and migrations, while using the Supabase JavaScript client (`@supabase/supabase-js`) for all client-side database operations. There is no staging/testing environment - only Production.

---

## Phase 0: Creating Your Supabase Project (Step-by-Step Guide)

This section walks you through creating a Supabase project and finding all the credentials you need.

### Step 0.1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up using:
   - GitHub account (recommended - fastest)
   - Email and password
4. Verify your email if required

### Step 0.2: Create a New Project

1. Once logged in, you'll see the Supabase Dashboard
2. Click **"New Project"** button
3. Fill in the project details:
   - **Organization**: Select your organization (or create one if first time)
   - **Project name**: `aiffirmation-proto` (or any name you prefer)
   - **Database Password**: Generate a strong password and **SAVE IT SOMEWHERE SAFE** - you'll need this for the `DATABASE_URL`
   - **Region**: Choose the closest region to your users (e.g., `East US`, `West EU`, etc.)
   - **Pricing Plan**: Free tier is sufficient for prototyping
4. Click **"Create new project"**
5. Wait 1-2 minutes for the project to be provisioned

### Step 0.3: Find Your API Keys (for Browser Client)

Once your project is ready:

1. In the left sidebar, click **"Project Settings"** (gear icon at bottom)
2. Click **"API"** in the settings menu
3. You'll see the **API Settings** page with:

#### Project URL
```
https://xxxxxxxxxxxx.supabase.co
```
This is your `NEXT_PUBLIC_SUPABASE_URL`

#### Project API Keys

| Key Name | Description | Use In Browser? |
|----------|-------------|-----------------|
| `anon` / `public` | Public key for anonymous access | **YES** - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` | Admin key with full access | **NEVER** - Keep this secret! |

**Copy the `anon` key** - this is safe to expose in browser code when combined with Row Level Security.

### Step 0.4: Find Your Database Connection String (for Drizzle Migrations)

1. In the left sidebar, click **"Project Settings"** (gear icon)
2. Click **"Database"** in the settings menu
3. Scroll down to the **"Connection string"** section
4. You'll see several connection options:

#### URI Format (Recommended for Drizzle)
Use the direct/session connection for migrations (with TLS):
```
postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres?sslmode=require
```

#### Alternative: Transaction Pooler (only if needed)
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
```

### Step 0.5: Understanding the Connection Options

| Connection Type | Port | Use Case | Drizzle Setting |
|----------------|------|----------|-----------------|
| **Direct/Session** | 5432 | Migrations and schema changes | `prepare: true` (default) |
| **Pooler - Transaction** | 6543 | Only if required for app runtime | `prepare: false` |

For this project, use **Direct/Session (5432)** for Drizzle migrations. Runtime access uses the Supabase JS client from the browser with the anon key.

### Step 0.6: Create Your `.env.local` File

In your project root (`C:\git\aiffirmation-proto\`), create a file named `.env.local`:

```env
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================

# Browser-safe keys (exposed to client via NEXT_PUBLIC_ prefix)
# Found in: Project Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Found in: Project Settings > API > Project API Keys > anon/public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# DATABASE CONNECTION (for Drizzle migrations only)
# ===========================================

# Found in: Project Settings > Database > Connection string > URI
# IMPORTANT: Replace [YOUR-PASSWORD] with your actual database password!
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres?sslmode=require
```

### Step 0.7: Verify `.gitignore` Includes Environment Files

Check that your `.gitignore` file contains:

```gitignore
# Environment files
.env
.env.local
.env.*.local
```

This prevents your credentials from being committed to git.

### Step 0.8: Quick Reference Card

After setup, you should have these three values:

| Variable | Where to Find | Example Format |
|----------|---------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings > API > Project URL | `https://abc123xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings > API > anon key | `eyJhbGciOiJIUzI1...` (long JWT) |
| `DATABASE_URL` | Project Settings > Database > URI | `postgresql://postgres...?...sslmode=require` |

### Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Double-check you copied the full `anon` key (it's long!) |
| "Connection refused" | Check your DATABASE_URL password is correct |
| "Prepared statement already exists" | Ensure `prepare: false` is set in Drizzle config |
| "Permission denied" | Not expected in this prototype (RLS disabled). If you later enable RLS, add a permissive policy. |

---

## Architecture Decision

**Two-Tool Approach:**
1. **Drizzle ORM + Drizzle Kit**: Schema definition, migrations, and seeding (CLI/development time)
2. **Supabase JS Client**: Runtime database operations directly from the browser (no server API intermediaries)

This approach gives you:
- Type-safe schema definitions with Drizzle
- CLI-based migration management
- Direct client-to-Supabase connections (RLS optional; disabled for this prototype)
- No need for Next.js API routes as database intermediaries

---

## Phase 1: Install Dependencies

### NPM Packages to Install

```bash
# Drizzle for schema/migrations (dev-time only)
npm install drizzle-orm postgres dotenv
npm install -D drizzle-kit tsx

# Supabase client for runtime browser operations
npm install @supabase/supabase-js
```

### Package Purposes
| Package | Purpose |
|---------|---------|
| `drizzle-orm` | ORM for type-safe schema definitions |
| `drizzle-kit` | CLI tool for generating and running migrations |
| `postgres` | PostgreSQL driver for Drizzle migrations |
| `dotenv` | Environment variable loading for migration scripts |
| `tsx` | TypeScript execution for seed scripts |
| `@supabase/supabase-js` | Browser-side database client |

---

## Phase 2: Project Structure

Create the following directory structure:

```
aiffirmation-proto/
├── src/
│   └── db/
│       ├── schema.ts          # Drizzle schema definitions
│       ├── index.ts           # Drizzle client (for migrations only)
│       └── seed.ts            # Database seeding script
├── drizzle/                   # Generated migration files (auto-created)
├── drizzle.config.ts          # Drizzle Kit configuration
├── lib/
│   └── supabase/
│       └── client.ts          # Supabase browser client
└── .env.local                 # Environment variables (gitignored)
```

---

## Phase 3: Environment Configuration

### Create `.env.local` (for local development and production)

```env
# Supabase Public Keys (safe to expose in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Connection String (for migrations ONLY - never exposed to browser)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Important Security Notes
- `NEXT_PUBLIC_*` variables are exposed to the browser; for this prototype we accept full access with the anon key
- `DATABASE_URL` is for Drizzle migrations only (runs on your machine, never in browser)
- Never expose the `service_role` key to the browser

---

## Phase 4: Drizzle Configuration

### Create `drizzle.config.ts`

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Phase 5: Schema Definition - Key Value Store

### Create `src/db/schema.ts`

```typescript
import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

// Key-Value Store Table
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

---

## Phase 6: Drizzle Client (for Migrations)

### Create `src/db/index.ts`

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This client is ONLY for migrations and seeding
// It should never be used in browser code
const connectionString = process.env.DATABASE_URL!;

// Using direct/session connection; keep prepared statements on
const client = postgres(connectionString, { prepare: true });
export const db = drizzle(client, { schema });
```

---

## Phase 7: Supabase Browser Client

### Create `lib/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe helper for KV Store operations
export type KVStoreRow = {
  id: string;
  key: string;
  value: unknown;
  created_at: string;
  updated_at: string;
};
```

---

## Phase 8: Package.json Scripts

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

### Script Purposes
| Script | Purpose |
|--------|---------|
| `db:generate` | Generate SQL migration files from schema changes |
| `db:migrate` | Apply pending migrations to database |
| `db:push` | Push schema directly (no migration files - good for prototyping) |
| `db:studio` | Open Drizzle Studio GUI for database browsing |
| `db:seed` | Run seed script to populate demo data |

---

## Phase 9: Seed Script with Demo Data

### Create `src/db/seed.ts`

```typescript
import 'dotenv/config';
import { db } from './index';
import { kvStore } from './schema';

const demoData = [
  {
    key: 'app.settings.theme',
    value: { mode: 'system', accentColor: '#6366f1' },
  },
  {
    key: 'app.settings.notifications',
    value: { email: true, push: false, frequency: 'daily' },
  },
  {
    key: 'app.feature_flags',
    value: { darkMode: true, betaFeatures: false, analytics: true },
  },
  {
    key: 'user.preferences.dashboard',
    value: { layout: 'grid', showStats: true, refreshInterval: 30 },
  },
  {
    key: 'system.maintenance',
    value: { enabled: false, message: null, scheduledAt: null },
  },
];

async function seed() {
  console.log('Seeding database...');

  for (const entry of demoData) {
    await db
      .insert(kvStore)
      .values(entry)
      .onConflictDoUpdate({
        target: kvStore.key,
        set: { value: entry.value, updatedAt: new Date() },
      });
    console.log(`  Inserted/Updated: ${entry.key}`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
```

---

## Phase 10: Access Policy (Prototype)

For this prototype, we are intentionally **not** enabling RLS and are allowing full access from the browser using the anon key. This keeps setup minimal but means all data is readable and writable by anyone with the key. If you later want protection, enable RLS and add per-action policies.

---

## Phase 11: Settings Page - KV Store Viewer with Diagnostic Checks

The settings page will perform a series of progressive checks to help you debug the Supabase integration. Each check builds on the previous one, so you can see exactly where the integration breaks (if anywhere) and fix it step by step.

### Diagnostic Check Sequence

The page will run these checks in order:

| # | Check | What It Tests | Pass Criteria |
|---|-------|---------------|---------------|
| 1 | **Environment Variables** | `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are defined | Both variables exist and are non-empty |
| 2 | **Supabase Client Creation** | Can create Supabase client instance | No error thrown during `createClient()` |
| 3 | **Network Connectivity** | Can reach Supabase server | Successful HTTP response from Supabase |
| 4 | **Authentication** | API key is valid | No "Invalid API key" error |
| 5 | **Table Existence** | `kv_store` table exists | Table found in database |
| 6 | **Data Query** | Can fetch rows from table | Query returns data array |

### Update Navigation (`nav.config.ts`)

Add a "Store" child under Settings:

```typescript
{
  label: "Settings",
  href: "/settings",
  children: [
    { label: "Profile", href: "/settings/profile" },
    { label: "Team", href: "/settings/team" },
    { label: "Store", href: "/settings/store" },  // NEW
  ],
},
```

### Create `app/settings/store/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase, type KVStoreRow } from '@/lib/supabase/client';

type CheckStatus = 'pending' | 'running' | 'pass' | 'fail';

type DiagnosticCheck = {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  message?: string;
};

const initialChecks: DiagnosticCheck[] = [
  {
    id: 'env',
    name: 'Environment Variables',
    description: 'Check if NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set',
    status: 'pending',
  },
  {
    id: 'client',
    name: 'Supabase Client',
    description: 'Create Supabase client instance',
    status: 'pending',
  },
  {
    id: 'connection',
    name: 'Network Connection',
    description: 'Test connectivity to Supabase server',
    status: 'pending',
  },
  {
    id: 'auth',
    name: 'API Key Valid',
    description: 'Verify the anon key is accepted',
    status: 'pending',
  },
  {
    id: 'table',
    name: 'Table Exists',
    description: 'Check if kv_store table exists',
    status: 'pending',
  },
  {
    id: 'query',
    name: 'Data Query',
    description: 'Fetch rows from kv_store table',
    status: 'pending',
  },
];

export default function StorePage() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>(initialChecks);
  const [entries, setEntries] = useState<KVStoreRow[]>([]);
  const [allPassed, setAllPassed] = useState(false);

  const updateCheck = (id: string, status: CheckStatus, message?: string) => {
    setChecks((prev) =>
      prev.map((check) =>
        check.id === id ? { ...check, status, message } : check
      )
    );
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    // Check 1: Environment Variables
    updateCheck('env', 'running');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      updateCheck('env', 'fail', `Missing: ${!url ? 'SUPABASE_URL' : ''} ${!key ? 'ANON_KEY' : ''}`);
      return;
    }
    updateCheck('env', 'pass', `URL: ${url.substring(0, 30)}...`);

    // Check 2: Client Creation
    updateCheck('client', 'running');
    try {
      if (!supabase) throw new Error('Client is null');
      updateCheck('client', 'pass', 'Client created successfully');
    } catch (err) {
      updateCheck('client', 'fail', `Failed: ${err}`);
      return;
    }

    // Check 3: Network Connection (health endpoint avoids 404 noise)
    updateCheck('connection', 'running');
    try {
      const response = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      updateCheck('connection', 'pass', `Connected (${response.status})`);
    } catch (err) {
      updateCheck('connection', 'fail', `Network error: ${err}`);
      return;
    }

    // Check 4: API Key Validation
    updateCheck('auth', 'running');
    const { error: authError } = await supabase.from('_dummy_').select('*').limit(1);
    // Note: We expect "relation does not exist" error, NOT "Invalid API key"
    if (authError?.message?.includes('Invalid API key')) {
      updateCheck('auth', 'fail', 'Invalid API key');
      return;
    }
    updateCheck('auth', 'pass', 'API key accepted');

    // Check 5: Table Existence
    updateCheck('table', 'running');
    const { error: tableError } = await supabase.from('kv_store').select('id').limit(1);
    if (tableError?.message?.includes('does not exist') ||
        tableError?.message?.includes('relation') ||
        tableError?.code === '42P01') {
      updateCheck('table', 'fail', 'Table kv_store not found. Run: npm run db:push');
      return;
    }
    updateCheck('table', 'pass', 'Table kv_store exists');

    // Check 6: Data Query
    updateCheck('query', 'running');
    const { data, error: queryError } = await supabase
      .from('kv_store')
      .select('*')
      .order('key');

    if (queryError) {
      updateCheck('query', 'fail', `Query failed: ${queryError.message}`);
      return;
    }

    const rowCount = data?.length ?? 0;
    updateCheck('query', 'pass', `Found ${rowCount} entries`);
    setEntries(data ?? []);
    setAllPassed(true);
  }

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'pending': return '○';
      case 'running': return '◐';
      case 'pass': return '●';
      case 'fail': return '✕';
    }
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'running': return 'text-blue-500';
      case 'pass': return 'text-green-500';
      case 'fail': return 'text-red-500';
    }
  };

  const passedCount = checks.filter((c) => c.status === 'pass').length;
  const totalCount = checks.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supabase Integration Status</h1>
        <p className="text-gray-500 mt-1">
          Diagnostic checks for database connectivity and KV Store
        </p>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Integration Progress</span>
          <span className={allPassed ? 'text-green-500' : 'text-gray-500'}>
            {passedCount}/{totalCount} checks passed
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              allPassed ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(passedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Diagnostic Checks */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium w-12">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Check</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {checks.map((check) => (
              <tr key={check.id}>
                <td className={`px-4 py-3 text-xl ${getStatusColor(check.status)}`}>
                  {getStatusIcon(check.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-gray-500">{check.description}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {check.message && (
                    <code className={`text-xs ${getStatusColor(check.status)}`}>
                      {check.message}
                    </code>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KV Store Data (only shown when all checks pass) */}
      {allPassed && (
        <>
          <h2 className="text-xl font-bold mt-8">Key-Value Store Contents</h2>

          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              No entries in the store. Run <code>npm run db:seed</code> to add demo data.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Key</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-sm">{entry.key}</td>
                      <td className="px-4 py-3">
                        <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto max-w-md">
                          {JSON.stringify(entry.value, null, 2)}
                        </pre>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(entry.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Help section when checks fail */}
      {!allPassed && checks.some((c) => c.status === 'fail') && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
            How to Fix
          </h3>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {checks.find((c) => c.id === 'env' && c.status === 'fail') && (
              <li>• Create <code>.env.local</code> with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            )}
            {checks.find((c) => c.id === 'connection' && c.status === 'fail') && (
              <li>• Check your internet connection and verify the Supabase URL is correct</li>
            )}
            {checks.find((c) => c.id === 'auth' && c.status === 'fail') && (
              <li>• Verify your anon key is copied correctly from Supabase dashboard</li>
            )}
            {checks.find((c) => c.id === 'table' && c.status === 'fail') && (
              <li>• Run <code>npm run db:push</code> to create the kv_store table</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### What the Diagnostic Page Shows

**When things are working:**
- Progress bar fills to 100% green
- All checks show green dots (●)
- KV Store table appears below with your data

**When something is broken:**
- Progress bar shows how far you got (blue partial fill)
- Failed check shows red X (✕) with error message
- "How to Fix" section appears with specific remediation steps
- Subsequent checks remain pending (○)

This allows you to:
1. Start with no configuration and see what's missing
2. Fix issues one at a time
3. Refresh the page to see your progress
4. Know exactly when everything is working

---

## Phase 12: Workflow Summary

### Initial Setup (One-time)
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Copy connection string and API keys to `.env.local`
3. Run `npm run db:push` to create tables
4. Run `npm run db:seed` to populate demo data

### Ongoing Development
- Modify `src/db/schema.ts` when you need new tables/columns
- Run `npm run db:generate` to create migration files
- Run `npm run db:migrate` to apply migrations
- Use `npm run db:studio` to browse data visually

### CLI Commands Reference
```bash
npm run db:generate   # Schema changed? Generate migration
npm run db:migrate    # Apply migrations to Supabase
npm run db:push       # Quick push (no migration files)
npm run db:seed       # Populate demo data
npm run db:studio     # Visual database browser
```

---

## File Checklist

| File | Purpose | Status |
|------|---------|--------|
| `drizzle.config.ts` | Drizzle Kit configuration | To create |
| `src/db/schema.ts` | Table definitions | To create |
| `src/db/index.ts` | Drizzle client for migrations | To create |
| `src/db/seed.ts` | Demo data seeding | To create |
| `lib/supabase/client.ts` | Browser Supabase client | To create |
| `app/settings/store/page.tsx` | KV Store viewer page | To create |
| `nav.config.ts` | Add Store nav item | To modify |
| `package.json` | Add db scripts | To modify |
| `.env.local` | Environment variables | To create |
| `.gitignore` | Ensure .env.local ignored | To verify |

---

## Sources

- [Drizzle ORM with Supabase Database](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase)
- [Drizzle | Supabase Docs](https://supabase.com/docs/guides/database/drizzle)
- [Drizzle ORM - PostgreSQL/Supabase](https://orm.drizzle.team/docs/get-started/supabase-new)
- [Drizzle ORM - Supabase Connection](https://orm.drizzle.team/docs/connect-supabase)
- [Drizzle ORM - Seed Overview](https://orm.drizzle.team/docs/seed-overview)
- [Drizzle ORM - Custom Migrations](https://orm.drizzle.team/docs/kit-custom-migrations)
