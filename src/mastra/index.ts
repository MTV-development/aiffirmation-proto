import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { PostgresStore } from '@mastra/pg';

import { weatherAgent } from './agents/weather-agent';
import { af1Agent } from './agents/ag-aff-01';
import { goodTenAgent } from './agents/ag-good-ten';
import { fullProcessAgent } from './agents/full-process';
import { fullProcess2Agent } from './agents/full-process-2';
import { fullProcess3Agent } from './agents/full-process-3';
import { fo01Agent } from './agents/fo-01';
import { discoveryAgent, generationAgent, profileExtractorAgent } from './agents/chat-survey';
import { chatSurveyWorkflow } from './workflows/chat-survey';

// Singleton pattern to prevent "AI Tracing instance already registered" error during Next.js hot reload
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
  storage: PostgresStore | undefined;
  storageInitialized: boolean | undefined;
};

// Use DIRECT_URL for Mastra storage because:
// 1. Mastra calls storage.init() internally which performs DDL (CREATE TABLE)
// 2. DDL operations fail through PgBouncer (DATABASE_URL on port 6543)
// 3. DIRECT_URL (port 5432) supports DDL but has connection limits
// For production, ensure tables are pre-created and consider connection pooling strategies
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
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
    agents: { weatherAgent, af1Agent, goodTenAgent, fullProcessAgent, fullProcess2Agent, fullProcess3Agent, fo01Agent, discoveryAgent, generationAgent, profileExtractorAgent },
    workflows: { chatSurveyWorkflow },
    storage,
    logger: new PinoLogger({
      name: 'Mastra',
      level: 'info',
    }),
  });

// Cache mastra instance in all environments to prevent multiple instances
globalForMastra.mastra = mastra;

// Note: Mastra internally calls storage.init() when workflows start
// We use DIRECT_URL to ensure DDL operations work correctly
// For production with connection limits, pre-create tables via `npm run db:reset`
