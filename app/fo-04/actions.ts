'use server';

import { createFO04DiscoveryAgent } from '@/src/mastra/agents/fo-04/agent';
import { createFO03Agent } from '@/src/mastra/agents/fo-03';

/**
 * Context accumulated during the dynamic gathering screens.
 */
export interface GatheringContext {
  // User profile (from initial screens)
  name: string;
  familiarity: 'new' | 'some' | 'very'; // Experience with affirmations
  initialTopic: string; // From "what do you want affirmations to help with"

  // Conversation history
  exchanges: Array<{
    question: string;
    answer: {
      text: string; // Free-typed text
      selectedChips: string[]; // Chips added to input
    };
  }>;
  screenNumber: number; // 1-indexed, used for min/max enforcement
}

/**
 * Response structure from the discovery agent.
 */
export interface DynamicScreenResponse {
  reflectiveStatement: string; // Empty string on first screen
  question: string;
  initialChips: string[]; // 5-8 chips, shown by default
  expandedChips: string[]; // 10-15 chips, shown on "show more"
  readyForAffirmations: boolean;
  error?: string;
}

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
 */
function isValidDynamicScreenResponse(obj: unknown): obj is DynamicScreenResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  return (
    typeof response.reflectiveStatement === 'string' &&
    typeof response.question === 'string' &&
    Array.isArray(response.initialChips) &&
    response.initialChips.every((chip) => typeof chip === 'string') &&
    Array.isArray(response.expandedChips) &&
    response.expandedChips.every((chip) => typeof chip === 'string') &&
    typeof response.readyForAffirmations === 'boolean'
  );
}

/**
 * Build the user prompt with the full context for the discovery agent.
 */
function buildDiscoveryPrompt(context: GatheringContext): string {
  const lines: string[] = [];

  lines.push('## User Context');
  lines.push(`Name: ${context.name}`);
  lines.push(`Familiarity with affirmations: ${context.familiarity}`);
  lines.push(`Initial topic: ${context.initialTopic}`);
  lines.push(`Current screen number: ${context.screenNumber}`);
  lines.push('');

  if (context.exchanges.length === 0) {
    lines.push('## Conversation History');
    lines.push('No exchanges yet. This is the first screen.');
  } else {
    lines.push('## Conversation History');
    for (let i = 0; i < context.exchanges.length; i++) {
      const exchange = context.exchanges[i];
      lines.push(`### Screen ${i + 1}`);
      lines.push(`Question: ${exchange.question}`);
      if (exchange.answer.text || exchange.answer.selectedChips.length > 0) {
        const answerParts: string[] = [];
        if (exchange.answer.text) {
          answerParts.push(exchange.answer.text);
        }
        if (exchange.answer.selectedChips.length > 0) {
          answerParts.push(`[chips: ${exchange.answer.selectedChips.join(', ')}]`);
        }
        lines.push(`Answer: ${answerParts.join(' ')}`);
      }
      lines.push('');
    }
  }

  lines.push('');
  lines.push('Generate the next screen. Return ONLY valid JSON.');

  return lines.join('\n');
}

/**
 * Server action to generate a dynamic discovery screen using the FO-04 agent.
 */
