'use server';

import { createFullProcess2Agent } from '@/src/mastra/agents/full-process-2';
import { renderTemplate, getAgentModelName, getKVText } from '@/src/services';
import type { UserPreferences, AdjustedPreferences, GenerateResult } from '@/src/full-process/types';

interface GenerateFullProcess2Options {
  /** User preferences from discovery wizard */
  preferences: UserPreferences;
  /** Optional: adjusted preferences from check-in */
  adjustedPreferences?: AdjustedPreferences;
  /** Implementation to use (default: 'default') */
  implementation?: string;
  /** Previously shown affirmations to avoid repeating */
  previousAffirmations?: string[];
  /**
   * Affirmations the user has approved (liked) this session.
   * Limited to 20 most recent to prevent prompt overflow.
   */
  approvedAffirmations?: string[];
  /**
   * Affirmations the user has skipped this session.
   * Limited to 20 most recent to prevent prompt overflow.
   */
  skippedAffirmations?: string[];
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
 * Limit feedback lists to prevent prompt overflow
 * Returns the most recent N items from the list
 */
function limitFeedbackList(list: string[] | undefined, maxItems: number = 20): string[] {
  if (!list || list.length === 0) return [];
  return list.slice(-maxItems);
}

/**
 * Server action to generate affirmations using FP-02 Mastra agent.
 * FP-02 is a feedback-aware agent that learns from user approval patterns
 * to generate better-aligned affirmations over multiple batches.
 */
export async function generateFullProcess2Affirmations(
  options: GenerateFullProcess2Options
): Promise<GenerateResult> {
  const {
    preferences,
    adjustedPreferences,
    implementation = 'default',
    previousAffirmations = [],
    approvedAffirmations = [],
    skippedAffirmations = [],
  } = options;

  // Merge preferences with adjustments
  const effectivePreferences: UserPreferences = {
    ...preferences,
    challenges: adjustedPreferences?.challenges ?? preferences.challenges,
    tone: adjustedPreferences?.tone ?? preferences.tone,
  };

  // Limit feedback lists to prevent prompt overflow (max 20 each)
  const limitedApproved = limitFeedbackList(approvedAffirmations, 20);
  const limitedSkipped = limitFeedbackList(skippedAffirmations, 20);

  // Build template variables with feedback data
  const templateVariables = {
    focus: effectivePreferences.focus,
    challenges: effectivePreferences.challenges.join(', ') || 'general life challenges',
    tone: effectivePreferences.tone,
    feedback: adjustedPreferences?.feedback || '',
    previousAffirmations,
    approvedAffirmations: limitedApproved,
    skippedAffirmations: limitedSkipped,
  };

  try {
    // Render user prompt from KV store (fp-02 version)
    const { output: userPrompt } = await renderTemplate({
      key: 'prompt',
      version: 'fp-02',
      implementation,
      variables: templateVariables,
    });

    // Get temperature from KV store (with fallback)
    const temperatureKey = `versions.fp-02._temperature.${implementation}`;
    const temperatureStr = await getKVText(temperatureKey);
    const temperature = temperatureStr ? parseFloat(temperatureStr) : 0.95;

    // Create FP-02 agent with KV-configured system prompt
    const agent = await createFullProcess2Agent(implementation);

    // Get model name for response
    const modelName = await getAgentModelName('fp-02', implementation);

    console.log('[fp-02] Implementation:', implementation);
    console.log('[fp-02] Model:', modelName || 'env default');
    console.log('[fp-02] Temperature:', temperature);
    console.log('[fp-02] Previous affirmations count:', previousAffirmations.length);
    console.log('[fp-02] Approved affirmations count:', limitedApproved.length);
    console.log('[fp-02] Skipped affirmations count:', limitedSkipped.length);
    console.log('[fp-02] User prompt:', userPrompt);

    // Generate with Mastra agent
    const result = await agent.generate(userPrompt, {
      modelSettings: {
        temperature,
      },
    });

    // Parse the response into an array
    const affirmations = parseAffirmationsResponse(result.text);

    console.log('[fp-02] Raw response:', result.text);
    console.log('[fp-02] Parsed affirmations:', affirmations);

    return {
      affirmations,
      model: modelName || 'default',
    };
  } catch (error) {
    console.error('[fp-02] Generation failed, using fallback:', error);

    // Return fallback affirmations
    return {
      affirmations: generateFallbackAffirmations(effectivePreferences),
      model: 'fallback',
    };
  }
}
