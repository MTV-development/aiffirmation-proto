'use server';

import { createAltProcess1Agent } from '@/src/mastra/agents/alt-process-1';
import { getKVText, renderTemplate } from '@/src/services';

export interface AP01GenerateRequest {
  userInput: string;
  previousAffirmations?: string[];
  savedAffirmations?: string[];
  skippedAffirmations?: string[];
  implementation?: string;
}

export interface AP01GenerateResponse {
  tags: string[];
  affirmations: string[];
}

function parseResponse(text: string): AP01GenerateResponse {
  // Try to parse as JSON object with tags and affirmations
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.tags && parsed.affirmations) {
        return {
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          affirmations: Array.isArray(parsed.affirmations) ? parsed.affirmations : [],
        };
      }
    } catch {
      // fall through
    }
  }

  // Fallback: try to extract arrays separately
  const tagsMatch = text.match(/"tags"\s*:\s*\[([\s\S]*?)\]/);
  const affirmationsMatch = text.match(/"affirmations"\s*:\s*\[([\s\S]*?)\]/);

  const tags: string[] = [];
  const affirmations: string[] = [];

  if (tagsMatch) {
    const tagStrings = tagsMatch[1].match(/"([^"]+)"/g);
    if (tagStrings) {
      tags.push(...tagStrings.map((s) => s.replace(/"/g, '')));
    }
  }

  if (affirmationsMatch) {
    const affStrings = affirmationsMatch[1].match(/"([^"]+)"/g);
    if (affStrings) {
      affirmations.push(...affStrings.map((s) => s.replace(/"/g, '')));
    }
  }

  // If we still have nothing, return defaults
  if (tags.length === 0) {
    tags.push('Reflection', 'Growth', 'Self-care');
  }

  if (affirmations.length === 0) {
    affirmations.push(
      'I am worthy of care and compassion.',
      'I trust my journey.',
      'I am enough as I am.'
    );
  }

  return { tags, affirmations };
}

// Fallback prompt builders (used if KV not configured)
function buildFallbackPrompt(options: AP01GenerateRequest): string {
  const { userInput } = options;
  return `The user shared the following thoughts:

"${userInput}"

Based on this, extract 3-6 emotional/contextual tags and generate 6-8 personalized affirmations.`;
}

function buildFallbackShufflePrompt(options: AP01GenerateRequest): string {
  const {
    userInput,
    previousAffirmations = [],
    savedAffirmations = [],
    skippedAffirmations = [],
  } = options;

  return [
    `The user shared the following thoughts:`,
    ``,
    `"${userInput}"`,
    ``,
    `Generate 6-8 NEW personalized affirmations based on this context.`,
    `Keep the same tags you identified before.`,
    ``,
    `IMPORTANT - Do NOT repeat these (already shown): ${JSON.stringify(previousAffirmations)}`,
    savedAffirmations.length
      ? `\nUser approved these (generate MORE with similar style/tone): ${JSON.stringify(savedAffirmations)}`
      : null,
    skippedAffirmations.length
      ? `\nUser skipped these (AVOID similar phrasing/structure): ${JSON.stringify(skippedAffirmations)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function generateAP01(
  options: AP01GenerateRequest
): Promise<AP01GenerateResponse> {
  const { implementation = 'default', previousAffirmations = [] } = options;
  const isShuffle = previousAffirmations.length > 0;

  const agent = await createAltProcess1Agent(implementation);

  // Build template variables
  const templateVariables = {
    userInput: options.userInput,
    previousAffirmations: options.previousAffirmations ?? [],
    savedAffirmations: options.savedAffirmations ?? [],
    skippedAffirmations: options.skippedAffirmations ?? [],
  };

  // Try to render from KV, fall back to hardcoded prompt
  let userPrompt: string;
  try {
    const promptKey = isShuffle ? 'prompt_shuffle' : 'prompt';
    const rendered = await renderTemplate({
      key: promptKey,
      version: 'ap-01',
      implementation,
      variables: templateVariables,
    });
    userPrompt = rendered.output;
  } catch {
    // KV not configured yet → safe fallback
    userPrompt = isShuffle
      ? buildFallbackShufflePrompt(options)
      : buildFallbackPrompt(options);
  }

  // KV-configurable temperature (fallback: 0.9)
  const temperatureKey = `versions.ap-01._temperature.${implementation}`;
  const temperatureStr = await getKVText(temperatureKey);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.9;

  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  return parseResponse(result.text);
}
