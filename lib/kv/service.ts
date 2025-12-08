import { supabase, type KVStoreRow } from '@/lib/supabase/client';

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
  const { data, error } = await supabase
    .from('kv_store')
    .select('*')
    .like('key', `${version}.%.${implementation}`)
    .order('key');

  if (error) throw error;

  return (data ?? [])
    .map(row => {
      const parsed = parseKey(row.key);
      if (!parsed) return null;
      return { ...row, parsed };
    })
    .filter((entry): entry is KVEntry => entry !== null);
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

  if (sourceEntries.length === 0) {
    throw new Error(`No entries found for ${version}.*.${sourceImplementation}`);
  }

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
