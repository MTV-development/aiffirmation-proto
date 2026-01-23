'use server';

import { createFO03Agent } from '@/src/mastra/agents/fo-03';
import { renderTemplate, getKVText } from '@/src/services';

export interface FO03GenerateBatchOptions {
  name: string;
  familiarity: 'new' | 'some' | 'very';
  topics: string[];
  situation: { text: string; chips: string[] };
  feelings: { text: string; chips: string[] };
  whatHelps: { text: string; chips: string[] };
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
}

export interface FO03GenerateBatchResult {
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
 * Server action to generate a batch of 10 affirmations using FO-03 Mastra agent.
 * Supports iterative improvement through feedback from previous batches.
 */
export async function generateAffirmationBatchFO03(
  options: FO03GenerateBatchOptions
): Promise<FO03GenerateBatchResult> {
  const {
    name,
    familiarity,
    topics,
    situation,
    feelings,
    whatHelps,
    batchNumber,
    approvedAffirmations,
    skippedAffirmations,
    implementation = 'default',
  } = options;

  if (!name || name.trim().length === 0) {
    return { affirmations: [], error: 'Name is required' };
  }

  try {
    // Determine which prompt template to use
    const promptKey = batchNumber === 1 ? 'prompt_initial' : 'prompt_with_feedback';

    // Combine for deduplication
    const allPreviousAffirmations = [...approvedAffirmations, ...skippedAffirmations];

    // Build template variables - flatten nested objects for Liquid templating
    const templateVariables = {
      name: name.trim(),
      familiarity,
      topics,
      situation_text: situation.text,
      situation_chips: situation.chips,
      feelings_text: feelings.text,
      feelings_chips: feelings.chips,
      whatHelps_text: whatHelps.text,
      whatHelps_chips: whatHelps.chips,
      approvedAffirmations,
      skippedAffirmations,
      allPreviousAffirmations,
    };

    // Render user prompt from KV store
    const { output: userPrompt } = await renderTemplate({
      key: promptKey,
      version: 'fo-03',
      implementation,
      variables: templateVariables,
    });

    // Get temperature from KV store (with fallback)
    const temperatureKey = `versions.fo-03._temperature.${implementation}`;
    const temperatureStr = await getKVText(temperatureKey);
    const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.9;

    // Create agent with KV-configured system prompt
    const agent = await createFO03Agent(implementation);

    console.log('[fo-03] Implementation:', implementation);
    console.log('[fo-03] Batch number:', batchNumber);
    console.log('[fo-03] Temperature:', temperature);
    console.log('[fo-03] Approved count:', approvedAffirmations.length);
    console.log('[fo-03] Skipped count:', skippedAffirmations.length);
    console.log('[fo-03] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature,
      },
    });

    console.log('[fo-03] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error('[fo-03] Failed to parse affirmations from response:', result.text.substring(0, 500));
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-03] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-03] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
