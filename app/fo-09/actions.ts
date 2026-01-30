'use server';

import { createFO09DiscoveryAgent } from '@/src/mastra/agents/fo-09/agent';
import { createFO09AffirmationAgent } from '@/src/mastra/agents/fo-09/affirmation-agent';
import { renderTemplate } from '@/src/services';
import {
  FIXED_OPENING_QUESTION,
  type GatheringContext,
  type DynamicScreenResponse,
  type FirstScreenFragmentsResponse,
  type FO09GenerateBatchOptions,
  type FO09GenerateBatchResult,
} from './types';

/**
 * Parse the agent response to extract the JSON object.
 * Handles both clean JSON and wrapped JSON (with markdown code blocks, etc).
 */
function parseDynamicScreenResponse(text: string): DynamicScreenResponse | null {
  // Try to parse as clean JSON object first
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (isValidDynamicScreenResponse(parsed)) {
        return parsed;
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
      if (isValidDynamicScreenResponse(parsed)) {
        return parsed;
      }
    } catch {
      // fall through
    }
  }

  return null;
}

/**
 * Type guard to validate the response structure.
 * FO-09 does NOT have reflectiveStatement.
 */
function isValidDynamicScreenResponse(obj: unknown): obj is DynamicScreenResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  return (
    typeof response.question === 'string' &&
    Array.isArray(response.initialFragments) &&
    response.initialFragments.every((fragment) => typeof fragment === 'string') &&
    Array.isArray(response.expandedFragments) &&
    response.expandedFragments.every((fragment) => typeof fragment === 'string') &&
    typeof response.readyForAffirmations === 'boolean'
  );
}

/**
 * Parse first screen fragments from agent response.
 * Expects JSON with question (ignored), initialFragments, and expandedFragments.
 */
function parseFirstScreenFragments(text: string): FirstScreenFragmentsResponse | null {
  // Try to parse as clean JSON object first
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (isValidFragmentsResponse(parsed)) {
        return {
          initialFragments: parsed.initialFragments,
          expandedFragments: parsed.expandedFragments,
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
      if (isValidFragmentsResponse(parsed)) {
        return {
          initialFragments: parsed.initialFragments,
          expandedFragments: parsed.expandedFragments,
        };
      }
    } catch {
      // fall through
    }
  }

  return null;
}

/**
 * Type guard for fragments-only response.
 */
function isValidFragmentsResponse(
  obj: unknown
): obj is { initialFragments: string[]; expandedFragments: string[] } {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  return (
    Array.isArray(response.initialFragments) &&
    response.initialFragments.every((fragment) => typeof fragment === 'string') &&
    Array.isArray(response.expandedFragments) &&
    response.expandedFragments.every((fragment) => typeof fragment === 'string')
  );
}

/**
 * Build the user prompt for generating first screen fragments.
 * Uses the KV store template with Liquid rendering.
 * FO-09 includes topics for topic-relevant sentence starters.
 */
