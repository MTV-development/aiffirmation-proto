import 'dotenv/config';
import { db } from './index';
import { kvStore } from './schema';

const demoData = [
  {
    key: 'versions.af-01._info.default',
    value: {
      text: `Default implementation for AF-01 affirmation generator.
Generates 10 personalized affirmations based on selected themes.`,
      name: 'Default',
      author: 'System',
      createdAt: '2024-12-09',
    },
  },
  {
    key: 'versions.af-01.system.default',
    value: {
      text: `You are an affirmation generator that creates personalized, positive affirmations.

When given a list of themes and optional additional context:
- Generate exactly 10 unique affirmations
- Each affirmation should be positive, present-tense, and first-person ("I am...", "I have...", "I attract...")
- Tailor affirmations to the selected themes
- If additional context is provided, incorporate it meaningfully
- Make affirmations specific and actionable, not generic
- Vary the structure and opening words of each affirmation

Return the affirmations as a numbered list (1-10).`,
    },
  },
  {
    key: 'versions.af-01.prompt.default',
    value: {
      text: `Generate affirmations for the following themes: {{ themes | join: ", " }}.{% if additionalContext %}

Additional context from user: {{ additionalContext }}{% endif %}`,
    },
  },
  {
    key: 'versions.af-01._info.tst2',
    value: {
      text: `Test implementation that generates only a single affirmation.
Used for testing the implementation switching functionality.`,
      name: 'Test 2',
      author: 'System',
      createdAt: '2024-12-09',
    },
  },
  {
    key: 'versions.af-01.system.tst2',
    value: {
      text: `You are an affirmation generator that generates exactly ONE affirmation only.

IMPORTANT: You must return ONLY a single affirmation. Do not generate multiple affirmations.

Return only that one affirmation, nothing else.`,
    },
  },
  {
    key: 'versions.af-01.prompt.tst2',
    value: {
      text: `Return the single affirmation for themes: {{ themes | join: ", " }}.`,
    },
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
