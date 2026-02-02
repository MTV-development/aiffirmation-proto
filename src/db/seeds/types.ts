/**
 * Type for a single seed entry in the KV store
 */
export interface SeedEntry {
  key: string;
  value: Record<string, unknown>;
}
