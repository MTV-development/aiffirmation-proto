import type { SeedEntry } from './types';

export const af01Seeds: SeedEntry[] = [
  {
    key: 'versions.af-01._info.default',
    value: {
      name: 'Default',
      text: `Default implementation for AF-01 affirmation generator.
Generates 10 personalized affirmations based on selected themes.`,
      author: 'System',
      createdAt: '2024-12-09',
    },
  },
  {
    key: 'versions.af-01._info.tst',
    value: {
      name: 'Default',
      text: `Default implementation for AF-01 affirmation generator.
Generates 10 personalized affirmations based on selected themes.`,
      author: 'System',
      createdAt: '2024-12-09',
    },
  },
  {
    key: 'versions.af-01._info.tst2',
    value: {
      name: 'Test 2',
      text: `Test implementation that generates only a single affirmation.
Used for testing the implementation switching functionality.`,
      author: 'System',
      createdAt: '2024-12-09',
    },
  },
  {
    key: 'versions.af-01._model_name.default',
    value: {
      text: 'openai/gpt-4o-mini',
    },
  },
  {
    key: 'versions.af-01._model_name.tst',
    value: {
      text: 'openai/gpt-4o-mini',
    },
  },
  {
    key: 'versions.af-01._model_name.tst2',
    value: {
      text: 'openai/gpt-4o-mini',
    },
  },
  {
    key: 'versions.af-01._temperature.default',
    value: {
      text: '0.95',
    },
  },
  {
    key: 'versions.af-01._temperature.tst',
    value: {
      text: '0.95',
    },
  },
  {
    key: 'versions.af-01._temperature.tst2',
    value: {
      text: '0.95',
    },
  },
  {
    key: 'versions.af-01.numberInstruction.tst2',
    value: {
      text: 'You will return exactly one affirmation.',
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
    key: 'versions.af-01.prompt.tst',
    value: {
      text: `Generate affirmations for the following themes: {{ themes | join: ", " }}.{% if additionalContext %}

Additional context from user: {{ additionalContext }}{% endif %}`,
    },
  },
  {
    key: 'versions.af-01.prompt.tst2',
    value: {
      text: 'Return affirmations for themes: {{ themes | join: ", " }}.',
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
    key: 'versions.af-01.system.tst',
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
    key: 'versions.af-01.system.tst2',
    value: {
      text: `You are an affirmation generator that generates affirmations.
{{ numberInstruction }}`,
    },
  },
];
