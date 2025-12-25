import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { PostgresStore } from '@mastra/pg';

import { weatherAgent } from './agents/weather-agent';
import { af1Agent } from './agents/ag-aff-01';
import { goodTenAgent } from './agents/ag-good-ten';
import { fullProcessAgent } from './agents/full-process';
import { fullProcess2Agent } from './agents/full-process-2';
import { fullProcess3Agent } from './agents/full-process-3';
import { discoveryAgent, generationAgent } from './agents/chat-survey';
import { chatSurveyWorkflow } from './workflows/chat-survey';

// Singleton pattern to prevent "AI Tracing instance already registered" error during Next.js hot reload
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
  storage: PostgresStore | undefined;
  storageInitialized: boolean | undefined;
};

// Get connection string - prefer DIRECT_URL for DDL operations, fallback to DATABASE_URL
// Log which one we're using for debugging
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[Mastra] No database connection string found! Set DIRECT_URL or DATABASE_URL');
}
console.log('[Mastra] Using connection string from:', process.env.DIRECT_URL ? 'DIRECT_URL' : 'DATABASE_URL');

// Create storage instance (reuse if already created)
const storage = globalForMastra.storage ?? new PostgresStore({
  connectionString: connectionString!,
});
globalForMastra.storage = storage;

export const mastra =
  globalForMastra.mastra ??
  new Mastra({
    agents: { weatherAgent, af1Agent, goodTenAgent, fullProcessAgent, fullProcess2Agent, fullProcess3Agent, discoveryAgent, generationAgent },
    workflows: { chatSurveyWorkflow },
    storage,
    logger: new PinoLogger({
      name: 'Mastra',
      level: 'info',
    }),
    telemetry: {
      enabled: false,
    },
    // Disable observability to prevent SQLite fallback
    observability: {
      default: { enabled: false },
    },
  });

// Cache mastra instance in all environments to prevent multiple instances
globalForMastra.mastra = mastra;

// Initialize storage to ensure tables are created
if (!globalForMastra.storageInitialized) {
  storage.init().then(() => {
    console.log('[Mastra] Storage initialized successfully');
    globalForMastra.storageInitialized = true;
  }).catch((err) => {
    console.error('[Mastra] Failed to initialize storage:', err);
  });
}
