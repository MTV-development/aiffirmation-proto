# Affirmation Generator (AF-1) Implementation Plan

**Date**: 2025-12-08
**Feature**: Affirmation theme selector and AI-generated affirmations

## Overview

Create a new page in the UI where users can select affirmation themes and receive personalized AI-generated affirmations from a new Mastra agent called AF-1.

## User Flow

1. User navigates to the Affirmations page
2. User sees headline: **"What do you want your affirmations to be about?"**
3. User toggles theme checkboxes on/off (e.g., self-confidence, anxiety, work ethic)
4. User optionally types additional context in a text field
5. User clicks **"Go"** button
6. System sends selected themes + custom text to AF-1 agent
7. Agent returns 10 personalized affirmations
8. UI displays the affirmations to the user

## UI Design

```
┌─────────────────────────────────────────────────────────┐
│  What do you want your affirmations to be about?        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ☑ Self-confidence        ☐ Relationships               │
│  ☐ Anxiety relief         ☑ Work ethic                  │
│  ☐ Gratitude              ☐ Health & wellness           │
│  ☐ Motivation             ☐ Creativity                  │
│  ☐ Self-love              ☐ Financial abundance         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Add more details (optional)...                   │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                                        [ Go ]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Predefined Themes

Initial set of affirmation themes:

| Theme | Description |
|-------|-------------|
| Self-confidence | Believing in yourself and your abilities |
| Anxiety relief | Calming thoughts and stress reduction |
| Gratitude | Appreciation for life and what you have |
| Motivation | Drive to achieve goals and take action |
| Self-love | Acceptance and care for yourself |
| Relationships | Connection with others and social bonds |
| Work ethic | Professional growth and productivity |
| Health & wellness | Physical and mental well-being |
| Creativity | Artistic expression and innovation |
| Financial abundance | Prosperity and wealth mindset |

## Technical Implementation

### 1. File Structure

```
src/
├── mastra/
│   ├── agents/
│   │   ├── weather-agent.ts
│   │   └── af1-agent.ts          # NEW: Affirmation agent
│   └── index.ts                   # Register AF-1 agent
├── affirmations/
│   ├── themes.ts                  # Theme definitions
│   └── index.ts                   # Exports
app/
├── affirmations/
│   ├── layout.tsx                 # Page layout
│   └── page.tsx                   # Theme selector UI
├── api/
│   └── affirmations/
│       └── route.ts               # API endpoint for AF-1
```

### 2. AF-1 Agent Definition

**File**: `src/mastra/agents/af1-agent.ts`

```typescript
import { Agent } from '@mastra/core/agent';

export const af1Agent = new Agent({
  name: 'AF-1',
  instructions: `
    You are an affirmation generator that creates personalized, positive affirmations.

    When given a list of themes and optional additional context:
    - Generate exactly 10 unique affirmations
    - Each affirmation should be positive, present-tense, and first-person ("I am...", "I have...", "I attract...")
    - Tailor affirmations to the selected themes
    - If additional context is provided, incorporate it meaningfully
    - Make affirmations specific and actionable, not generic
    - Vary the structure and opening words of each affirmation

    Return the affirmations as a numbered list (1-10).
  `,
  model: 'openai/gpt-4o-mini',
});
```

### 3. Register Agent in Mastra

**File**: `src/mastra/index.ts`

```typescript
import { af1Agent } from './agents/af1-agent';

export const mastra = new Mastra({
  agents: { weatherAgent, af1Agent },
  // ... rest of config
});
```

### 4. Theme Definitions

**File**: `src/affirmations/themes.ts`

```typescript
export type AffirmationTheme = {
  id: string;
  label: string;
  description: string;
};

