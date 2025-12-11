'use client';

import { generate } from './openrouter-client';
import { renderTemplate, getModelName } from './template-engine';
import type { UserPreferences, AdjustedPreferences, GenerateResult } from '@/src/full-process/types';

interface GenerateFullProcessOptions {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;
  /** Optional: adjusted preferences from check-in */
  adjustedPreferences?: AdjustedPreferences;
  /** Implementation to use (default: 'default') */
  implementation?: string;
}

/**
 * Generate fallback affirmations when API fails
 * Uses the user's focus and challenges to create contextual placeholders
 */
export function generateFallbackAffirmations(preferences: UserPreferences): string[] {
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
 * Generate affirmations using the Full Process agent configuration.
 * This is a pure client-side implementation that:
 * 1. Merges preferences with any adjustments
 * 2. Fetches templates from Supabase KV store
 * 3. Renders them with Liquid templating
 * 4. Calls OpenRouter API directly
 * 5. Falls back to contextual placeholders on error
 */
export async function generateFullProcessAffirmations(
  options: GenerateFullProcessOptions
): Promise<GenerateResult> {
  const { preferences, adjustedPreferences, implementation = 'default' } = options;

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
  };

  try {
    // Render system prompt and user prompt using template engine
    const { output: systemPrompt } = await renderTemplate({
      key: 'system',
      version: 'fp-01',
      implementation,
      variables: templateVariables,
    });

    const { output: userPrompt } = await renderTemplate({
      key: 'prompt',
      version: 'fp-01',
      implementation,
      variables: templateVariables,
    });

    // Get model name from KV store
    const modelName = await getModelName('fp-01', implementation);

    console.log('[fp-01] Implementation:', implementation);
    console.log('[fp-01] Model:', modelName || 'env default');
    console.log('[fp-01] System prompt:', systemPrompt.substring(0, 200) + '...');
    console.log('[fp-01] User prompt:', userPrompt);

    // Generate using OpenRouter
    const result = await generate({
      systemPrompt,
      userPrompt,
      model: modelName || undefined,
    });

    // Parse the response into an array
    const affirmations = parseAffirmationsResponse(result.text);

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
