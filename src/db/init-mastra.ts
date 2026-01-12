import { config } from 'dotenv';
config({ path: '.env.local' });

import { PostgresStore } from '@mastra/pg';

// Use DIRECT_URL for DDL operations (table creation)
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No connection string found!');
  process.exit(1);
}

console.log('Initializing Mastra storage tables...');
console.log('Using connection:', connectionString.replace(/:[^:@]*@/, ':***@'));

const storage = new PostgresStore({
  id: 'aiffirmation-storage',
  connectionString,
});

storage.init().then(() => {
  console.log('Mastra storage initialized!');
  process.exit(0);
}).catch((err: Error) => {
  console.error('Failed to initialize Mastra storage:', err);
  process.exit(1);
});
