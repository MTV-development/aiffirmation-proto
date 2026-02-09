'use server';

import { createFO10ChipAgent } from '@/src/mastra/agents/fo-10/chip-agent';
import { createFO09AffirmationAgent } from '@/src/mastra/agents/fo-09/affirmation-agent';
import { renderTemplate } from '@/src/services';
import {
  type FO10OnboardingData,
  type FO10ChipResponse,
  type FO10GenerateBatchOptions,
  type FO10GenerateBatchResult,
} from './types';

/**
 * Parse the chip agent response to extract JSON object.
 * Expected format: { initialChips: string[], expandedChips: string[] }
 */
function parseChipResponse(text: string): FO10ChipResponse | null {
  // Try to parse as clean JSON object first
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (isValidChipResponse(parsed)) {
        return {
          initialChips: parsed.initialChips,
          expandedChips: parsed.expandedChips,
        };
      }
    } catch {
      // fall through to regex extraction
    }
  }

  // Try to extract JSON object from wrapped response (markdown code blocks, etc)
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      const parsed = JSON.parse(jsonObjectMatch[0]);
      if (isValidChipResponse(parsed)) {
        return {
          initialChips: parsed.initialChips,
          expandedChips: parsed.expandedChips,
        };
      }
    } catch {
      // fall through
    }
  }

  return null;
}

/**
 * Type guard for chip response validation.
 */
function isValidChipResponse(
  obj: unknown
): obj is { initialChips: string[]; expandedChips: string[] } {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  return (
    Array.isArray(response.initialChips) &&
    response.initialChips.every((chip) => typeof chip === 'string') &&
    Array.isArray(response.expandedChips) &&
    response.expandedChips.every((chip) => typeof chip === 'string')
  );
}

/**
 * Build the user prompt for chip generation based on step number.
 * Uses KV store templates with step-specific prompts.
 */
