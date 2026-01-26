'use server';

import { createFO06DiscoveryAgent } from '@/src/mastra/agents/fo-06/agent';
import { createFO06AffirmationAgent } from '@/src/mastra/agents/fo-06/affirmation-agent';
import {
  createFO06PreSummaryAgent,
  createFO06PostSummaryAgent,
} from '@/src/mastra/agents/fo-06/summary-agent';
import { renderTemplate, getTemplateText } from '@/src/services';
import {
  FIXED_OPENING_QUESTION,
  type GatheringContext,
  type DynamicScreenResponse,
  type FirstScreenFragmentsResponse,
  type FO06GenerateBatchOptions,
  type FO06GenerateBatchResult,
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
 * FO-06 removes reflectiveStatement from validation.
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
 */
async function buildFirstScreenPrompt(name: string, implementation: string): Promise<string> {
  try {
    const { output } = await renderTemplate({
      key: 'prompt_first_screen',
      version: 'fo-06-discovery',
      implementation,
      variables: { name },
    });
    return output;
  } catch (error) {
    // Fallback to hardcoded prompt if template not found
    console.warn('[fo-06] Template not found, using fallback:', error);
    return `## User Context
Name: ${name}
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
      version: 'fo-06-discovery',
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
    console.warn('[fo-06] Template not found, using fallback:', error);
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
 */
export async function generateFirstScreenFragments(
  name: string,
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
    const userPrompt = await buildFirstScreenPrompt(name, implementation);

    // Create agent
    const agent = await createFO06DiscoveryAgent(implementation);

    console.log('[fo-06] Generating first screen fragments for:', name);
    console.log('[fo-06] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-06] Response length:', result.text.length);
    console.log('[fo-06] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseFirstScreenFragments(result.text);

    if (!response) {
      console.error('[fo-06] Failed to parse first screen response:', result.text.substring(0, 500));
      return {
        initialFragments: [],
        expandedFragments: [],
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-06] Parsed first screen fragments successfully');

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-06] Error generating first screen fragments:', errorMessage);
    return {
      initialFragments: [],
      expandedFragments: [],
      error: errorMessage,
    };
  }
}

/**
 * Server action to generate a dynamic discovery screen using the FO-06 agent.
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
    const agent = await createFO06DiscoveryAgent(implementation);

    console.log('[fo-06] Screen number:', context.screenNumber);
    console.log('[fo-06] Exchanges count:', context.exchanges.length);
    console.log('[fo-06] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-06] Response length:', result.text.length);
    console.log('[fo-06] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseDynamicScreenResponse(result.text);

    if (!response) {
      console.error('[fo-06] Failed to parse response:', result.text.substring(0, 500));
      return {
        question: '',
        initialFragments: [],
        expandedFragments: [],
        readyForAffirmations: false,
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-06] Parsed successfully');
    console.log('[fo-06] readyForAffirmations:', response.readyForAffirmations);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-06] Error generating dynamic screen:', errorMessage);
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
 * FO-06 simplifies: no familiarity, no initialTopic, simpler answer structure.
 */
function buildAffirmationPrompt(
  context: GatheringContext,
  approvedAffirmations: string[],
  skippedAffirmations: string[]
): string {
  const lines: string[] = [];

  // User profile section - simplified for FO-06
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
 * Server action to generate a batch of 10 affirmations using the FO-06 agent.
 */
export async function generateAffirmationBatchFO06(
  options: FO06GenerateBatchOptions
): Promise<FO06GenerateBatchResult> {
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

    // Use FO-06 affirmation agent
    const agent = await createFO06AffirmationAgent(implementation);

    console.log('[fo-06-affirmations] Implementation:', implementation);
    console.log('[fo-06-affirmations] Batch number:', batchNumber);
    console.log('[fo-06-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-06-affirmations] Approved count:', approvedAffirmations.length);
    console.log('[fo-06-affirmations] Skipped count:', skippedAffirmations.length);
    console.log('[fo-06-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-06-affirmations] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-06-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-06-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-06-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}

/**
 * Build the user prompt for the summary agent from GatheringContext.
 * FO-06 simplifies: no familiarity, no initialTopic.
 */
function buildSummaryPrompt(context: GatheringContext): string {
  const lines: string[] = [];

  lines.push('## User Context');
  lines.push(`Name: ${context.name}`);
  lines.push('');

  lines.push('## Conversation History');
  if (context.exchanges.length === 0) {
    lines.push('No exchanges recorded.');
  } else {
    for (let i = 0; i < context.exchanges.length; i++) {
      const exchange = context.exchanges[i];
      lines.push(`### Exchange ${i + 1}`);
      lines.push(`Question: ${exchange.question}`);

      if (exchange.answer.text) {
        lines.push(`Response: "${exchange.answer.text}"`);
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
    const agent = await createFO06PreSummaryAgent(implementation);

    console.log('[fo-06-pre-summary] Implementation:', implementation);
    console.log('[fo-06-pre-summary] Name:', context.name);
    console.log('[fo-06-pre-summary] Exchanges count:', context.exchanges.length);

    // Generate the summary
    const result = await agent.generate(userPrompt);

    console.log('[fo-06-pre-summary] Response length:', result.text.length);
    console.log('[fo-06-pre-summary] Summary:', result.text.substring(0, 200));

    // Return the summary text directly (agent returns plain text)
    return result.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-06-pre-summary] Error generating summary:', errorMessage);
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
    const agent = await createFO06PostSummaryAgent(implementation);

    console.log('[fo-06-post-summary] Implementation:', implementation);
    console.log('[fo-06-post-summary] Name:', context.name);
    console.log('[fo-06-post-summary] Exchanges count:', context.exchanges.length);

    // Generate the summary
    const result = await agent.generate(userPrompt);

    console.log('[fo-06-post-summary] Response length:', result.text.length);
    console.log('[fo-06-post-summary] Summary:', result.text.substring(0, 200));

    // Return the summary text directly (agent returns plain text)
    return result.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-06-post-summary] Error generating summary:', errorMessage);
    // Return empty string for graceful degradation
    return '';
  }
}
