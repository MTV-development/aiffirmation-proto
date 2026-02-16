'use server';

import { createFO12DiscoveryAgent } from '@/src/mastra/agents/fo-12/discovery-agent';
import { createFO12AffirmationAgent } from '@/src/mastra/agents/fo-12/affirmation-agent';
import { renderTemplate } from '@/src/services';
import {
  type FO12OnboardingData,
  type FO12DiscoveryResponse,
  type FO12GenerateBatchOptions,
  type FO12GenerateBatchResult,
} from './types';

/**
 * Parse the discovery agent response to extract JSON object.
 * Expected format: { skip: boolean, question: string, initialChips: string[], expandedChips: string[] }
 */
function parseDiscoveryResponse(text: string): FO12DiscoveryResponse | null {
  // Try to parse as clean JSON object first
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (isValidDiscoveryResponse(parsed)) {
        return {
          skip: parsed.skip,
          question: parsed.question,
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
      if (isValidDiscoveryResponse(parsed)) {
        return {
          skip: parsed.skip,
          question: parsed.question,
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
 * Type guard for discovery response validation.
 */
function isValidDiscoveryResponse(
  obj: unknown
): obj is { skip: boolean; question: string; initialChips: string[]; expandedChips: string[] } {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  return (
    typeof response.skip === 'boolean' &&
    typeof response.question === 'string' &&
    Array.isArray(response.initialChips) &&
    response.initialChips.every((chip) => typeof chip === 'string') &&
    Array.isArray(response.expandedChips) &&
    response.expandedChips.every((chip) => typeof chip === 'string')
  );
}

/**
 * Build the user prompt for discovery step generation.
 * Uses KV store templates with step-specific prompts.
 */
async function buildDiscoveryPrompt(
  stepNumber: 4 | 5,
  context: FO12OnboardingData,
  implementation: string = 'default'
): Promise<string> {
  const stepToKey: Record<number, string> = {
    4: 'prompt_step_4',
    5: 'prompt_step_5',
  };

  const key = stepToKey[stepNumber];

  try {
    // Format conversation history as natural Q&A strings
    const conversationHistory = context.exchanges
      .map((ex) => `Q: ${ex.question}\nA: ${ex.answer.text || '(no response provided)'}`)
      .join('\n\n');

    const { output } = await renderTemplate({
      key,
      version: 'fo-12',
      implementation,
      variables: {
        name: context.name,
        conversation_history: conversationHistory,
      },
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-12-discovery] Template not found, using fallback:', error);
    const lines: string[] = [];
    lines.push('## User Context');
    lines.push(`Name: ${context.name}`);
    lines.push('');
    lines.push('## Conversation So Far');
    for (const exchange of context.exchanges) {
      lines.push(`Q: ${exchange.question}`);
      lines.push(`A: ${exchange.answer.text || '(no response provided)'}`);
      lines.push('');
    }

    if (stepNumber === 4) {
      lines.push('## This Step\'s Intent');
      lines.push('Understand what\'s going on in the user\'s life that makes this goal feel important right now.');
      lines.push('');
      lines.push('## Skip Rule');
      lines.push('If the goal answer already has rich life context, set skip to true.');
      lines.push('');
      lines.push('## Chip Format');
      lines.push('Hybrid fragments ending with "..."');
      lines.push('');
      lines.push('Return ONLY valid JSON:');
      lines.push('{ "skip": true/false, "question": "...", "initialChips": [8 fragments], "expandedChips": [15 fragments] }');
    } else {
      lines.push('## This Step\'s Intent');
      lines.push('Learn what kind of supportive voice the user wants.');
      lines.push('');
      lines.push('## Chip Format');
      lines.push('Single words ONLY describing voice qualities.');
      lines.push('');
      lines.push('Return ONLY valid JSON:');
      lines.push('{ "skip": false, "question": "...", "initialChips": [8 single words], "expandedChips": [12 single words] }');
    }

    return lines.join('\n');
  }
}

/**
 * Server action to generate a discovery step (question + chips + skip signal).
 * Step 4 (context) can be skipped; step 5 (tone) is never skipped.
 */
export async function generateDiscoveryStep(
  stepNumber: 4 | 5,
  context: FO12OnboardingData,
  implementation: string = 'default'
): Promise<FO12DiscoveryResponse> {
  // Validate step number (only 4 or 5)
  if (stepNumber !== 4 && stepNumber !== 5) {
    return {
      skip: false,
      question: '',
      initialChips: [],
      expandedChips: [],
      error: `Invalid step number: ${stepNumber}. Discovery steps are only 4 or 5.`,
    };
  }

  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return {
      skip: false,
      question: '',
      initialChips: [],
      expandedChips: [],
      error: 'Name is required',
    };
  }

  // Validate that we have at least the goal exchange
  if (context.exchanges.length === 0) {
    return {
      skip: false,
      question: '',
      initialChips: [],
      expandedChips: [],
      error: 'At least one exchange (goal) is required',
    };
  }

  try {
    // Build the user prompt from KV store template
    const userPrompt = await buildDiscoveryPrompt(stepNumber, context, implementation);

    // Create discovery agent
    const agent = await createFO12DiscoveryAgent(implementation);

    console.log('[fo-12-discovery] Step number:', stepNumber);
    console.log('[fo-12-discovery] Name:', context.name);
    console.log('[fo-12-discovery] Exchanges count:', context.exchanges.length);
    console.log('[fo-12-discovery] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-12-discovery] Response length:', result.text.length);
    console.log('[fo-12-discovery] Full response:', result.text);

    // Parse JSON response
    const response = parseDiscoveryResponse(result.text);

    if (!response) {
      console.error('[fo-12-discovery] Failed to parse discovery response:', result.text.substring(0, 500));
      return {
        skip: false,
        question: '',
        initialChips: [],
        expandedChips: [],
        error: 'Failed to parse agent response',
      };
    }

    // Safety guard: step 5 (tone) should NEVER be skipped, even if agent returns skip=true
    if (stepNumber === 5 && response.skip) {
      console.warn('[fo-12-discovery] Agent returned skip=true for step 5 — forcing skip=false');
      response.skip = false;
    }

    console.log('[fo-12-discovery] Parsed successfully');
    console.log('[fo-12-discovery] Skip:', response.skip);
    console.log('[fo-12-discovery] Question:', response.question);
    console.log('[fo-12-discovery] Initial chips count:', response.initialChips.length);
    console.log('[fo-12-discovery] Expanded chips count:', response.expandedChips.length);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-12-discovery] Error generating discovery step:', errorMessage);
    return {
      skip: false,
      question: '',
      initialChips: [],
      expandedChips: [],
      error: errorMessage,
    };
  }
}

// ============================================================
// Affirmation Generation
// ============================================================

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
 * Build the user prompt for affirmation generation from FO12OnboardingData.
 * Handles both 2-exchange and 3-exchange flows (variable length).
 * Does NOT pass familiarityLevel to the prompt.
 * Supports dynamic batch sizing for phase 3 via batchSize parameter.
 */
async function buildAffirmationPrompt(
  context: FO12OnboardingData,
  approvedAffirmations: string[],
  skippedAffirmations: string[],
  implementation: string = 'default',
  batchSize?: number
): Promise<string> {
  const hasFeedback = approvedAffirmations.length > 0 || skippedAffirmations.length > 0;
  const key = hasFeedback ? 'prompt_affirmation_with_feedback' : 'prompt_affirmation';

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
      variables.batch_size = batchSize || 10;
    }

    const { output } = await renderTemplate({
      key,
      version: 'fo-12',
      implementation,
      variables,
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    const effectiveBatchSize = batchSize || 10;
    console.warn('[fo-12-affirmations] Template not found, using fallback:', error);
    const lines: string[] = [];
    lines.push(`Generate ${effectiveBatchSize} personalized affirmations for ${context.name}.`);
    lines.push('');
    lines.push('## Conversation History');
    for (const exchange of context.exchanges) {
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
    lines.push(`Return ONLY a JSON array of ${effectiveBatchSize} affirmation strings.`);
    return lines.join('\n');
  }
}

/**
 * Server action to generate a batch of affirmations using the FO-12 affirmation agent.
 * Default batch size is 10 (phases 1-2), with optional dynamic sizing for phase 3.
 * Handles both 2-exchange and 3-exchange flows (variable length depending on skip).
 * Does NOT use familiarityLevel — conversation content drives everything.
 */
export async function generateAffirmationBatchFO12(
  options: FO12GenerateBatchOptions
): Promise<FO12GenerateBatchResult> {
  const {
    context,
    batchNumber,
    approvedAffirmations,
    skippedAffirmations,
    implementation = 'default',
    batchSize,
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
    const userPrompt = await buildAffirmationPrompt(
      context,
      approvedAffirmations,
      skippedAffirmations,
      implementation,
      batchSize
    );

    // Use FO-12 affirmation agent
    const agent = await createFO12AffirmationAgent(implementation);

    console.log('[fo-12-affirmations] Batch number:', batchNumber);
    console.log('[fo-12-affirmations] Batch size:', batchSize || 10);
    console.log('[fo-12-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-12-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-12-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-12-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-12-affirmations] Response length:', result.text.length);
    console.log('[fo-12-affirmations] Full response:', result.text);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-12-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-12-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-12-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
