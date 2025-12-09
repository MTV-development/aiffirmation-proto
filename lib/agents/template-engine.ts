'use client';

import { Liquid } from 'liquidjs';
import { supabase } from '@/lib/supabase/client';

const liquid = new Liquid();

type TemplateVariables = Record<string, unknown>;

type RenderOptions = {
  /** The key name to render (e.g., "prompt" or "system") */
  key: string;
  /** The version/agent ID (e.g., "af-01") */
  version: string;
  /** The implementation name (e.g., "default" or "tst2") */
  implementation?: string;
  /** Additional variables to pass to the template */
  variables?: TemplateVariables;
};

type RenderResult = {
  /** The rendered output string */
  output: string;
  /** All variables that were available during rendering */
  variables: TemplateVariables;
};

/**
 * Render a template from the KV store with Liquid substitution (client-side).
 */
export async function renderTemplate(options: RenderOptions): Promise<RenderResult> {
  const { key, version, implementation = 'default', variables = {} } = options;

  // Fetch all entries for this version/implementation
  const prefix = `versions.${version}.`;
  const suffix = `.${implementation}`;
  const pattern = `${prefix}%${suffix}`;

  const { data: results, error } = await supabase
    .from('kv_store')
    .select('key, value')
    .like('key', pattern);

  if (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  // Build variables from KV entries
  const kvVariables: TemplateVariables = {};
  let templateText: string | null = null;

  for (const row of results || []) {
    // Extract key name: "versions.af-01.prompt.default" -> "prompt"
    const fullKey = row.key;
    const keyName = fullKey.replace(prefix, '').replace(suffix, '');

    const value = row.value as { text?: string; [k: string]: unknown } | null;

    if (value?.text !== undefined) {
      kvVariables[keyName] = value.text;

      // If this is the key we want to render, save the template
      if (keyName === key) {
        templateText = value.text;
      }
    } else if (value !== null) {
      // Non-text values are added as-is
      kvVariables[keyName] = value;
    }
  }

  if (!templateText) {
    throw new Error(`Template not found: versions.${version}.${key}.${implementation}`);
  }

  // Merge variables: provided variables take precedence over KV variables
  const mergedVariables: TemplateVariables = {
    ...kvVariables,
    ...variables,
  };

  // Multi-pass render until output stabilizes
  const MAX_RENDER_DEPTH = 10;
  let output = templateText;
  let previousOutput = '';
  let depth = 0;

  while (output !== previousOutput) {
    if (depth >= MAX_RENDER_DEPTH) {
      throw new Error(
        `Template render exceeded max depth of ${MAX_RENDER_DEPTH}. ` +
        `Possible infinite loop in template: versions.${version}.${key}.${implementation}`
      );
    }
    previousOutput = output;
    output = await liquid.parseAndRender(output, mergedVariables);
    depth++;
  }

  return {
    output,
    variables: mergedVariables,
  };
}

/**
 * Get the model name for an agent implementation from the KV store
 */
export async function getModelName(
  version: string,
  implementation: string = 'default'
): Promise<string | null> {
  const key = `versions.${version}._model_name.${implementation}`;

  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', key)
    .limit(1)
    .single();

  if (error || !data) {
    // Fall back to default if implementation-specific model not found
    if (implementation !== 'default') {
      return getModelName(version, 'default');
    }
    return null;
  }

  const value = data.value as { text?: string } | null;
  return value?.text ?? null;
}

/**
 * Get implementations for an agent version
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