export const affirmationThemes: AffirmationTheme[] = [
  { id: 'self-confidence', label: 'Self-confidence', description: 'Believing in yourself and your abilities' },
  { id: 'anxiety-relief', label: 'Anxiety relief', description: 'Calming thoughts and stress reduction' },
  { id: 'gratitude', label: 'Gratitude', description: 'Appreciation for life and what you have' },
  { id: 'motivation', label: 'Motivation', description: 'Drive to achieve goals and take action' },
  { id: 'self-love', label: 'Self-love', description: 'Acceptance and care for yourself' },
  { id: 'relationships', label: 'Relationships', description: 'Connection with others and social bonds' },
  { id: 'work-ethic', label: 'Work ethic', description: 'Professional growth and productivity' },
  { id: 'health-wellness', label: 'Health & wellness', description: 'Physical and mental well-being' },
  { id: 'creativity', label: 'Creativity', description: 'Artistic expression and innovation' },
  { id: 'financial-abundance', label: 'Financial abundance', description: 'Prosperity and wealth mindset' },
];
```

### 5. API Route

**File**: `app/api/affirmations/route.ts`

```typescript
import { mastra } from '@/src/mastra';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { themes, additionalContext } = await req.json();

  if (!themes || themes.length === 0) {
    return Response.json({ error: 'At least one theme is required' }, { status: 400 });
  }

  const prompt = buildPrompt(themes, additionalContext);

  const agent = mastra.getAgent('af1Agent');
  const result = await agent.generate(prompt);

  return Response.json({ affirmations: result.text });
}

function buildPrompt(themes: string[], additionalContext?: string): string {
  let prompt = `Generate 10 affirmations for the following themes: ${themes.join(', ')}.`;

  if (additionalContext?.trim()) {
    prompt += `\n\nAdditional context from user: ${additionalContext}`;
  }

  return prompt;
}
```

### 6. UI Page

**File**: `app/affirmations/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { affirmationThemes } from '@/src/affirmations/themes';

export default function AffirmationsPage() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [affirmations, setAffirmations] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = (themeId: string) => {
    setSelectedThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleSubmit = async () => {
    if (selectedThemes.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/affirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themes: selectedThemes, additionalContext }),
      });
      const data = await res.json();
      setAffirmations(data.affirmations);
    } catch (error) {
      console.error('Failed to generate affirmations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        What do you want your affirmations to be about?
      </h1>

      {/* Theme checkboxes */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {affirmationThemes.map(theme => (
          <label key={theme.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedThemes.includes(theme.id)}
              onChange={() => toggleTheme(theme.id)}
              className="w-4 h-4"
            />
            <span>{theme.label}</span>
          </label>
        ))}
      </div>

      {/* Additional context textarea */}
      <textarea
        value={additionalContext}
        onChange={(e) => setAdditionalContext(e.target.value)}
        placeholder="Add more details (optional)..."
        className="w-full p-3 border rounded-lg mb-4 min-h-[100px]"
      />

      {/* Go button */}
      <button
        onClick={handleSubmit}
        disabled={selectedThemes.length === 0 || isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Go'}
      </button>

      {/* Results */}
      {affirmations && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Your Affirmations</h2>
          <div className="whitespace-pre-wrap">{affirmations}</div>
        </div>
      )}
    </div>
  );
}
```

### 7. Navigation Entry

**File**: `nav.config.ts`

```typescript
export const navTree: NavItem[] = [
  // ... existing items
  {
    label: "Affirmations",
    href: "/affirmations",
  },
];
```

## Implementation Steps

1. **Create AF-1 agent** (`src/mastra/agents/af1-agent.ts`)
2. **Register agent** in `src/mastra/index.ts`
3. **Create theme definitions** (`src/affirmations/themes.ts`)
4. **Create API route** (`app/api/affirmations/route.ts`)
5. **Create UI page** (`app/affirmations/page.tsx` and `layout.tsx`)
6. **Add to navigation** (`nav.config.ts`)
7. **Test in browser** and **Mastra Studio**

## Future Enhancements

- Save favorite affirmations to database
- Daily affirmation notifications
- Share affirmations feature
- Voice playback of affirmations
- Affirmation history/journal
- Custom theme creation
- Different affirmation styles (poetic, direct, spiritual, etc.)

## Testing

### Manual Testing
1. Navigate to /affirmations
2. Select 2-3 themes
3. Optionally add custom context
4. Click "Go"
5. Verify 10 relevant affirmations are displayed

### Mastra Studio Testing
1. Run `npx mastra dev`
2. Open http://localhost:4111
3. Select AF-1 agent
4. Test with prompt: "Generate 10 affirmations for: self-confidence, motivation"
5. Verify response quality and format
