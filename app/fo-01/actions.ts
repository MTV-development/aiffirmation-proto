'use server';

import { createFO01Agent } from '@/src/mastra/agents/fo-01';
import { renderTemplate, getKVText } from '@/src/services';

export interface FO01GenerateOptions {
  name: string;
  intention: string;
  implementation?: string;
}

export interface FO01GenerateResult {
  affirmations: string[];
  error?: string;
}

/**
 * Parse the agent response to extract JSON array of affirmations.
 * Handles both clean JSON and wrapped JSON (with markdown code blocks, etc).
 */
function parseAffirmationsResponse(text: string): string[] {
  // Try to parse as clean JSON array first
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      // fall through to regex extraction
    }
  }

  // Try to extract JSON array from wrapped response (markdown code blocks, etc)
  const jsonArrayMatch = text.match(/\[[\s\S]*?\]/);
  if (jsonArrayMatch) {
    try {
      const parsed = JSON.parse(jsonArrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      // fall through to line extraction
    }
  }

  // Last resort: try to extract quoted strings that look like affirmations
  const quotedStrings = text.match(/"([^"]+)"/g);
  if (quotedStrings && quotedStrings.length > 0) {
    return quotedStrings
      .map((s) => s.replace(/"/g, ''))
      .filter((s) => s.length > 5 && s.length < 200); // Basic sanity check
  }

  // Return empty array if nothing could be parsed
  return [];
}

/**
 * Server action to generate affirmations using FO-01 Mastra agent.
 * Generates 100 affirmations based on user's name and intention.
 */
export async function generateAffirmationsFO01(
  options: FO01GenerateOptions
): Promise<FO01GenerateResult> {
  const { name, intention, implementation = 'default' } = options;

  if (!name || name.trim().length === 0) {
    return { affirmations: [], error: 'Name is required' };
  }

  if (!intention || intention.trim().length === 0) {
    return { affirmations: [], error: 'Intention is required' };
  }

  try {
    // Build template variables
    const templateVariables = {
      name: name.trim(),
      intention: intention.trim(),
    };

    // Render user prompt from KV store
    const { output: userPrompt } = await renderTemplate({
      key: 'prompt',
      version: 'fo-01',
      implementation,
      variables: templateVariables,
    });

    // Get temperature from KV store (with fallback)
    const temperatureKey = `versions.fo-01._temperature.${implementation}`;
    const temperatureStr = await getKVText(temperatureKey);
    const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.9;

    // Create agent with KV-configured system prompt
    const agent = await createFO01Agent(implementation);

    console.log('[fo-01] Implementation:', implementation);
    console.log('[fo-01] Temperature:', temperature);
    console.log('[fo-01] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature,
      },
    });

    console.log('[fo-01] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error('[fo-01] Failed to parse affirmations from response:', result.text.substring(0, 500));
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-01] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-01] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
