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
  storageInitialized: boolean | undefined;
};

// Create storage instance
// Use DIRECT_URL (not pooled) for Mastra storage - PgBouncer can interfere with DDL operations
const storage = new PostgresStore({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
});

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
    observability: {
      default: { enabled: true },
    },
  });

// Initialize storage to ensure tables are created
if (!globalForMastra.storageInitialized) {
  storage.init().then(() => {
    console.log('[Mastra] Storage initialized');
    globalForMastra.storageInitialized = true;
  }).catch((err) => {
    console.error('[Mastra] Failed to initialize storage:', err);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForMastra.mastra = mastra;
}
