import { Agent } from '@mastra/core/agent';
import { getAgentSystemPrompt } from '@/src/services';

// This matches the rendered output of versions.af-01.system.default
const DEFAULT_INSTRUCTIONS = `You are an affirmation generator that creates personalized, positive affirmations.

When given a list of themes and optional additional context:
- Generate exactly 10 unique affirmations
- Each affirmation should be positive, present-tense, and first-person ("I am...", "I have...", "I attract...")
- Tailor affirmations to the selected themes
- If additional context is provided, incorporate it meaningfully
- Make affirmations specific and actionable, not generic
- Vary the structure and opening words of each affirmation

Return the affirmations as a numbered list (1-10).`;

// Static agent for Mastra registration (uses default instructions)
export const af1Agent = new Agent({
  name: 'AF-1',
  instructions: DEFAULT_INSTRUCTIONS,
  model: 'openai/gpt-4o-mini',
});

/**
 * Create an AF-01 agent with system prompt from KV store
 */
export async function createAF01Agent(implementation: string = 'default'): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt('af-01', implementation);

  return new Agent({
    name: 'AF-1',
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: 'openai/gpt-4o-mini',
  });
}
