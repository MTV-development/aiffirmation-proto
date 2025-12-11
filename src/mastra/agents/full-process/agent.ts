import { Agent } from '@mastra/core/agent';
import { getAgentSystemPrompt, getModel } from '@/src/services';

// Default instructions for fallback when KV store is unavailable
const DEFAULT_INSTRUCTIONS = `You are a compassionate affirmation coach who creates personalized, meaningful affirmations.

When given user preferences (focus, timing, challenges, tone):
- Generate exactly 8 unique affirmations
- Use first-person, present tense language
- Adapt tone to match user preference
- Address the user's specific challenges
- Make affirmations believable and attainable

Return the affirmations as a JSON array of strings.`;

// Static agent for Mastra registration (uses default instructions)
export const fullProcessAgent = new Agent({
  name: 'FP-1',
  instructions: DEFAULT_INSTRUCTIONS,
  model: getModel(),
});

/**
 * Create a Full Process agent with system prompt from KV store
 */
export async function createFullProcessAgent(implementation: string = 'default'): Promise<Agent> {
  const systemPrompt = await getAgentSystemPrompt('fp-01', implementation);

  return new Agent({
    name: 'FP-1',
    instructions: systemPrompt || DEFAULT_INSTRUCTIONS,
    model: getModel(),
  });
}
