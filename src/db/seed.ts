import 'dotenv/config';
import { db } from './index';
import { kvStore } from './schema';

const demoData = [
  {
    key: 'app.settings.theme',
    value: { mode: 'system', accentColor: '#6366f1' },
  },
  {
    key: 'app.settings.notifications',
    value: { email: true, push: false, frequency: 'daily' },
  },
  {
    key: 'app.feature_flags',
    value: { darkMode: true, betaFeatures: false, analytics: true },
  },
  {
    key: 'user.preferences.dashboard',
    value: { layout: 'grid', showStats: true, refreshInterval: 30 },
  },
  {
    key: 'system.maintenance',
    value: { enabled: false, message: null, scheduledAt: null },
  },
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
