import { config } from 'dotenv';
config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This client is ONLY for migrations and seeding
// It should never be used in browser code
const connectionString = process.env.DIRECT_URL!;

// Using direct/session connection; keep prepared statements on
const client = postgres(connectionString, { prepare: true });
export const db = drizzle(client, { schema });
