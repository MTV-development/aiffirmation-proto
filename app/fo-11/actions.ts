'use server';

import { createFO11DiscoveryAgent } from '@/src/mastra/agents/fo-11/discovery-agent';
import { createFO11AffirmationAgent } from '@/src/mastra/agents/fo-11/affirmation-agent';
import { renderTemplate } from '@/src/services';
import {
  type FO11OnboardingData,
  type FO11DiscoveryResponse,
  type FO11GenerateBatchOptions,
  type FO11GenerateBatchResult,
} from './types';

/**
 * Parse the discovery agent response to extract JSON object.
 * Expected format: { skip: boolean, question: string, initialChips: string[], expandedChips: string[] }
 */
function parseDiscoveryResponse(text: string): FO11DiscoveryResponse | null {
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
  stepNumber: 5 | 6 | 7,
  context: FO11OnboardingData
): Promise<string> {
  const stepToKey: Record<number, string> = {
    5: 'prompt_step_5',
    6: 'prompt_step_6',
    7: 'prompt_step_7',
  };

  const key = stepToKey[stepNumber];

  try {
    // Format conversation history as natural Q&A strings
    const conversationHistory = context.exchanges
      .map((ex) => `Q: ${ex.question}\nA: ${ex.answer.text || '(no response provided)'}`)
      .join('\n\n');

    const { output } = await renderTemplate({
      key,
      version: 'fo-11-discovery',
      implementation: 'default',
      variables: {
        name: context.name,
        conversation_history: conversationHistory,
      },
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-11-discovery] Template not found, using fallback:', error);
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

    if (stepNumber === 5) {
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
    } else if (stepNumber === 6) {
      lines.push('## This Step\'s Intent');
      lines.push('Learn what tone of support the user wants for their affirmations.');
      lines.push('');
      lines.push('## Chip Format');
      lines.push('Single words ONLY describing tone qualities.');
      lines.push('');
      lines.push('Return ONLY valid JSON:');
      lines.push('{ "skip": false, "question": "...", "initialChips": [8 single words], "expandedChips": [12 single words] }');
    } else {
      lines.push('## This Step\'s Intent');
      lines.push('Capture any remaining nuance, struggles, or friction points before generating affirmations.');
      lines.push('');
      lines.push('## Chip Format');
      lines.push('Sentence fragments ending with "..."');
      lines.push('');
      lines.push('Return ONLY valid JSON:');
      lines.push('{ "skip": false, "question": "...", "initialChips": [6 fragments], "expandedChips": [10 fragments] }');
    }

    return lines.join('\n');
  }
}

/**
 * Server action to generate a discovery step (question + chips + skip signal).
 * Step 5 (context) can be skipped; steps 6 (tone) and 7 (additional) are never skipped.
 */
export async function generateDiscoveryStep(
  stepNumber: 5 | 6 | 7,
  context: FO11OnboardingData
): Promise<FO11DiscoveryResponse> {
  // Validate step number (only 5, 6, or 7)
  if (stepNumber !== 5 && stepNumber !== 6 && stepNumber !== 7) {
    return {
      skip: false,
      question: '',
      initialChips: [],
      expandedChips: [],
      error: `Invalid step number: ${stepNumber}. Discovery steps are only 5, 6, or 7.`,
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

  // Step 6 needs at least the goal exchange (step 5 may have been skipped)
  // Step 5 needs exactly 1 exchange (the goal)
  if (stepNumber === 6 && context.exchanges.length < 1) {
    return {
      skip: false,
      question: '',
      initialChips: [],
      expandedChips: [],
      error: 'Step 6 requires at least the goal exchange',
    };
  }

  try {
    // Build the user prompt from KV store template
    const userPrompt = await buildDiscoveryPrompt(stepNumber, context);

    // Create discovery agent
    const agent = await createFO11DiscoveryAgent();

    console.log('[fo-11-discovery] Step number:', stepNumber);
    console.log('[fo-11-discovery] Name:', context.name);
    console.log('[fo-11-discovery] Exchanges count:', context.exchanges.length);
    console.log('[fo-11-discovery] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-11-discovery] Response length:', result.text.length);
    console.log('[fo-11-discovery] Full response:', result.text);

    // Parse JSON response
    const response = parseDiscoveryResponse(result.text);

    if (!response) {
      console.error('[fo-11-discovery] Failed to parse discovery response:', result.text.substring(0, 500));
      return {
        skip: false,
        question: '',
        initialChips: [],
        expandedChips: [],
        error: 'Failed to parse agent response',
      };
    }

    // Safety guard: steps 6 and 7 should NEVER be skipped, even if agent returns skip=true
    if ((stepNumber === 6 || stepNumber === 7) && response.skip) {
      console.warn(`[fo-11-discovery] Agent returned skip=true for step ${stepNumber} — forcing skip=false`);
      response.skip = false;
    }

    console.log('[fo-11-discovery] Parsed successfully');
    console.log('[fo-11-discovery] Skip:', response.skip);
    console.log('[fo-11-discovery] Question:', response.question);
    console.log('[fo-11-discovery] Initial chips count:', response.initialChips.length);
    console.log('[fo-11-discovery] Expanded chips count:', response.expandedChips.length);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-11-discovery] Error generating discovery step:', errorMessage);
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
 * Build the user prompt for affirmation generation from FO11OnboardingData.
 * Handles both 2-exchange and 3-exchange flows (variable length).
 * Does NOT pass familiarityLevel to the prompt.
 */
async function buildAffirmationPrompt(
  context: FO11OnboardingData,
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
      version: 'fo-11-affirmation',
      implementation: 'default',
      variables,
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-11-affirmations] Template not found, using fallback:', error);
    const lines: string[] = [];
    lines.push(`Generate 5 personalized affirmations for ${context.name}.`);
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
    lines.push('Return ONLY a JSON array of 5 affirmation strings.');
    return lines.join('\n');
  }
}

/**
 * Server action to generate a batch of 5 affirmations using the FO-11 affirmation agent.
 * Handles both 2-exchange and 3-exchange flows (variable length depending on skip).
 * Does NOT use familiarityLevel — conversation content drives everything.
 */
export async function generateAffirmationBatchFO11(
  options: FO11GenerateBatchOptions
): Promise<FO11GenerateBatchResult> {
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

    // Use FO-11 affirmation agent
    const agent = await createFO11AffirmationAgent('default');

    console.log('[fo-11-affirmations] Batch number:', batchNumber);
    console.log('[fo-11-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-11-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-11-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-11-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-11-affirmations] Response length:', result.text.length);
    console.log('[fo-11-affirmations] Full response:', result.text);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-11-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-11-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-11-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
