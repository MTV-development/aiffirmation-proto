import { db } from '@/src/db';
import { kvStore } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

export type KVValue = {
  text: string;
  [key: string]: unknown;
};

/**
 * Get a value from the KV store by key
 */
export async function getKVValue(key: string): Promise<KVValue | null> {
  const result = await db
    .select()
    .from(kvStore)
    .where(eq(kvStore.key, key))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0].value as KVValue;
}

/**
 * Get a text value from the KV store by key
 */
export async function getKVText(key: string): Promise<string | null> {
  const value = await getKVValue(key);
  return value?.text ?? null;
}

/**
 * Get a system prompt for an agent from the KV store
 * Convention: versions.{agentId}.system.{implementation}
 */
export async function getAgentSystemPrompt(
  agentId: string,
  implementation: string = 'default'
): Promise<string | null> {
  const key = `versions.${agentId}.system.${implementation}`;
  return getKVText(key);
}

/**
 * Get a user prompt template for an agent from the KV store
 * Convention: versions.{agentId}.prompt.{implementation}
 * Falls back to default implementation if not found
 */
export async function getAgentPromptTemplate(
  agentId: string,
  implementation: string = 'default'
): Promise<string | null> {
  const key = `versions.${agentId}.prompt.${implementation}`;
  const prompt = await getKVText(key);

  // Fall back to default if implementation-specific prompt not found
  if (!prompt && implementation !== 'default') {
    return getKVText(`versions.${agentId}.prompt.default`);
  }

  return prompt;
}

/**
 * Get all available implementations for an agent from the KV store
 * Returns array of implementation names (e.g., ['default', 'v2', 'experimental'])
 */
export async function getAgentImplementations(agentId: string): Promise<string[]> {
  const prefix = `versions.${agentId}.system.`;

  const results = await db
    .select({ key: kvStore.key })
    .from(kvStore)
    .where(sql`${kvStore.key} LIKE ${prefix + '%'}`);

  return results.map(r => r.key.replace(prefix, ''));
}

/**
 * Get the model name for an agent implementation from the KV store
 * Convention: versions.{agentId}._model_name.{implementation}
 * Falls back to default implementation, then to null if not found
 */
export async function getAgentModelName(
  agentId: string,
  implementation: string = 'default'
): Promise<string | null> {
  const key = `versions.${agentId}._model_name.${implementation}`;
  const modelName = await getKVText(key);

  // Fall back to default if implementation-specific model not found
  if (!modelName && implementation !== 'default') {
    return getKVText(`versions.${agentId}._model_name.default`);
  }

  return modelName;
}
