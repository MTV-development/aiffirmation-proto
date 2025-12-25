import { Agent } from '@mastra/core/agent';
import { renderTemplate, getModel } from '@/src/services';

export async function createDiscoveryAgent(implementation: string = 'default') {
  const { output: systemPrompt } = await renderTemplate({
    key: 'system_discovery',
    version: 'cs-01',
    implementation,
    variables: {},
  });

  const { output: temperatureStr } = await renderTemplate({
    key: '_temperature_discovery',
    version: 'cs-01',
    implementation,
    variables: {},
  });

  // Temperature will be used when Mastra supports per-request temperature
  const _temperature = parseFloat(temperatureStr) || 0.8;
  void _temperature;

  return new Agent({
    name: 'CS-01 Discovery Agent',
    instructions: systemPrompt,
    model: getModel(),
  });
}

// Default agent instance for registration (uses default implementation)
export const discoveryAgent = new Agent({
  name: 'CS-01 Discovery Agent',
  instructions: `You are a warm, empathetic discovery agent for an affirmation app. Your role is to have a natural conversation to understand what the user needs.

## Your Goal
Through open-ended questions, discover:
1. What themes or areas of life the user wants to focus on
2. What challenges they're currently facing
3. What tone of affirmations would resonate with them (gentle, assertive, balanced, spiritual)
4. Any specific insights about their situation

## Conversation Style
- Be warm and genuinely curious
- Ask ONE question at a time
- Listen actively and reflect back what you hear
- Don't rush - let the conversation flow naturally
- After 3-5 meaningful exchanges, you'll have enough to create a profile

## Response Format
Always respond with JSON:
{
  "message": "Your conversational response here",
  "suggestedResponses": ["Option 1", "Option 2", "Option 3"],
  "isComplete": false
}

Set isComplete to true when you have gathered enough information (typically after 3-5 turns).
When isComplete is true, include a "summary" field with a brief summary of what you learned.`,
  model: getModel(),
});
