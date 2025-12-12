import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

import { weatherAgent } from './agents/weather-agent';
import { af1Agent } from './agents/ag-aff-01';
import { goodTenAgent } from './agents/ag-good-ten';
import { fullProcessAgent } from './agents/full-process';
import { fullProcess2Agent } from './agents/full-process-2';

// Singleton pattern to prevent "AI Tracing instance already registered" error during Next.js hot reload
const globalForMastra = globalThis as unknown as {
  mastra: Mastra | undefined;
};

export const mastra =
  globalForMastra.mastra ??
  new Mastra({
    agents: { weatherAgent, af1Agent, goodTenAgent, fullProcessAgent, fullProcess2Agent },
    storage: new LibSQLStore({
      url: ':memory:',
    }),
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

if (process.env.NODE_ENV !== 'production') {
  globalForMastra.mastra = mastra;
}
