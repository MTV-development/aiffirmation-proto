'use client';

import { supabase } from '@/lib/supabase/client';

/**
 * Get implementations for an agent version (client-side).
 * Used by implementation selector UI components.
 */
export async function getImplementations(version: string): Promise<string[]> {
  const prefix = `versions.${version}.system.`;

  const { data, error } = await supabase
    .from('kv_store')
    .select('key')
    .like('key', `${prefix}%`);

  if (error || !data) {
    return ['default'];
  }

  const implementations = data.map(r => r.key.replace(prefix, ''));

  // Ensure 'default' is always first
  const sorted = implementations.sort((a, b) => {
    if (a === 'default') return -1;
    if (b === 'default') return 1;
    return a.localeCompare(b);
  });

  return sorted.length > 0 ? sorted : ['default'];
}
