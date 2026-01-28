'use server';

import { createFO07DiscoveryAgent } from '@/src/mastra/agents/fo-07/agent';
import { createFO07AffirmationAgent } from '@/src/mastra/agents/fo-07/affirmation-agent';
import { createFO07PostSummaryAgent } from '@/src/mastra/agents/fo-07/summary-agent';

/**
 * Context accumulated during the dynamic gathering screens.
 * Same as FO-04 - chip-based input.
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
 * Same as FO-04 - chip-based responses.
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
 * Result from generating all 20 affirmations at once.
 */
export interface GenerateAffirmations20Result {
  affirmations: string[];
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
 * FO-07 discovery uses chip-based response (like FO-04).
 * Note: The agent returns initialFragments/expandedFragments but we map to chips.
 */
function isValidDynamicScreenResponse(obj: unknown): obj is DynamicScreenResponse {
  if (typeof obj !== 'object' || obj === null) return false;

  const response = obj as Record<string, unknown>;

  // Check for chip-based response (FO-04 style)
  if (
    typeof response.reflectiveStatement === 'string' &&
    typeof response.question === 'string' &&
    Array.isArray(response.initialChips) &&
    response.initialChips.every((chip) => typeof chip === 'string') &&
    Array.isArray(response.expandedChips) &&
    response.expandedChips.every((chip) => typeof chip === 'string') &&
    typeof response.readyForAffirmations === 'boolean'
  ) {
    return true;
  }

  // Also accept fragment-based response and convert to chips (for FO-07 agent compatibility)
  if (
    typeof response.question === 'string' &&
    Array.isArray(response.initialFragments) &&
    response.initialFragments.every((fragment) => typeof fragment === 'string') &&
    Array.isArray(response.expandedFragments) &&
    response.expandedFragments.every((fragment) => typeof fragment === 'string') &&
    typeof response.readyForAffirmations === 'boolean'
  ) {
    // Map fragments to chips
    (response as Record<string, unknown>).initialChips = response.initialFragments;
    (response as Record<string, unknown>).expandedChips = response.expandedFragments;
    (response as Record<string, unknown>).reflectiveStatement =
      response.reflectiveStatement || '';
    return true;
  }

  return false;
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
 * Server action to generate a dynamic discovery screen using the FO-07 agent.
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
    const agent = await createFO07DiscoveryAgent('default');

    console.log('[fo-07] Screen number:', context.screenNumber);
    console.log('[fo-07] Exchanges count:', context.exchanges.length);
    console.log('[fo-07] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt);

    console.log('[fo-07] Response length:', result.text.length);
    console.log('[fo-07] Raw response:', result.text.substring(0, 500));

    // Parse JSON response
    const response = parseDynamicScreenResponse(result.text);

    if (!response) {
      console.error('[fo-07] Failed to parse response:', result.text.substring(0, 500));
      return {
        reflectiveStatement: '',
        question: '',
        initialChips: [],
        expandedChips: [],
        readyForAffirmations: false,
        error: 'Failed to parse agent response',
      };
    }

    console.log('[fo-07] Parsed successfully');
    console.log('[fo-07] readyForAffirmations:', response.readyForAffirmations);

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-07] Error generating dynamic screen:', errorMessage);
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
 * FO-07 generates all 20 at once - no feedback loop.
 */
function buildAffirmationPrompt(context: GatheringContext): string {
  const lines: string[] = [];

  // User profile section
  lines.push('## User Profile');
  lines.push(`Name: ${context.name}`);
  lines.push(`Familiarity with affirmations: ${context.familiarity}`);
  lines.push(`Primary topic: ${context.initialTopic}`);
  lines.push('');

  // Exchange history section
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

  lines.push('');
  lines.push(
    'Generate 20 unique, personalized affirmations based on everything shared above. Return ONLY a JSON array of 20 strings.'
  );

  return lines.join('\n');
}

/**
 * Server action to generate all 20 affirmations at once.
 * FO-07 does not use a feedback loop - generates all affirmations in a single call.
 */
export async function generateAffirmations20(
  context: GatheringContext,
  implementation: string = 'default'
): Promise<GenerateAffirmations20Result> {
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
    const userPrompt = buildAffirmationPrompt(context);

    // Use FO-07 affirmation agent
    const agent = await createFO07AffirmationAgent(implementation);

    console.log('[fo-07-affirmations] Implementation:', implementation);
    console.log('[fo-07-affirmations] Exchanges count:', context.exchanges.length);
    console.log('[fo-07-affirmations] User prompt:', userPrompt);

    // Generate with Mastra agent (using default temperature from agent)
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature: 0.9,
      },
    });

    console.log('[fo-07-affirmations] Response length:', result.text.length);

    // Parse JSON array response
    const affirmations = parseAffirmationsResponse(result.text);

    if (affirmations.length === 0) {
      console.error(
        '[fo-07-affirmations] Failed to parse affirmations from response:',
        result.text.substring(0, 500)
      );
      return {
        affirmations: [],
        error: 'Failed to parse affirmations from agent response',
      };
    }

    console.log('[fo-07-affirmations] Parsed affirmations count:', affirmations.length);

    return { affirmations };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-07-affirmations] Error generating affirmations:', errorMessage);
    return {
      affirmations: [],
      error: errorMessage,
    };
  }
}

/**
 * Build the user prompt for the summary agent from GatheringContext.
 */
function buildSummaryPrompt(context: GatheringContext, affirmationTypes: string[]): string {
  const lines: string[] = [];

  lines.push('## User Context');
  lines.push(`Name: ${context.name}`);
  lines.push(`Familiarity with affirmations: ${context.familiarity}`);
  lines.push(`Primary topic: ${context.initialTopic}`);
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
  }

  if (affirmationTypes.length > 0) {
    lines.push('## Affirmation Themes');
    lines.push('The affirmations created for this user touch on these themes:');
    affirmationTypes.forEach((type) => {
      lines.push(`- ${type}`);
    });
    lines.push('');
  }

  lines.push('');
  lines.push(
    'Write a personalized 2-3 sentence summary for this user based on their journey above. Return ONLY the summary text.'
  );

  return lines.join('\n');
}

/**
 * Server action to generate a review summary.
 * Used on the review screen header to summarize the user's journey.
 * Returns empty string on error for graceful degradation.
 */
export async function generateReviewSummary(
  context: GatheringContext,
  affirmationTypes: string[] = [],
  implementation: string = 'default'
): Promise<string> {
  try {
    // Build the user prompt from GatheringContext and affirmation types
    const userPrompt = buildSummaryPrompt(context, affirmationTypes);

    // Create the post-summary agent (past/present tense about affirmations)
    const agent = await createFO07PostSummaryAgent(implementation);

    console.log('[fo-07-summary] Implementation:', implementation);
    console.log('[fo-07-summary] Name:', context.name);
    console.log('[fo-07-summary] Exchanges count:', context.exchanges.length);
    console.log('[fo-07-summary] Affirmation types:', affirmationTypes.length);

    // Generate the summary
    const result = await agent.generate(userPrompt);

    console.log('[fo-07-summary] Response length:', result.text.length);
    console.log('[fo-07-summary] Summary:', result.text.substring(0, 200));

    // Return the summary text directly (agent returns plain text)
    return result.text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[fo-07-summary] Error generating summary:', errorMessage);
    // Return empty string for graceful degradation
    return '';
  }
}
