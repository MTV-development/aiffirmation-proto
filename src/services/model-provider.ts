import { createOpenRouter } from '@openrouter/ai-sdk-provider';

/**
 * OpenRouter model provider for AI SDK
 *
 * Uses OpenRouter API to access various LLM models.
 * Configure via environment variables:
 * - OPENROUTER_API_KEY: Your OpenRouter API key
 * - OPENROUTER_MODEL: Model to use (default: google/gemini-2.5-flash)
 */
export const openRouterProvider = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Get the configured model name from environment or default
 */
export function getModelName(): string {
  return process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
}

/**
 * Get a model instance from OpenRouter
 */
export function getModel(modelName?: string) {
  return openRouterProvider(modelName || getModelName());
}
