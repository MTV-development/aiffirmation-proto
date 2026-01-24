'use server';

import { createFO05DiscoveryAgent } from '@/src/mastra/agents/fo-05/agent';
import { createFO05AffirmationAgent } from '@/src/mastra/agents/fo-05/affirmation-agent';
import {
  createFO05PreSummaryAgent,
  createFO05PostSummaryAgent,
} from '@/src/mastra/agents/fo-05/summary-agent';

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
      selectedFragments: string[]; // Fragments added to input
    };
  }>;
  screenNumber: number; // 1-indexed, used for min/max enforcement
}

/**
 * Response structure from the discovery agent.
 * FO-05 uses fragments (sentence starters) instead of chips.
 */
export interface DynamicScreenResponse {
  reflectiveStatement: string; // Empty string on first screen
  question: string;
  initialFragments: string[]; // 5 fragments, shown by default
  expandedFragments: string[]; // 8 fragments, shown on "show more"
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
 * FO-05 uses initialFragments and expandedFragments instead of chips.
 */
function isValidDynamicScreenResponse(obj: unknown): obj is DynamicScreenResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  return (
    typeof response.reflectiveStatement === 'string' &&
    typeof response.question === 'string' &&
    Array.isArray(response.initialFragments) &&
    response.initialFragments.every((fragment) => typeof fragment === 'string') &&
    Array.isArray(response.expandedFragments) &&
    response.expandedFragments.every((fragment) => typeof fragment === 'string') &&
    typeof response.readyForAffirmations === 'boolean'
  );
}

/**
 * Build the user prompt with the full context for the discovery agent.
 * Includes both question AND answer in the conversation history for better context.
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
      if (exchange.answer.text || exchange.answer.selectedFragments.length > 0) {
        const answerParts: string[] = [];
        if (exchange.answer.text) {
          answerParts.push(exchange.answer.text);
        }
        if (exchange.answer.selectedFragments.length > 0) {
          answerParts.push(`[fragments: ${exchange.answer.selectedFragments.join(', ')}]`);
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
 * Server action to generate a dynamic discovery screen using the FO-05 agent.
 */
