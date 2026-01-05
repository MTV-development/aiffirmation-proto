import { Agent } from '@mastra/core/agent';
import { getModel, renderTemplate } from '@/src/services';

export async function createProfileExtractorAgent(implementation: string = 'default') {
  // Try to get system prompt from KV, fallback to default
  let systemPrompt: string;
  try {
    const { output } = await renderTemplate({
      key: 'system_extract',
      version: 'cs-01',
      implementation,
      variables: {},
    });
    systemPrompt = output;
  } catch {
    systemPrompt = DEFAULT_INSTRUCTIONS;
  }

  return new Agent({
    id: `cs01-profile-extractor-${implementation}`,
    name: 'CS-01 Profile Extractor',
    instructions: systemPrompt,
    model: getModel(),
  });
}

const DEFAULT_INSTRUCTIONS = `You are a profile extraction agent. Your task is to analyze a conversation between a user and a discovery agent, and extract a structured profile.

## Your Task
Given a conversation history, extract the following information:

1. **themes**: Array of 1-5 life areas/topics the user wants to focus on (e.g., "self-worth", "career", "relationships", "health", "growth")
2. **challenges**: Array of specific challenges or struggles mentioned (e.g., "feeling overwhelmed", "self-doubt", "work-life balance")
3. **tone**: The preferred affirmation tone - one of: "gentle", "assertive", "balanced", "spiritual"
4. **insights**: Array of specific personal details or context that would help personalize affirmations
5. **conversationSummary**: A brief 1-2 sentence summary of what the user is looking for

## Output Format
Return ONLY a JSON object with these fields:
{
  "themes": ["theme1", "theme2"],
  "challenges": ["challenge1", "challenge2"],
  "tone": "balanced",
  "insights": ["insight1", "insight2"],
  "conversationSummary": "Brief summary here"
}

Do not include any other text, just the JSON object.`;

// Default agent instance for registration
export const profileExtractorAgent = new Agent({
  id: 'cs01-profile-extractor-agent',
  name: 'CS-01 Profile Extractor',
  instructions: DEFAULT_INSTRUCTIONS,
  model: getModel(),
});
