'use server';

import { createFullProcess3Agent } from '@/src/mastra/agents/full-process-3';
import { getKVText, renderTemplate } from '@/src/services';
import type { GenerateResult, UserPreferences } from '@/src/full-process/types';

export interface GenerateFullProcess3Options {
  /** Core discovery fields */
  preferences: UserPreferences;
  /** Optional: extra steering from the chat */
  styleHints?: {
    /** Example affirmations the user liked as inspiration */
    likedExamples?: string[];
    /** Freeform “make it more like…” guidance */
    notes?: string;
    /** Words or topics to avoid */
    avoid?: string[];
  };
  /** Previously shown affirmations to avoid repeating */
  previousAffirmations?: string[];
  /** Affirmations the user approved (liked) this session */
  approvedAffirmations?: string[];
  /** Affirmations the user skipped this session */
  skippedAffirmations?: string[];
  /** Implementation to use (default: 'default') */
  implementation?: string;
}

function parseAffirmationsResponse(text: string): string[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) return parsed;
    } catch {
      // fall through
    }
  }

  const lines = text.split('\n').filter((line) => line.trim());
  const affirmations: string[] = [];
  for (const line of lines) {
    const match = line.match(/^[\d\-\*•]+[.\):\s]+(.+)/);
    if (match) affirmations.push(match[1].trim());
  }

  return affirmations.length > 0 ? affirmations : [text.trim()];
}

function buildUserPrompt(options: GenerateFullProcess3Options): string {
  const { preferences, styleHints, previousAffirmations = [], approvedAffirmations = [], skippedAffirmations = [] } =
    options;

  const avoid = (styleHints?.avoid ?? []).filter(Boolean);
  const likedExamples = (styleHints?.likedExamples ?? []).filter(Boolean);
  const notes = styleHints?.notes?.trim() ?? '';

  return [
    `Create affirmations for the user based on the context below.`,
    ``,
    `User focus: ${preferences.focus}`,
    `User friction (what gets in the way): ${preferences.challenges.join(', ') || '(none provided)'}`,
    `Preferred tone: ${preferences.tone}`,
    likedExamples.length ? `Example lines the user liked: ${JSON.stringify(likedExamples)}` : null,
    notes ? `Style notes: ${notes}` : null,
    avoid.length ? `Avoid words/topics: ${JSON.stringify(avoid)}` : null,
    previousAffirmations.length ? `Do not repeat these (already shown): ${JSON.stringify(previousAffirmations)}` : null,
    approvedAffirmations.length
      ? `User approved (generate MORE like these, without copying): ${JSON.stringify(approvedAffirmations)}`
      : null,
    skippedAffirmations.length
      ? `User skipped (avoid similar wording/structure): ${JSON.stringify(skippedAffirmations)}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function generateFullProcess3Affirmations(
  options: GenerateFullProcess3Options
): Promise<GenerateResult> {
  const { implementation = 'default' } = options;

  const agent = await createFullProcess3Agent(implementation);
  const templateVariables = {
    focus: options.preferences.focus,
    challenges: options.preferences.challenges.join(', ') || '',
    tone: options.preferences.tone,
    notes: options.styleHints?.notes || '',
    likedExamples: options.styleHints?.likedExamples ?? [],
    avoid: options.styleHints?.avoid ?? [],
    previousAffirmations: options.previousAffirmations ?? [],
    approvedAffirmations: options.approvedAffirmations ?? [],
    skippedAffirmations: options.skippedAffirmations ?? [],
  };

  let userPrompt: string;
  try {
    const rendered = await renderTemplate({
      key: 'prompt',
      version: 'fp-03',
      implementation,
      variables: templateVariables,
    });
    userPrompt = rendered.output;
  } catch {
    // KV not configured yet → safe fallback
    userPrompt = buildUserPrompt(options);
  }

  // KV-configurable temperature (fallback: 0.9)
  const temperatureKey = `versions.fp-03._temperature.${implementation}`;
  const temperatureStr = await getKVText(temperatureKey);
  const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.9;

  const result = await agent.generate(userPrompt, {
    modelSettings: {
      temperature,
    },
  });

  return {
    affirmations: parseAffirmationsResponse(result.text),
    model: 'fp-03',
  };
}