export async function generateDynamicScreen(
  context: GatheringContext
): Promise<DynamicScreenResponse> {
  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return {
      reflectiveStatement: '',
      question: '',
      initialChips: [],
      expandedChips: [],
      readyForAffirmations: false,
      error: 'Name is required',
    };
  }

  if (!context.initialTopic || context.initialTopic.trim().length === 0) {
    return {
      reflectiveStatement: '',
      question: '',
      initialChips: [],
      expandedChips: [],
      readyForAffirmations: false,
      error: 'Initial topic is required',
    };
  }

  try {
    // Build the user prompt with full context
    const userPrompt = buildDiscoveryPrompt(context);

    // Create agent (using default implementation for now)
    const agent = await createFO04DiscoveryAgent('default');

    console.log('[fo-04] Screen number:', context.screenNumber);
    console.log('[fo-04] Exchanges count:', context.exchanges.length);
    console.log('[fo-04] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-04] Response length:', result.text.length);
    console.log('[fo-04] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseDynamicScreenResponse(result.text);

    if (!response) {
      console.error('[fo-04] Failed to parse response:', result.text.substring(0, 500));
      return {
        reflectiveStatement: '',
        question: '',
        initialChips: [],
        expandedChips: [],
        readyForAffirmations: false,
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-04] Parsed successfully');
    console.log('[fo-04] readyForAffirmations:', response.readyForAffirmations);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-04] Error generating dynamic screen:', errorMessage);
    return {
      reflectiveStatement: '',
      question: '',
      initialChips: [],
      expandedChips: [],
      readyForAffirmations: false,
      error: errorMessage,
    };
  }
}

/**
 * Options for generating affirmation batches in FO-04.
 */
export interface FO04GenerateBatchOptions {
  context: GatheringContext;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
}

/**
 * Result from affirmation batch generation.
 */
export interface FO04GenerateBatchResult {
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
 * Build the user prompt for affirmation generation from GatheringContext.
 * Formats the dynamic exchange history into a prompt for the FO-03 agent.
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
  lines.push(`Familiarity with affirmations: ${context.familiarity}`);
  lines.push(`Primary topic: ${context.initialTopic}`);
  lines.push('');

  // Exchange history section - this replaces the hardcoded situation/feelings/whatHelps
  lines.push('## Conversation History');
  lines.push('The following exchanges capture what the user shared during onboarding:');
  lines.push('');

  for (let i = 0; i < context.exchanges.length; i++) {
    const exchange = context.exchanges[i];
    lines.push(`### Exchange ${i + 1}`);
    lines.push(`Question asked: "${exchange.question}"`);

    const answerParts: string[] = [];
    if (exchange.answer.text) {
      answerParts.push(`Free response: "${exchange.answer.text}"`);
    }
    if (exchange.answer.selectedChips.length > 0) {
      answerParts.push(`Selected options: ${exchange.answer.selectedChips.join(', ')}`);
    }
    if (answerParts.length > 0) {
      lines.push(answerParts.join('\n'));
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
      lines.push('### Approved Affirmations (generate more like these):');
      approvedAffirmations.forEach((aff, i) => {
        lines.push(`${i + 1}. "${aff}"`);
      });
      lines.push('');
    }

    if (skippedAffirmations.length > 0) {
      lines.push('### Skipped Affirmations (avoid similar patterns):');
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
    'Generate 10 unique, personalized affirmations based on everything shared above. Return ONLY a JSON array of 10 strings.'
  );

  return lines.join('\n');
}

/**
 * Server action to generate a batch of 10 affirmations using the FO-03 agent.
 * Uses GatheringContext exchanges instead of hardcoded situation/feelings/whatHelps.
 */
export async function generateAffirmationBatchFO04(
  options: FO04GenerateBatchOptions
): Promise<FO04GenerateBatchResult> {
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

  if (!context.initialTopic || context.initialTopic.trim().length === 0) {
    return { affirmations: [], error: 'Initial topic is required' };
  }

  if (context.exchanges.length === 0) {
    return { affirmations: [], error: 'At least one exchange is required' };
  }

  try {
    // Build the user prompt from GatheringContext
    const userPrompt = buildAffirmationPrompt(context, approvedAffirmations, skippedAffirmations);

    // Reuse FO-03 agent for affirmation generation
    const agent = await createFO03Agent(implementation);

    console.log('[fo-04-affirmations] Implementation:', implementation);
    console.log('[fo-04-affirmations] Batch number:', batchNumber);
    console.log('[fo-04-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-04-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-04-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-04-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent (using default temperature from FO-03 agent)
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-04-affirmations] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-04-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-04-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-04-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}
