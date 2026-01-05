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
 * Get a model string for Mastra v1 agents
 * Note: Mastra v1 uses model strings in format "openrouter/[provider]/[model-name]"
 */
export function getModel(modelName?: string): string {
  // Mastra v1 model format: openrouter/[provider]/[model-name]
  // e.g., "google/gemini-2.5-flash" -> "openrouter/google/gemini-2.5-flash"
  const model = modelName || getModelName();
  return `openrouter/${model}`;
}

/**
 * Get a raw OpenRouter model instance (for use outside Mastra)
 */
export function getOpenRouterModel(modelName?: string) {
  return openRouterProvider(modelName || getModelName());
}
