import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { PostgresStore } from '@mastra/pg';

import { weatherAgent } from './agents/weather-agent';
import { af1Agent } from './agents/ag-aff-01';
import { goodTenAgent } from './agents/ag-good-ten';
import { fullProcessAgent } from './agents/full-process';
import { fullProcess2Agent } from './agents/full-process-2';
import { fullProcess3Agent } from './agents/full-process-3';
import { discoveryAgent, generationAgent, profileExtractorAgent } from './agents/chat-survey';
import { chatSurveyWorkflow } from './workflows/chat-survey';

// Singleton pattern to prevent "AI Tracing instance already registered" error during Next.js hot reload
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
  storage: PostgresStore | undefined;
  storageInitialized: boolean | undefined;
};

// Use DATABASE_URL (pooled via PgBouncer) for runtime operations
// DIRECT_URL (session mode) has limited connections and causes "MaxClientsInSessionMode" errors in serverless
// Tables should be created during initial deployment or via migration
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[Mastra] No DATABASE_URL found!');
}

// Create storage instance (reuse if already created)
const storage = globalForMastra.storage ?? new PostgresStore({
  id: 'aiffirmation-storage',
  connectionString: connectionString!,
});
globalForMastra.storage = storage;

export const mastra =
  globalForMastra.mastra ??
  new Mastra({
    agents: { weatherAgent, af1Agent, goodTenAgent, fullProcessAgent, fullProcess2Agent, fullProcess3Agent, discoveryAgent, generationAgent, profileExtractorAgent },
    workflows: { chatSurveyWorkflow },
    storage,
    logger: new PinoLogger({
      name: 'Mastra',
      level: 'info',
    }),
  });

// Cache mastra instance in all environments to prevent multiple instances
globalForMastra.mastra = mastra;

// Note: storage.init() is NOT called here because:
// 1. It performs DDL (CREATE TABLE) which doesn't work well with PgBouncer pooling
// 2. Tables should be created during initial deployment or via migration
// 3. Run `npx mastra dev` locally with DIRECT_URL to create tables if needed