export async function generateDynamicScreen(
  context: GatheringContext
): Promise<DynamicScreenResponse> {
  // Validate required inputs
  if (!context.name || context.name.trim().length === 0) {
    return {
      reflectiveStatement: '',
      question: '',
      initialFragments: [],
      expandedFragments: [],
      readyForAffirmations: false,
      error: 'Name is required',
    };
  }

  if (!context.initialTopic || context.initialTopic.trim().length === 0) {
    return {
      reflectiveStatement: '',
      question: '',
      initialFragments: [],
      expandedFragments: [],
      readyForAffirmations: false,
      error: 'Initial topic is required',
    };
  }

  try {
    // Build the user prompt with full context
    const userPrompt = buildDiscoveryPrompt(context);

    // Create agent (using default implementation for now)
    const agent = await createFO05DiscoveryAgent('default');

    console.log('[fo-05] Screen number:', context.screenNumber);
    console.log('[fo-05] Exchanges count:', context.exchanges.length);
    console.log('[fo-05] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-05] Response length:', result.text.length);
    console.log('[fo-05] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseDynamicScreenResponse(result.text);

    if (!response) {
      console.error('[fo-05] Failed to parse response:', result.text.substring(0, 500));
      return {
        reflectiveStatement: '',
        question: '',
        initialFragments: [],
        expandedFragments: [],
        readyForAffirmations: false,
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-05] Parsed successfully');
    console.log('[fo-05] readyForAffirmations:', response.readyForAffirmations);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-05] Error generating dynamic screen:', errorMessage);
    return {
      reflectiveStatement: '',
      question: '',
      initialFragments: [],
      expandedFragments: [],
      readyForAffirmations: false,
      error: errorMessage,
    };
  }
}

/**
 * Options for generating affirmation batches in FO-05.
 */
export interface FO05GenerateBatchOptions {
  context: GatheringContext;
  batchNumber: number;
  approvedAffirmations: string[];
  skippedAffirmations: string[];
  implementation?: string;
}

/**
 * Result from affirmation batch generation.
 */
export interface FO05GenerateBatchResult {
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
 * Formats the dynamic exchange history into a prompt for the FO-05 agent.
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
    if (exchange.answer.selectedFragments.length > 0) {
      answerParts.push(`Selected fragments: ${exchange.answer.selectedFragments.join(', ')}`);
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
 * Server action to generate a batch of 10 affirmations using the FO-05 agent.
 * Uses GatheringContext exchanges instead of hardcoded situation/feelings/whatHelps.
 */
export async function generateAffirmationBatchFO05(
  options: FO05GenerateBatchOptions
): Promise<FO05GenerateBatchResult> {
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

    // Use FO-05 affirmation agent with conversation-aware prompts
    const agent = await createFO05AffirmationAgent(implementation);

    console.log('[fo-05-affirmations] Implementation:', implementation);
    console.log('[fo-05-affirmations] Batch number:', batchNumber);
    console.log('[fo-05-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-05-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-05-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-05-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent (using default temperature from FO-05 agent)
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-05-affirmations] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-05-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-05-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-05-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}

/**
 * Build the user prompt for the summary agent from GatheringContext.
 * Includes user profile and full conversation history for summarization.
 */
function buildSummaryPrompt(context: GatheringContext): string {
  const lines: string[] = [];

  lines.push('## User Context');
  lines.push(`Name: ${context.name}`);
  lines.push(`Familiarity with affirmations: ${context.familiarity}`);
  lines.push(`Initial topic: ${context.initialTopic}`);
  lines.push('');

  lines.push('## Conversation History');
  if (context.exchanges.length === 0) {
    lines.push('No exchanges recorded.');
  } else {
    for (let i = 0; i < context.exchanges.length; i++) {
      const exchange = context.exchanges[i];
      lines.push(`### Exchange ${i + 1}`);
      lines.push(`Question: ${exchange.question}`);

      const answerParts: string[] = [];
      if (exchange.answer.text) {
        answerParts.push(`Free response: "${exchange.answer.text}"`);
      }
      if (exchange.answer.selectedFragments.length > 0) {
        answerParts.push(`Selected fragments: ${exchange.answer.selectedFragments.join(', ')}`);
      }
      if (answerParts.length > 0) {
        lines.push(answerParts.join('\n'));
      } else {
        lines.push('(No response provided)');
      }
      lines.push('');
    }
  }

  lines.push('');
  lines.push(
    'Write a personalized 2-3 sentence summary for this user based on their journey above. Return ONLY the summary text.'
  );

  return lines.join('\n');
}

/**
 * Server action to generate a pre-affirmation summary.
 * Shown before affirmations are generated - uses future tense about creating affirmations.
 * Returns empty string on error for graceful degradation.
 */
export async function generatePreSummary(
  context: GatheringContext,
  implementation: string = 'default'
): Promise<string> {
  try {
    // Build the user prompt from GatheringContext
    const userPrompt = buildSummaryPrompt(context);

    // Create the pre-summary agent (future tense about affirmations)
    const agent = await createFO05PreSummaryAgent(implementation);

    console.log('[fo-05-pre-summary] Implementation:', implementation);
    console.log('[fo-05-pre-summary] Name:', context.name);
    console.log('[fo-05-pre-summary] Initial topic:', context.initialTopic);
    console.log('[fo-05-pre-summary] Exchanges count:', context.exchanges.length);

    // Generate the summary
    const result = await agent.generate(userPrompt);

    console.log('[fo-05-pre-summary] Response length:', result.text.length);
    console.log('[fo-05-pre-summary] Summary:', result.text.substring(0, 200));

    // Return the summary text directly (agent returns plain text)
    return result.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-05-pre-summary] Error generating summary:', errorMessage);
    // Return empty string for graceful degradation
    return '';
  }
}

/**
 * Server action to generate a post-affirmation completion summary.
 * Shown after affirmations are generated - refers to affirmations that now exist.
 * Returns empty string on error for graceful degradation.
 */
export async function generateCompletionSummary(
  context: GatheringContext,
  implementation: string = 'default'
): Promise<string> {
  try {
    // Build the user prompt from GatheringContext
    const userPrompt = buildSummaryPrompt(context);

    // Create the post-summary agent (past/present tense about affirmations)
    const agent = await createFO05PostSummaryAgent(implementation);

    console.log('[fo-05-post-summary] Implementation:', implementation);
    console.log('[fo-05-post-summary] Name:', context.name);
    console.log('[fo-05-post-summary] Initial topic:', context.initialTopic);
    console.log('[fo-05-post-summary] Exchanges count:', context.exchanges.length);

    // Generate the summary
    const result = await agent.generate(userPrompt);

    console.log('[fo-05-post-summary] Response length:', result.text.length);
    console.log('[fo-05-post-summary] Summary:', result.text.substring(0, 200));

    // Return the summary text directly (agent returns plain text)
    return result.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-05-post-summary] Error generating summary:', errorMessage);
    // Return empty string for graceful degradation
    return '';
  }
}
