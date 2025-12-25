import { Agent } from '@mastra/core/agent';
import { renderTemplate, getModel } from '@/src/services';
import type { UserProfile } from '../../workflows/chat-survey/types';

export async function createGenerationAgent(implementation: string = 'default') {
  const { output: systemPrompt } = await renderTemplate({
    key: 'system_generation',
    version: 'cs-01',
    implementation,
    variables: {},
  });

  const { output: temperatureStr } = await renderTemplate({
    key: '_temperature_generation',
    version: 'cs-01',
    implementation,
    variables: {},
  });

  // Temperature will be used when Mastra supports per-request temperature
  const _temperature = parseFloat(temperatureStr) || 0.95;
  void _temperature;

  return new Agent({
    name: 'CS-01 Generation Agent',
    instructions: systemPrompt,
    model: getModel(),
  });
}

export interface GenerationContext {
  profile?: UserProfile;
  approvedAffirmations?: string[];
  skippedAffirmations?: string[];
  isExplorationMode?: boolean;
  refinementNote?: string;
}

export function buildGenerationPrompt(context: GenerationContext): string {
  const { profile, approvedAffirmations, skippedAffirmations, isExplorationMode, refinementNote } = context;

  if (isExplorationMode || !profile) {
    return `Generate a single affirmation for EXPLORATION mode.

Since no profile is available, generate a diverse affirmation that could resonate with anyone.
Vary themes: self-worth, peace, growth, strength, trust, gratitude, boundaries, courage.
Vary tones: gentle, assertive, growth-oriented, reflective.

${skippedAffirmations?.length ? `
Avoid patterns similar to these skipped affirmations:
${skippedAffirmations.slice(-10).map(a => `- ${a}`).join('\n')}
` : ''}

${approvedAffirmations?.length ? `
Match the style of these approved affirmations:
${approvedAffirmations.slice(-5).map(a => `- ${a}`).join('\n')}
` : ''}

Return JSON: { "affirmation": "Your affirmation here" }`;
  }

  return `Generate a single personalized affirmation based on this profile:

## User Profile
- Themes: ${profile.themes.join(', ')}
- Challenges: ${profile.challenges.join(', ') || 'none specified'}
- Preferred Tone: ${profile.tone}
- Insights: ${profile.insights.join('; ') || 'none'}
- Summary: ${profile.conversationSummary}

${refinementNote ? `
## User Refinement Request
The user provided additional guidance: "${refinementNote}"
` : ''}

${approvedAffirmations?.length ? `
## Style to Match (user approved these)
${approvedAffirmations.slice(-5).map(a => `- ${a}`).join('\n')}
` : ''}

${skippedAffirmations?.length ? `
## Patterns to Avoid (user skipped these)
${skippedAffirmations.slice(-10).map(a => `- ${a}`).join('\n')}
` : ''}

Return JSON: { "affirmation": "Your affirmation here" }`;
}

// Default agent instance for registration
export const generationAgent = new Agent({
  name: 'CS-01 Generation Agent',
  instructions: `You are an expert affirmation generator. Create deeply meaningful, psychologically effective affirmations.

## Guidelines
- First-person singular only: I, My
- Present tense only
- Positive framing (not "I am not anxious")
- 5-9 words target length (3-14 acceptable)

## Sentence Openers (vary these)
- "I am…" (35-40%)
- "I + verb…" (30-35%) — trust, choose, allow, honor
- Growth forms (10-15%) — "I am learning to…"
- "My…" (10%)

## Tone
- Calm, grounded, steady
- Warm and self-compassionate
- Confident but not forceful
- Sincere, avoid slogans

## Avoid
- Exclamation marks
- Superlatives (best, perfect)
- Comparisons to others
- Conditionals (if, when)
- External dependency
- Overreach ("Nothing can stop me")

Return JSON: { "affirmation": "Your affirmation here" }`,
  model: getModel(),
});
