'use server';

import { createAltProcess2Agent } from '@/src/mastra/agents/alt-process-2';
import { getKVText, renderTemplate } from '@/src/services';

export interface AP02GenerateRequest {
  isInitial?: boolean;
  tonePreference?: 'gentle' | 'strong' | 'change_topic';
  savedAffirmations?: string[];
  skippedAffirmations?: string[];
  shownAffirmations?: string[];
  totalSwipes?: number;
  implementation?: string;
}

export interface AP02GenerateResponse {
  affirmations: string[];
}

function parseResponse(text: string): AP02GenerateResponse {
  // Try to parse as JSON object with affirmations
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.affirmations && Array.isArray(parsed.affirmations)) {
        return { affirmations: parsed.affirmations };
      }
    } catch {
      // fall through
    }
  }

  // Fallback: try to extract array
  const affirmationsMatch = text.match(/"affirmations"\s*:\s*\[([\s\S]*?)\]/);
  if (affirmationsMatch) {
    const affStrings = affirmationsMatch[1].match(/"([^"]+)"/g);
    if (affStrings) {
      return {
        affirmations: affStrings.map((s) => s.replace(/"/g, '')),
      };
    }
  }

  // Return default exploration batch if parsing fails
  return {
    affirmations: [
      'I am enough.',
      'I trust my journey.',
      'I am learning to embrace uncertainty.',
      'My peace comes from within.',
      'I choose to be present.',
      'I am worthy of rest.',
      'I allow myself to grow.',
      'My strength is quiet and steady.',
      'I am becoming who I need to be.',
      'I honor my own pace.',
    ],
  };
}

function buildFallbackPrompt(options: AP02GenerateRequest): string {
  const {
    isInitial = false,
    tonePreference,
    savedAffirmations = [],
    skippedAffirmations = [],
    shownAffirmations = [],
    totalSwipes = 0,
  } = options;

  const parts: string[] = [];

  if (isInitial || totalSwipes < 10) {
    parts.push(`Generate 10-12 diverse affirmations for EXPLORATION.`);
    parts.push(`Include variety across: subjects, tones, lengths, and structures.`);
    parts.push(`This helps us learn what the user prefers.`);
  } else {
    parts.push(`Generate 10-12 PERSONALIZED affirmations based on user behavior.`);
    parts.push(`Total swipes so far: ${totalSwipes}`);
  }

  if (tonePreference === 'gentle') {
    parts.push(`\nTone override: Generate GENTLER, CALMER affirmations.`);
  } else if (tonePreference === 'strong') {
    parts.push(`\nTone override: Generate STRONGER, more DIRECT affirmations.`);
  } else if (tonePreference === 'change_topic') {
    parts.push(`\nTopic reset: Generate fresh variety across DIFFERENT themes.`);
  }

  if (savedAffirmations.length > 0) {
    parts.push(`\nUser SAVED these (swipe right - they liked them):`);
    savedAffirmations.forEach((a) => parts.push(`- ${a}`));
    parts.push(`Generate MORE like these patterns.`);
  }

  if (skippedAffirmations.length > 0) {
    parts.push(`\nUser SKIPPED these (swipe left - didn't resonate):`);
    skippedAffirmations.slice(-20).forEach((a) => parts.push(`- ${a}`));
    parts.push(`AVOID similar patterns.`);
  }

  if (shownAffirmations.length > 0) {
    parts.push(`\nDo NOT repeat these (already shown):`);
    shownAffirmations.forEach((a) => parts.push(`- ${a}`));
  }

  return parts.join('\n');
}

export async function generateAP02(
  options: AP02GenerateRequest
): Promise<AP02GenerateResponse> {
  const { implementation = 'default', isInitial = false, totalSwipes = 0 } = options;

  const agent = await createAltProcess2Agent(implementation);

  // Build template variables
  const templateVariables = {
    isInitial,
    tonePreference: options.tonePreference,
    savedAffirmations: options.savedAffirmations ?? [],
    skippedAffirmations: options.skippedAffirmations ?? [],
    shownAffirmations: options.shownAffirmations ?? [],
    totalSwipes,
  };

  // Determine which prompt to use
  const isExploration = isInitial || totalSwipes < 10;
  const promptKey = isExploration ? 'prompt_explore' : 'prompt_personalize';

  // Try to render from KV, fall back to hardcoded prompt
  let userPrompt: string;
  try {
    const rendered = await renderTemplate({
      key: promptKey,
      version: 'ap-02',
      implementation,
      variables: templateVariables,
    });
    userPrompt = rendered.output;
  } catch {
    // KV not configured yet → safe fallback
    userPrompt = buildFallbackPrompt(options);
  }

  // KV-configurable temperature (fallback: 0.9)
  const temperatureKey = `versions.ap-02._temperature.${implementation}`;
  const temperatureStr = await getKVText(temperatureKey);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.9;

  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  return parseResponse(result.text);
}