async function buildChipPrompt(
  stepNumber: number,
  context: FO10OnboardingData
): Promise<string> {
  // Map step number to template key
  const stepToKey: Record<number, string> = {
    5: 'prompt_step_5',
    6: 'prompt_step_6',
    7: 'prompt_step_7',
  };

  const key = stepToKey[stepNumber];
  if (!key) {
    throw new Error(`Invalid step number for chip generation: ${stepNumber}`);
  }

  try {
    // Flatten exchanges for Liquid template
    const exchanges = context.exchanges.map((ex) => ({
      question: ex.question,
      answer_text: ex.answer.text || '',
    }));

    // Extract individual answers for template variables
    const goal = context.exchanges[0]?.answer.text || '';
    const why_it_matters = context.exchanges[1]?.answer.text || '';
    const situation = context.exchanges[2]?.answer.text || '';

    const { output } = await renderTemplate({
      key,
      version: 'fo-10-chip',
      implementation: 'default',
      variables: {
        name: context.name,
        familiarity: context.familiarityLevel,
        exchanges,
        goal,
        why_it_matters,
        situation,
      },
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-10-chip] Template not found, using fallback:', error);
    const lines: string[] = [];
    lines.push('## User Context');
    lines.push(`Name: ${context.name}`);
    lines.push(`Familiarity: ${context.familiarityLevel}`);
    lines.push('');
    lines.push('## Conversation History');
    for (let i = 0; i < context.exchanges.length; i++) {
      const exchange = context.exchanges[i];
      lines.push(`Question: ${exchange.question}`);
      lines.push(`Answer: ${exchange.answer.text || '(no response provided)'}`);
      lines.push('');
    }

    // Step-specific instructions
    if (stepNumber === 5) {
      lines.push('Generate 8 initial and 15 expanded hybrid fragments (ending with "...") about why the user\'s goal matters.');
    } else if (stepNumber === 6) {
      lines.push('Generate 8 initial and 15 expanded complete sentences about situations where the goal is important.');
    } else if (stepNumber === 7) {
      lines.push('Generate 8 initial and 15 expanded complete sentences about tone/style of support.');
    }

    lines.push('Return ONLY valid JSON with: { initialChips: [...], expandedChips: [...] }');
    return lines.join('\n');
  }
}

/**
 * Server action to generate chips for discovery steps 5-7.
 * Step 5 generates fragments (ending with "..."), steps 6-7 generate sentences.
 */
export async function generateChips(
  stepNumber: number,
  context: FO10OnboardingData
): Promise<FO10ChipResponse> {
  // Validate step number (only 5, 6, 7 use chip generation)
  if (![5, 6, 7].includes(stepNumber)) {
    return {
      initialChips: [],
      expandedChips: [],
      error: `Invalid step number: ${stepNumber}. Chips are only generated for steps 5-7.`,
    };
  }

  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return {
      initialChips: [],
      expandedChips: [],
      error: 'Name is required',
    };
  }

  // Validate that we have previous exchanges
  const requiredExchanges = stepNumber - 4; // Step 5 needs 1, step 6 needs 2, step 7 needs 3
  if (context.exchanges.length < requiredExchanges) {
    return {
      initialChips: [],
      expandedChips: [],
      error: `Step ${stepNumber} requires at least ${requiredExchanges} previous exchange(s)`,
    };
  }

  try {
    // Build the user prompt from KV store template
    const userPrompt = await buildChipPrompt(stepNumber, context);

    // Create chip generation agent
    const agent = await createFO10ChipAgent();

    console.log('[fo-10-chip] Step number:', stepNumber);
    console.log('[fo-10-chip] Name:', context.name);
    console.log('[fo-10-chip] Exchanges count:', context.exchanges.length);
    console.log('[fo-10-chip] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-10-chip] Response length:', result.text.length);
    console.log('[fo-10-chip] Full response:', result.text);

    // Parse JSON response
    const response = parseChipResponse(result.text);

    if (!response) {
      console.error('[fo-10-chip] Failed to parse chip response:', result.text.substring(0, 500));
      return {
        initialChips: [],
        expandedChips: [],
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-10-chip] Parsed successfully');
    console.log('[fo-10-chip] Initial chips count:', response.initialChips.length);
    console.log('[fo-10-chip] Expanded chips count:', response.expandedChips.length);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-10-chip] Error generating chips:', errorMessage);
    return {
      initialChips: [],
      expandedChips: [],
      error: errorMessage,
    };
  }
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
 * Build the user prompt for affirmation generation from FO10OnboardingData.
 * FO-10 reuses FO-09 affirmation agent and templates.
 */
async function buildAffirmationPrompt(
  context: FO10OnboardingData,
  approvedAffirmations: string[],
  skippedAffirmations: string[]
): Promise<string> {
  const hasFeedback = approvedAffirmations.length > 0 || skippedAffirmations.length > 0;
  const key = hasFeedback ? 'prompt_with_feedback' : 'prompt';

  try {
    const exchanges = context.exchanges.map((ex) => ({
      question: ex.question,
      answer_text: ex.answer.text || '(no response provided)',
    }));

    const variables: Record<string, unknown> = {
      name: context.name,
      exchanges,
    };

    if (hasFeedback) {
      variables.loved = approvedAffirmations;
      variables.discarded = skippedAffirmations;
      variables.all_previous = [...approvedAffirmations, ...skippedAffirmations];
    }

    const { output } = await renderTemplate({
      key,
      version: 'fo-09-affirmation',
      implementation: 'default',
      variables,
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-10-affirmations] Template not found, using fallback:', error);
    const lines: string[] = [];
    lines.push(`Generate 5 personalized affirmations for ${context.name}.`);
    lines.push('');
    lines.push('## Conversation History');
    for (let i = 0; i < context.exchanges.length; i++) {
      const exchange = context.exchanges[i];
      lines.push(`Question: "${exchange.question}"`);
      lines.push(`Response: "${exchange.answer.text || '(no response)'}"`);
      lines.push('');
    }
    if (hasFeedback) {
      lines.push('## Feedback');
      if (approvedAffirmations.length > 0) {
        lines.push('Loved: ' + approvedAffirmations.map((a) => `"${a}"`).join(', '));
      }
      if (skippedAffirmations.length > 0) {
        lines.push('Discarded: ' + skippedAffirmations.map((a) => `"${a}"`).join(', '));
      }
      lines.push('');
    }
    lines.push('Return ONLY a JSON array of 5 affirmation strings.');
    return lines.join('\n');
  }
}

/**
 * Server action to generate a batch of 5 affirmations using the FO-09 affirmation agent.
 * FO-10 reuses the FO-09 affirmation agent since the data structure is identical.
 */
export async function generateAffirmationBatchFO10(
  options: FO10GenerateBatchOptions
): Promise<FO10GenerateBatchResult> {
  const {
    context,
    batchNumber,
    approvedAffirmations,
    skippedAffirmations,
  } = options;

  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return { affirmations: [], error: 'Name is required' };
  }

  if (context.exchanges.length === 0) {
    return { affirmations: [], error: 'At least one exchange is required' };
  }

  try {
    // Build the user prompt from KV store template
    const userPrompt = await buildAffirmationPrompt(context, approvedAffirmations, skippedAffirmations);

    // Use FO-09 affirmation agent (reused for FO-10)
    const agent = await createFO09AffirmationAgent('default');

    console.log('[fo-10-affirmations] Batch number:', batchNumber);
    console.log('[fo-10-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-10-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-10-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-10-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-10-affirmations] Response length:', result.text.length);
    console.log('[fo-10-affirmations] Full response:', result.text);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-10-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-10-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-10-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
