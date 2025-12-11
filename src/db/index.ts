import { config } from 'dotenv';
config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// DATABASE_URL: pooled connection for serverless (Netlify, Vercel)
// DIRECT_URL: direct connection for migrations and local dev
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL!;

// Debug logging for connection issues (redact password)
const debugUrl = connectionString?.replace(/:([^:@]+)@/, ':***@') || 'NOT SET';
console.log('[db] Connection string source:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'DIRECT_URL');
console.log('[db] Connection URL (redacted):', debugUrl);

// Using direct/session connection; keep prepared statements on
const client = postgres(connectionString, { prepare: true });
export const db = drizzle(client, { schema });
