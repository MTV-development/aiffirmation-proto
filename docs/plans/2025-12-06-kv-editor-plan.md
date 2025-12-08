# 2025-12-06 KV Store Editor Implementation Plan

## Concept Overview

The KV store uses a **three-level hierarchical key structure**:

```
{version}.{key-name}.{implementation}
```

**Examples:**
- `v1.start.default` - Version 1, "start" key, default implementation
- `v1.prompt.default` - Version 1, "prompt" key, default implementation
- `v1.prompt.experimental` - Version 1, "prompt" key, experimental implementation
- `v2.system.default` - Version 2, "system" key, default implementation

**Key Rules:**
1. Every version MUST have a `.default` implementation
2. Additional implementations can exist alongside default
3. All operations go directly to the database (no caching)

## User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  KV Store Editor                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Version: [▼ v1        ]    Implementation: [▼ default    ] [+ New] │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Key: start                                              [✏ Edit]││
│  │ Value: { "message": "Welcome", "enabled": true }                ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Key: prompt                                             [✏ Edit]││
│  │ Value: { "template": "Hello {{name}}", ... }                    ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Key: system                                             [✏ Edit]││
│  │ Value: { "instructions": "...", "model": "gpt-4" }              ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Create KV Service Module

**File:** `lib/kv/service.ts`

A service module that encapsulates all KV store operations:

```typescript
// Types
type ParsedKey = {
  version: string;
  keyName: string;
  implementation: string;
};

// Core functions:
- parseKey(fullKey: string): ParsedKey
- buildKey(version: string, keyName: string, implementation: string): string
- getAllKeys(): Promise<string[]>
- getUniqueVersions(keys: string[]): string[]
- getImplementationsForVersion(keys: string[], version: string): string[]
- getEntriesForVersionAndImplementation(version: string, implementation: string): Promise<KVEntry[]>
- updateEntry(id: string, value: unknown): Promise<void>
- createImplementation(version: string, sourceImpl: string, newImplName: string): Promise<void>
```

### Step 2: Update Seed Data

**File:** `src/db/seed.ts`

Replace current seed data with hierarchical keys. Start with minimal seed data:

```typescript
const demoData = [
  // Version 1 - Default implementation
  { key: 'v1.prompt1.default', value: { text: 'this is the default prompt' } },
];
```

### Step 3: Create Editor Page

**File:** `app/settings/store/edit/page.tsx`

Main editor page with:
- Version dropdown (populated from detected versions)
- Implementation dropdown (populated based on selected version)
- "Create New Implementation" button
- List of key-value entries with edit buttons

### Step 4: Create UI Components

**Files in:** `components/kv-editor/`

1. **`version-selector.tsx`** - Dropdown for selecting version
2. **`implementation-selector.tsx`** - Dropdown for selecting implementation + new button
3. **`kv-entry-card.tsx`** - Display card for each key-value pair
4. **`kv-entry-editor.tsx`** - Modal/inline editor for editing values
5. **`create-implementation-dialog.tsx`** - Dialog for creating new implementation

### Step 5: Add Navigation

**File:** `nav.config.ts`

Add "Edit" as a child under Settings > Store:

```typescript
{
  label: "Settings",
  href: "/settings",
  children: [
    { label: "Profile", href: "/settings/profile" },
    { label: "Team", href: "/settings/team" },
    { label: "Store", href: "/settings/store" },
    { label: "KV Editor", href: "/settings/store/edit" },  // NEW
  ],
},
```

## Detailed Component Specifications

### KV Service (`lib/kv/service.ts`)

