'use client';

/**
 * Client-side OpenRouter API wrapper
 * Uses NEXT_PUBLIC_ env vars for browser access
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_OPENROUTER_API_KEY is not configured');
  }
  return key;
}

export function getDefaultModel(): string {
  return process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'google/gemini-2.5-flash';
}

type GenerateOptions = {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
};

type GenerateResult = {
  text: string;
};

/**
 * Generate a completion using OpenRouter API directly from the client
 */
export async function generate(options: GenerateOptions): Promise<GenerateResult> {
  const { systemPrompt, userPrompt, model } = options;
  const modelToUse = model || getDefaultModel();

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Aiffirmation',
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `OpenRouter API error: ${response.status}`
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  return { text };
}
