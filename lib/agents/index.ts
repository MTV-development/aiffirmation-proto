'use client';

export { generate } from './openrouter-client';
export { renderTemplate, getModelName, getImplementations } from './template-engine';

import { generate } from './openrouter-client';
import { renderTemplate, getModelName } from './template-engine';

type GenerateAffirmationsOptions = {
  /** Agent version (e.g., 'af-01' or 'gt-01') */
  version: string;
  /** Selected themes */
  themes: string[];
  /** Optional additional context from user */
  additionalContext?: string;
  /** Implementation to use (default: 'default') */
  implementation?: string;
};

type GenerateAffirmationsResult = {
  affirmations: string;
  model: string;
};

/**
 * Generate affirmations using the specified agent configuration.
 * This is a pure client-side implementation that:
 * 1. Fetches templates from Supabase KV store
 * 2. Renders them with Liquid templating
 * 3. Calls OpenRouter API directly
 */
export async function generateAffirmations(
  options: GenerateAffirmationsOptions
): Promise<GenerateAffirmationsResult> {
  const { version, themes, additionalContext, implementation = 'default' } = options;

  if (!themes || themes.length === 0) {
    throw new Error('At least one theme is required');
  }

  const userVariables = {
    themes,
    themeCount: themes.length,
    additionalContext: additionalContext?.trim() || null,
  };

  // Render system prompt and user prompt using template engine
  const { output: systemPrompt } = await renderTemplate({
    key: 'system',
    version,
    implementation,
    variables: userVariables,
  });

  const { output: userPrompt } = await renderTemplate({
    key: 'prompt',
    version,
    implementation,
    variables: userVariables,
  });

  // Get model name from KV store
  const modelName = await getModelName(version, implementation);

  console.log(`[${version}] Implementation:`, implementation);
  console.log(`[${version}] Model:`, modelName || 'env default');
  console.log(`[${version}] System prompt:`, systemPrompt.substring(0, 200) + '...');
  console.log(`[${version}] User prompt:`, userPrompt);

  // Generate using OpenRouter
  const result = await generate({
    systemPrompt,
    userPrompt,
    model: modelName || undefined,
  });

  return {
    affirmations: result.text,
    model: modelName || 'default',
  };
}