async function buildFirstScreenPrompt(name: string, topics: string[], implementation: string): Promise<string> {
  try {
    const { output } = await renderTemplate({
      key: 'prompt_first_screen',
      version: 'fo-09-discovery',
      implementation,
      variables: { name, topics },
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-09] Template not found, using fallback:', error);
    const topicsSection = topics.length > 0 ? `\nSelected topics: ${topics.join(', ')}` : '';
    return `## User Context
Name: ${name}${topicsSection}
Current screen number: 1

## First Screen
This is the first screen. The question is already fixed and will be shown to the user:
"${FIXED_OPENING_QUESTION}"

Generate sentence-starter fragments to help them respond to this question.
Return JSON with: question (copy the fixed question), initialFragments (5), expandedFragments (8), readyForAffirmations (false).`;
  }
}

/**
 * Build the user prompt with the full context for the discovery agent.
 * Uses the KV store template with Liquid rendering.
 */
async function buildDiscoveryPrompt(context: GatheringContext, implementation: string): Promise<string> {
  try {
    // Flatten exchanges for Liquid template (Liquid doesn't handle nested objects well)
    const exchanges = context.exchanges.map((ex) => ({
      question: ex.question,
      answer_text: ex.answer.text || '',
    }));

    const { output } = await renderTemplate({
      key: 'prompt_dynamic',
      version: 'fo-09-discovery',
      implementation,
      variables: {
        name: context.name,
        screen_number: context.screenNumber,
        exchanges,
      },
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-09] Template not found, using fallback:', error);
    const lines: string[] = [];
    lines.push('## User Context');
    lines.push(`Name: ${context.name}`);
    lines.push(`Current screen number: ${context.screenNumber}`);
    lines.push('');
    lines.push('## Conversation History');
    for (let i = 0; i < context.exchanges.length; i++) {
      const exchange = context.exchanges[i];
      lines.push(`### Screen ${i + 1}`);
      lines.push(`Question: ${exchange.question}`);
      lines.push(`Answer: ${exchange.answer.text || '(no response provided)'}`);
      lines.push('');
    }
    lines.push('Generate the next screen. Return ONLY valid JSON.');
    return lines.join('\n');
  }
}

/**
 * Server action to generate fragments for the first screen.
 * Screen 1 uses a fixed opening question, so we only generate fragments.
 * FO-09 accepts topics to generate topic-relevant sentence starters.
 */
export async function generateFirstScreenFragments(
  name: string,
  topics: string[],
  implementation: string = 'default'
): Promise<FirstScreenFragmentsResponse> {
  // Validate required inputs
  if (!name || name.trim().length === 0) {
    return {
      initialFragments: [],
      expandedFragments: [],
      error: 'Name is required',
    };
  }

  try {
    // Build the user prompt for first screen (from KV template)
    const userPrompt = await buildFirstScreenPrompt(name, topics, implementation);

    // Create agent
    const agent = await createFO09DiscoveryAgent(implementation);

    console.log('[fo-09] Generating first screen fragments for:', name);
    console.log('[fo-09] Topics:', topics);
    console.log('[fo-09] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-09] Response length:', result.text.length);
    console.log('[fo-09] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseFirstScreenFragments(result.text);

    if (!response) {
      console.error('[fo-09] Failed to parse first screen response:', result.text.substring(0, 500));
      return {
        initialFragments: [],
        expandedFragments: [],
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-09] Parsed first screen fragments successfully');

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-09] Error generating first screen fragments:', errorMessage);
    return {
      initialFragments: [],
      expandedFragments: [],
      error: errorMessage,
    };
  }
}

/**
 * Server action to generate a dynamic discovery screen using the FO-09 agent.
 * Used for screens 2+ only (screen 1 uses generateFirstScreenFragments).
 */
export async function generateDynamicScreen(
  context: GatheringContext,
  implementation: string = 'default'
): Promise<DynamicScreenResponse> {
  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return {
      question: '',
      initialFragments: [],
      expandedFragments: [],
      readyForAffirmations: false,
      error: 'Name is required',
    };
  }

  // Validate we have at least one exchange (screen 1 answer)
  if (context.exchanges.length === 0) {
    return {
      question: '',
      initialFragments: [],
      expandedFragments: [],
      readyForAffirmations: false,
      error: 'At least one exchange is required for screens 2+',
    };
  }

  try {
    // Build the user prompt with full context (from KV template)
    const userPrompt = await buildDiscoveryPrompt(context, implementation);

    // Create agent
    const agent = await createFO09DiscoveryAgent(implementation);

    console.log('[fo-09] Screen number:', context.screenNumber);
    console.log('[fo-09] Exchanges count:', context.exchanges.length);
    console.log('[fo-09] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-09] Response length:', result.text.length);
    console.log('[fo-09] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseDynamicScreenResponse(result.text);

    if (!response) {
      console.error('[fo-09] Failed to parse response:', result.text.substring(0, 500));
      return {
        question: '',
        initialFragments: [],
        expandedFragments: [],
        readyForAffirmations: false,
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-09] Parsed successfully');
    console.log('[fo-09] readyForAffirmations:', response.readyForAffirmations);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-09] Error generating dynamic screen:', errorMessage);
    return {
      question: '',
      initialFragments: [],
      expandedFragments: [],
      readyForAffirmations: false,
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
 * Build the user prompt for affirmation generation from GatheringContext.
 * FO-09: generates 5 affirmations per batch with full feedback loop.
 */
function buildAffirmationPrompt(
  context: GatheringContext,
  approvedAffirmations: string[],
  skippedAffirmations: string[]
): string {
  const lines: string[] = [];

  // User profile section
  lines.push('## User Profile');
  lines.push(`Name: ${context.name}`);
  lines.push('');

  // Exchange history section
  lines.push('## Conversation History');
  lines.push('The following exchanges capture what the user shared during onboarding:');
  lines.push('');

  for (let i = 0; i < context.exchanges.length; i++) {
    const exchange = context.exchanges[i];
    lines.push(`### Exchange ${i + 1}`);
    lines.push(`Question asked: "${exchange.question}"`);

    if (exchange.answer.text) {
      lines.push(`Response: "${exchange.answer.text}"`);
    } else {
      lines.push('(No response provided)');
    }
    lines.push('');
  }

  // Feedback section (for iterative batches)
  const allPreviousAffirmations = [...approvedAffirmations, ...skippedAffirmations];

  if (allPreviousAffirmations.length > 0) {
    lines.push('## Feedback from Previous Batches');
    lines.push('');

    if (approvedAffirmations.length > 0) {
      lines.push('### Loved Affirmations (generate more like these):');
      approvedAffirmations.forEach((aff, i) => {
        lines.push(`${i + 1}. "${aff}"`);
      });
      lines.push('');
    }

    if (skippedAffirmations.length > 0) {
      lines.push('### Discarded Affirmations (avoid similar patterns):');
      skippedAffirmations.forEach((aff, i) => {
        lines.push(`${i + 1}. "${aff}"`);
      });
      lines.push('');
    }

    lines.push('### All Previous Affirmations (do not repeat these):');
    allPreviousAffirmations.forEach((aff, i) => {
      lines.push(`${i + 1}. "${aff}"`);
    });
    lines.push('');
  }

  lines.push('');
  lines.push(
    'Generate 5 unique, personalized affirmations based on everything shared above. Return ONLY a JSON array of 5 strings.'
  );

  return lines.join('\n');
}

/**
 * Server action to generate a batch of 5 affirmations using the FO-09 agent.
 */
export async function generateAffirmationBatchFO09(
  options: FO09GenerateBatchOptions
): Promise<FO09GenerateBatchResult> {
  const {
    context,
    batchNumber,
    approvedAffirmations,
    skippedAffirmations,
    implementation = 'default',
  } = options;

  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return { affirmations: [], error: 'Name is required' };
  }

  if (context.exchanges.length === 0) {
    return { affirmations: [], error: 'At least one exchange is required' };
  }

  try {
    // Build the user prompt from GatheringContext
    const userPrompt = buildAffirmationPrompt(context, approvedAffirmations, skippedAffirmations);

    // Use FO-09 affirmation agent
    const agent = await createFO09AffirmationAgent(implementation);

    console.log('[fo-09-affirmations] Implementation:', implementation);
    console.log('[fo-09-affirmations] Batch number:', batchNumber);
    console.log('[fo-09-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-09-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-09-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-09-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-09-affirmations] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-09-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-09-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-09-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
