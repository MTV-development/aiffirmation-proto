'use server';

import { createAF01Agent } from '@/src/mastra/agents/ag-aff-01';
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
 * Server action to generate affirmations using AF-01 Mastra agent.
 * Runs server-side with full access to Mastra features.
 */
export async function generateAffirmationsAF01(options: GenerateOptions): Promise<GenerateResult> {
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
    version: 'af-01',
    implementation,
    variables: templateVariables,
  });

  // Get temperature from KV store (with fallback)
  const temperatureKey = `versions.af-01._temperature.${implementation}`;
  const temperatureStr = await getKVText(temperatureKey);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.8;

  // Create agent with KV-configured system prompt
  const agent = await createAF01Agent(implementation);

  // Get model name for response
  const modelName = await getAgentModelName('af-01', implementation);

  console.log('[af-01] Implementation:', implementation);
  console.log('[af-01] Model:', modelName || 'env default');
  console.log('[af-01] Temperature:', temperature);
  console.log('[af-01] User prompt:', userPrompt);

  // Generate with Mastra agent
  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  console.log('[af-01] Response:', result.text);

  return {
    affirmations: result.text,
    model: modelName || 'default',
  };
}
