# Key-Value Store and Template Engine

This document describes how the KV store and template engine work together to provide configurable, versioned prompts for AI agents.

## Overview

The system has two main components:

1. **KV Store** - A database-backed key-value store for storing configuration, prompts, and other text data
2. **Template Engine** - A Liquid-based templating system that renders KV store entries with variable substitution

## KV Store Structure

### Key Format

Keys follow a hierarchical namespace pattern:

```
{namespace}.{version}.{keyName}.{implementation}
```

| Part | Description | Example |
|------|-------------|---------|
| `namespace` | Top-level grouping | `versions` |
| `version` | Agent ID or version identifier | `af-01` |
| `keyName` | Type of content | `system`, `prompt` |
| `implementation` | Variant name | `default`, `tst2` |

**Example keys:**
```
versions.af-01.system.default
versions.af-01.prompt.default
versions.af-01.system.tst2
versions.af-01.prompt.tst2
```

### Value Format

Values are stored as JSON objects. For text content, use the `text` property:

```json
{
  "text": "You are an affirmation generator..."
}
```

Additional properties can be included and will be available to the template engine.

### Namespaces

Currently, all agent-related data lives under the `versions` namespace. This allows for future expansion:

- `versions.*` - Agent prompts and configurations (versioned)
- `config.*` - Application configuration (future)
- `metadata.*` - Descriptive data (future)

## Template Engine

### Location

```
src/services/template-engine.ts
```

### Core Function: `renderTemplate`

```typescript
import { renderTemplate } from '@/src/services';

const { output, variables } = await renderTemplate({
  key: 'prompt',              // KV key name to render
  version: 'af-01',           // Agent/version ID
  implementation: 'default',  // Implementation variant
  variables: {                // Custom variables
    themes: ['Gratitude', 'Self-confidence'],
    additionalContext: 'I am starting a new job'
  }
});
```

### How It Works

1. **Fetches all entries** for the given version/implementation from KV store
2. **Strips key names** - `versions.af-01.prompt.default` becomes `prompt`
3. **Builds variables dictionary** from all KV entries (key name → text value)
4. **Merges with provided variables** (provided variables take precedence)
5. **Renders with Liquid** templating

### Variable Resolution

Given this KV store content:
```
versions.af-01.system.default  → { "text": "You are an affirmation generator..." }
versions.af-01.prompt.default  → { "text": "Generate for: {{ themes | join: \", \" }}" }
```

And this call:
```typescript
renderTemplate({
  key: 'prompt',
  version: 'af-01',
  implementation: 'default',
  variables: { themes: ['Gratitude'] }
})
```

The variables dictionary becomes:
```javascript
{
  system: "You are an affirmation generator...",
  prompt: "Generate for: {{ themes | join: \", \" }}",
  themes: ["Gratitude"]  // from provided variables
}
```

And the output is:
```
Generate for: Gratitude
```

### Helper Function: `getTemplateText`

For fetching raw text without rendering (useful for system prompts):

```typescript
import { getTemplateText } from '@/src/services';

const systemPrompt = await getTemplateText('system', 'af-01', 'default');
// Returns: "You are an affirmation generator..."
```

## Liquid Templating Syntax

The template engine uses [LiquidJS](https://liquidjs.com/) for templating.

### Output

```liquid
{{ variable }}
{{ themes | join: ", " }}
```

### Conditionals

```liquid
{% if additionalContext %}
Additional context: {{ additionalContext }}
{% endif %}
```

### Loops

```liquid
{% for theme in themes %}
- {{ theme }}
{% endfor %}
```

### Filters

```liquid
{{ text | upcase }}
{{ array | join: ", " }}
{{ text | truncate: 100 }}
```

## Usage Example: AF-01 Agent

### Seed Data (`src/db/seed.ts`)

```typescript
const demoData = [
  {
    key: 'versions.af-01.system.default',
    value: {
      text: `You are an affirmation generator...`
    }
  },
  {
    key: 'versions.af-01.prompt.default',
    value: {
      text: `Generate affirmations for: {{ themes | join: ", " }}.{% if additionalContext %}

Additional context: {{ additionalContext }}{% endif %}`
    }
  }
];
```

### API Route (`app/api/ag-aff-01/route.ts`)

```typescript
import { renderTemplate, getTemplateText } from '@/src/services';

// Render the prompt template
const { output: prompt } = await renderTemplate({
  key: 'prompt',
  version: 'af-01',
  implementation: implToUse,
  variables: {
    themes,
    additionalContext: additionalContext?.trim() || null,
  },
});

// Get system prompt for agent
const systemPrompt = await getTemplateText('system', 'af-01', implToUse);
```

## KV Editor UI

The Settings → KV Editor page provides a UI for managing KV store entries:

- Select version (e.g., `af-01`)
- Select implementation (e.g., `default`, `tst2`)
- View and edit entries
- Create new implementations by copying from existing ones

## Database Commands

```bash
npm run db:reset   # Drop tables, recreate schema, and seed
npm run db:seed    # Run seed script only
npm run db:studio  # Open Drizzle Studio for direct DB access
```

## File Locations

| File | Purpose |
|------|---------|
| `src/services/template-engine.ts` | Template rendering logic |
| `src/services/kv-store.ts` | KV store access functions |
| `src/db/seed.ts` | Seed data for KV store |
| `lib/kv/service.ts` | KV editor UI service (Supabase client) |
| `app/settings/store/edit/page.tsx` | KV editor UI page |
