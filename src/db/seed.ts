import 'dotenv/config';
import { db } from './index';
import { kvStore } from './schema';

const demoData = [
  // Version 1 - Default implementation
  { key: 'v1.prompt1.default', value: { text: 'this is the default prompt' } },
];

async function seed() {
  console.log('Seeding database...');

  for (const entry of demoData) {
    await db
      .insert(kvStore)
      .values(entry)
      .onConflictDoUpdate({
        target: kvStore.key,
        set: { value: entry.value, updatedAt: new Date() },
      });
    console.log(`  Inserted/Updated: ${entry.key}`);
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
