import { Liquid } from 'liquidjs';
import { db } from '@/src/db';
import { kvStore } from '@/src/db/schema';
import { sql } from 'drizzle-orm';

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
 * Render a template from the KV store with Liquid substitution.
 *
 * 1. Fetches all entries for the given version/implementation
 * 2. Builds a variables dictionary from KV entries (key name -> text value)
 * 3. Merges with provided variables (provided variables take precedence)
 * 4. Renders the specified key's template with Liquid
 *
 * @example
 * ```ts
 * const result = await renderTemplate({
 *   key: 'prompt',
 *   version: 'af-01',
 *   implementation: 'default',
 *   variables: { themes: ['Self-confidence', 'Gratitude'] }
 * });
 * // result.output = "Generate affirmations for: Self-confidence, Gratitude."
 * ```
 */
export async function renderTemplate(options: RenderOptions): Promise<RenderResult> {
  const { key, version, implementation = 'default', variables = {} } = options;

  // Fetch all entries for this version/implementation
  const prefix = `versions.${version}.`;
  const suffix = `.${implementation}`;

  const results = await db
    .select()
    .from(kvStore)
    .where(sql`${kvStore.key} LIKE ${prefix + '%' + suffix}`);

  // Build variables from KV entries
  const kvVariables: TemplateVariables = {};
  let templateText: string | null = null;

  for (const row of results) {
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

  // Multi-pass render until output stabilizes:
  // Each pass may substitute variables that contain Liquid tags,
  // which then need to be evaluated in subsequent passes.
  // Max depth of 10 to prevent infinite loops.
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
 * Get just the text value of a key without rendering.
 * Useful for fetching system prompts that don't need substitution.
 */
export async function getTemplateText(
  key: string,
  version: string,
  implementation: string = 'default'
): Promise<string | null> {
  const fullKey = `versions.${version}.${key}.${implementation}`;

  const results = await db
    .select()
    .from(kvStore)
    .where(sql`${kvStore.key} = ${fullKey}`)
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const value = results[0].value as { text?: string } | null;
  return value?.text ?? null;
}
