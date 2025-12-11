'use server';

import { createFullProcessAgent } from '@/src/mastra/agents/full-process';
import { renderTemplate, getAgentModelName, getKVText } from '@/src/services';
import type { UserPreferences, AdjustedPreferences, GenerateResult } from '@/src/full-process/types';

interface GenerateFullProcessOptions {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;
  /** Optional: adjusted preferences from check-in */
  adjustedPreferences?: AdjustedPreferences;
  /** Implementation to use (default: 'default') */
  implementation?: string;
  /** Previously shown affirmations to avoid repeating */
  previousAffirmations?: string[];
}

/**
 * Parse JSON array from AI response
 * Handles various response formats and extracts affirmations
 */
function parseAffirmationsResponse(text: string): string[] {
  // Try to extract JSON array from the response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      // Fall through to numbered list parsing
    }
  }

  // Fall back to parsing numbered list format
  const lines = text.split('\n').filter(line => line.trim());
  const affirmations: string[] = [];

  for (const line of lines) {
    // Match lines that start with a number or bullet
    const match = line.match(/^[\d\-\*•]+[.\):\s]+(.+)/);
    if (match) {
      affirmations.push(match[1].trim());
    } else if (line.startsWith('"') || line.startsWith("'")) {
      // Handle quoted strings
      affirmations.push(line.replace(/^["']|["']$/g, '').trim());
    }
  }

  return affirmations.length > 0 ? affirmations : [text.trim()];
}

/**
 * Generate fallback affirmations when API fails
 * Uses the user's focus and challenges to create contextual placeholders
 */
function generateFallbackAffirmations(preferences: UserPreferences): string[] {
  const { focus, challenges, tone } = preferences;

  const challengeText = challenges.length > 0 ? challenges[0] : 'challenges';

  // Base affirmations that incorporate user context
  const baseAffirmations = [
    `I am worthy of success in ${focus}.`,
    `Every day, I grow stronger in my ${focus} journey.`,
    `I release ${challengeText.toLowerCase()} and embrace my potential.`,
    `My path in ${focus} unfolds with grace and ease.`,
    `I trust myself to navigate ${challengeText.toLowerCase()}.`,
    `I am becoming more confident in ${focus}.`,
    `I choose to focus on progress, not perfection.`,
    `My efforts in ${focus} are valuable and meaningful.`,
  ];

  // Adjust tone if needed (gentle vs powerful)
  if (tone.toLowerCase().includes('powerful') || tone.toLowerCase().includes('commanding')) {
    return [
      `I command success in ${focus}.`,
      `I am unstoppable in my ${focus} journey.`,
      `${challengeText} has no power over me.`,
      `I take bold action toward ${focus}.`,
      `I own my achievements in ${focus}.`,
      `I am the architect of my ${focus} success.`,
      `I face ${challengeText.toLowerCase()} with unwavering strength.`,
      `My determination in ${focus} is unshakeable.`,
    ];
  }

  return baseAffirmations;
}

/**
 * Server action to generate affirmations using FP-01 Mastra agent.
 * Runs server-side with full access to Mastra features.
 */
export async function generateFullProcessAffirmations(
  options: GenerateFullProcessOptions
): Promise<GenerateResult> {
  const { preferences, adjustedPreferences, implementation = 'default', previousAffirmations = [] } = options;

  // Merge preferences with adjustments
  const effectivePreferences: UserPreferences = {
    ...preferences,
    challenges: adjustedPreferences?.challenges ?? preferences.challenges,
    tone: adjustedPreferences?.tone ?? preferences.tone,
  };

  // Build template variables
  const templateVariables = {
    focus: effectivePreferences.focus,
    timing: effectivePreferences.timing.join(', '),
    challenges: effectivePreferences.challenges.join(', ') || 'general life challenges',
    tone: effectivePreferences.tone,
    feedback: adjustedPreferences?.feedback || '',
    previousAffirmations,
  };

  try {
    // Render user prompt from KV store
    const { output: userPrompt } = await renderTemplate({
      key: 'prompt',
      version: 'fp-01',
      implementation,
      variables: templateVariables,
    });

    // Get temperature from KV store (with fallback)
    const temperatureKey = `versions.fp-01._temperature.${implementation}`;
    const temperatureStr = await getKVText(temperatureKey);
    const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.8;

    // Create agent with KV-configured system prompt
    const agent = await createFullProcessAgent(implementation);

    // Get model name for response
    const modelName = await getAgentModelName('fp-01', implementation);

    console.log('[fp-01] Implementation:', implementation);
    console.log('[fp-01] Model:', modelName || 'env default');
    console.log('[fp-01] Temperature:', temperature);
    console.log('[fp-01] Previous affirmations count:', previousAffirmations.length);
    console.log('[fp-01] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature,
      },
    });

    // Parse the response into an array
    const affirmations = parseAffirmationsResponse(result.text);

    console.log('[fp-01] Raw response:', result.text);
    console.log('[fp-01] Parsed affirmations:', affirmations);

    return {
      affirmations,
      model: modelName || 'default',
    };
  } catch (error) {
    console.error('[fp-01] Generation failed, using fallback:', error);

    // Return fallback affirmations
    return {
      affirmations: generateFallbackAffirmations(effectivePreferences),
      model: 'fallback',
    };
  }
}
