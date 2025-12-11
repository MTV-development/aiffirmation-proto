'use server';

import { createGoodTenV2Agent } from '@/src/mastra/agents/ag-good-ten-v2';
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
 * Server action to generate affirmations using Mastra agent.
 * Runs server-side with full access to Mastra features.
 */
export async function generateAffirmationsV2(options: GenerateOptions): Promise<GenerateResult> {
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
    version: 'gt-02',
    implementation,
    variables: templateVariables,
  });

  // Get temperature from KV store (with fallback)
  const temperatureKey = `versions.gt-02._temperature.${implementation}`;
  const temperatureStr = await getKVText(temperatureKey);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.8;

  // Create agent with KV-configured system prompt
  const agent = await createGoodTenV2Agent(implementation);

  // Get model name for response
  const modelName = await getAgentModelName('gt-02', implementation);

  console.log('[gt-02] Implementation:', implementation);
  console.log('[gt-02] Model:', modelName || 'env default');
  console.log('[gt-02] Temperature:', temperature);
  console.log('[gt-02] User prompt:', userPrompt);

  // Generate with Mastra agent
  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  console.log('[gt-02] Response:', result.text);

  return {
    affirmations: result.text,
    model: modelName || 'default',
  };
}
