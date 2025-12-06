import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL!;
const sql = postgres(connectionString);

async function reset() {
  console.log('Resetting database...');

  // Drop all tables in the public schema
  await sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `;

  console.log('All tables dropped.');
  await sql.end();
  process.exit(0);
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