```typescript
import { supabase, KVStoreRow } from '@/lib/supabase/client';

export type ParsedKey = {
  version: string;
  keyName: string;
  implementation: string;
};

export type KVEntry = KVStoreRow & {
  parsed: ParsedKey;
};

// Parse a full key like "v1.prompt.default" into parts
export function parseKey(fullKey: string): ParsedKey | null {
  const parts = fullKey.split('.');
  if (parts.length !== 3) return null;
  return {
    version: parts[0],
    keyName: parts[1],
    implementation: parts[2],
  };
}

// Build a full key from parts
export function buildKey(version: string, keyName: string, implementation: string): string {
  return `${version}.${keyName}.${implementation}`;
}

// Fetch all keys from the store
export async function getAllKeys(): Promise<string[]> {
  const { data, error } = await supabase
    .from('kv_store')
    .select('key')
    .order('key');

  if (error) throw error;
  return data?.map(row => row.key) ?? [];
}

// Extract unique versions from keys
export function getUniqueVersions(keys: string[]): string[] {
  const versions = new Set<string>();
  for (const key of keys) {
    const parsed = parseKey(key);
    if (parsed) versions.add(parsed.version);
  }
  return Array.from(versions).sort();
}

// Get implementations for a specific version
export function getImplementationsForVersion(keys: string[], version: string): string[] {
  const implementations = new Set<string>();
  for (const key of keys) {
    const parsed = parseKey(key);
    if (parsed && parsed.version === version) {
      implementations.add(parsed.implementation);
    }
  }
  // Ensure 'default' is always first
  const result = Array.from(implementations).sort();
  const defaultIndex = result.indexOf('default');
  if (defaultIndex > 0) {
    result.splice(defaultIndex, 1);
    result.unshift('default');
  }
  return result;
}

// Fetch all entries for a version/implementation combo
export async function getEntriesForVersionAndImplementation(
  version: string,
  implementation: string
): Promise<KVEntry[]> {
  const pattern = `${version}.%.${implementation}`;

  const { data, error } = await supabase
    .from('kv_store')
    .select('*')
    .like('key', pattern.replace('%', '%'))
    .order('key');

  if (error) throw error;

  return (data ?? []).map(row => ({
    ...row,
    parsed: parseKey(row.key)!,
  }));
}

// Update a single entry's value
export async function updateEntry(id: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('kv_store')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// Create a new implementation by copying from source
export async function createImplementation(
  version: string,
  sourceImplementation: string,
  newImplementationName: string
): Promise<void> {
  // Fetch all entries for the source implementation
  const sourceEntries = await getEntriesForVersionAndImplementation(version, sourceImplementation);

  // Create new entries with the new implementation name
  const newEntries = sourceEntries.map(entry => ({
    key: buildKey(version, entry.parsed.keyName, newImplementationName),
    value: entry.value,
  }));

  const { error } = await supabase
    .from('kv_store')
    .insert(newEntries);

  if (error) throw error;
}
```

### Editor Page State Flow

```
1. Page loads
   ↓
2. Fetch all keys from DB
   ↓
3. Extract unique versions → populate version dropdown
   ↓
4. User selects version (or default to first)
   ↓
5. Extract implementations for version → populate implementation dropdown
   ↓
6. User selects implementation (default to "default")
   ↓
7. Fetch entries matching version + implementation
   ↓
8. Display entries as editable cards
```

### Create Implementation Flow

```
1. User clicks "+ New Implementation"
   ↓
2. Dialog opens with:
   - Text input for new name
   - Dropdown to select source implementation (default selected)
   ↓
3. User enters name and confirms
   ↓
4. Service copies all keys from source → new implementation
   ↓
5. Refresh keys list
   ↓
6. Auto-select new implementation in dropdown
```

## File Structure After Implementation

```
aiffirmation-proto/
├── lib/
│   ├── kv/
│   │   └── service.ts           # KV service module (NEW)
│   └── supabase/
│       └── client.ts            # Existing Supabase client
├── components/
│   └── kv-editor/
│       ├── version-selector.tsx       # (NEW)
│       ├── implementation-selector.tsx # (NEW)
│       ├── kv-entry-card.tsx          # (NEW)
│       ├── kv-entry-editor.tsx        # (NEW)
│       └── create-implementation-dialog.tsx # (NEW)
├── app/
│   └── settings/
│       └── store/
│           ├── page.tsx         # Existing diagnostics page
│           └── edit/
│               └── page.tsx     # New editor page (NEW)
├── src/db/
│   └── seed.ts                  # Updated with hierarchical data
└── nav.config.ts                # Updated with new route
```

## Edge Cases to Handle

1. **No data exists** - Show empty state with instructions
2. **Invalid keys** (not 3-part) - Filter them out or show warning
3. **Creating duplicate implementation** - Show error
4. **Empty implementation name** - Validate input
5. **Network errors** - Show error states with retry option
6. **Concurrent edits** - Consider optimistic updates with conflict handling

## Testing Checklist

- [ ] Version dropdown populates correctly
- [ ] Implementation dropdown updates when version changes
- [ ] Default implementation always appears first
- [ ] Entries display correctly for selected version/implementation
- [ ] Edit modal opens and saves changes
- [ ] Create implementation dialog works
- [ ] New implementation copies all keys correctly
- [ ] Auto-selects new implementation after creation
- [ ] Error states display appropriately
- [ ] Loading states during async operations
