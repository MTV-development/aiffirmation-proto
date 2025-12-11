'use server';

import { createGoodTenAgent } from '@/src/mastra/agents/ag-good-ten';
import { renderTemplate, getAgentModelName, getKVText } from '@/src/services';

type GenerateOptions = {
  themes: string[];
  additionalContext?: string;
  implementation?: string;
};

type GenerateResult = {
  affirmations: string;
  model: string;
};

/**
 * Server action to generate affirmations using GT-01 Mastra agent.
 * Runs server-side with full access to Mastra features.
 */
export async function generateAffirmationsGT01(options: GenerateOptions): Promise<GenerateResult> {
  const { themes, additionalContext, implementation = 'default' } = options;

  if (!themes || themes.length === 0) {
    throw new Error('At least one theme is required');
  }

  // Build template variables
  const templateVariables = {
    themes,
    themeCount: themes.length,
    additionalContext: additionalContext?.trim() || null,
  };

  // Render user prompt from KV store
  const { output: userPrompt } = await renderTemplate({
    key: 'prompt',
    version: 'gt-01',
    implementation,
    variables: templateVariables,
  });

  // Get temperature from KV store (with fallback)
  const temperatureKey = `versions.gt-01._temperature.${implementation}`;
  const temperatureStr = await getKVText(temperatureKey);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.8;

  // Create agent with KV-configured system prompt
  const agent = await createGoodTenAgent(implementation);

  // Get model name for response
  const modelName = await getAgentModelName('gt-01', implementation);

  console.log('[gt-01] Implementation:', implementation);
  console.log('[gt-01] Model:', modelName || 'env default');
  console.log('[gt-01] Temperature:', temperature);
  console.log('[gt-01] User prompt:', userPrompt);

  // Generate with Mastra agent
  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  console.log('[gt-01] Response:', result.text);

  return {
    affirmations: result.text,
    model: modelName || 'default',
  };
}
