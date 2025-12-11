# Research: Full Process Affirmation Generator

**Branch**: `001-full-process-generator` | **Date**: 2025-12-11

## Research Summary

This document consolidates research findings to support the implementation plan. Since the Technical Context had no NEEDS CLARIFICATION items (all technologies are established in the codebase), this research focuses on best practices and pattern decisions.

---

## 1. Multi-Step Wizard State Management

### Decision
Use React `useState` with a single state object for the entire wizard, managed at the page level and passed down to step components.

### Rationale
- Consistent with existing patterns in `ag-aff-01/page.tsx`
- Simple mental model: all wizard state lives in one place
- No need for external state management (Redux, Zustand) for this use case
- Easy to reset on "Start Over" action

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| URL-based step state | Overly complex for a single-session flow; no bookmark/share requirement |
| React Context | Unnecessary indirection for a contained feature; useState is simpler |
| Form library (react-hook-form) | No complex validation needs; preset selections are simpler than form fields |

### Implementation Pattern
```typescript
type WizardState = {
  step: 'discovery' | 'review' | 'summary';
  discoveryStep: 1 | 2 | 3 | 4;
  preferences: UserPreferences;
  affirmations: string[];
  likedAffirmations: string[];
  currentIndex: number;
  showCheckIn: boolean;
  isAdjusting: boolean;
  loading: boolean;
};
```

---

## 2. Client-Side Affirmation Generation Architecture

### Decision
Follow the existing `lib/agents/index.ts` pattern: client-side template rendering and direct OpenRouter API calls.

### Rationale
- Consistent with AF-01 and Good Ten implementations
- KV store templates provide configurability without code changes
- OpenRouter API is already configured with credentials
- No need for server-side API route for generation (but will add one for flexibility)

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Server-only generation | Would require server components; existing pattern works well |
| Streaming responses | Not needed for batch generation of 5-8 affirmations |
| Direct Mastra agent calls | Bypasses KV store configuration; less flexible |

### Implementation Pattern
```typescript
// In lib/agents/full-process.ts
export async function generateFullProcessAffirmations(
  preferences: UserPreferences,
  implementation: string = 'default'
): Promise<GenerateResult> {
  const { output: systemPrompt } = await renderTemplate({
    key: 'system',
    version: 'fp-01',
    implementation,
    variables: preferencesToVariables(preferences),
  });
  // ... similar to existing generateAffirmations
}
```

---

## 3. Check-In Trigger Logic

### Decision
Implement check-in triggers as a pure function that evaluates after each "like" action.

### Rationale
- Clear, testable logic: `shouldShowCheckIn(likedCount) => boolean`
- Matches spec exactly: trigger at 5, 10, and every 5 after 10
- Can be unit tested independently of UI

### Implementation Pattern
```typescript
function shouldShowCheckIn(likedCount: number): boolean {
  if (likedCount === 5 || likedCount === 10) return true;
  if (likedCount > 10 && (likedCount - 10) % 5 === 0) return true;
  return false;
}
```

---

## 4. KV Store Key Naming Convention

### Decision
Use `versions.fp-01.{key}.{implementation}` for all Full Process agent configuration.

### Rationale
- Follows established pattern: `versions.af-01.*`, `versions.gt-01.*`
- `fp-01` prefix clearly identifies Full Process version 1
- Supports multiple implementations (default, experimental, etc.)

### Required KV Entries
| Key | Purpose |
|-----|---------|
| `versions.fp-01.system.default` | System prompt for affirmation generation |
| `versions.fp-01.prompt.default` | User prompt template |
| `versions.fp-01.model.default` | Model name (e.g., `openai/gpt-4o-mini`) |

---

## 5. Fallback Affirmation Strategy

### Decision
Generate contextual placeholder affirmations using template strings when API fails.

### Rationale
- Matches existing AF-01 fallback behavior
- Users still get value even if API is down
- Placeholders incorporate user's focus and challenges for relevance

### Implementation Pattern
```typescript
function generateFallbackAffirmations(preferences: UserPreferences): string[] {
  const { focus, challenges } = preferences;
  const templates = [
    `I am worthy of success in ${focus}.`,
    `Every day, I grow stronger in my ${focus} journey.`,
    `${challenges[0] || 'Challenges'} are opportunities for my growth.`,
    // ... 5-8 total
  ];
  return templates;
}
```

---

## 6. Component Architecture

### Decision
Create a flat component structure under `components/full-process/` with clear single responsibilities.

### Rationale
- Matches existing component organization (`components/kv-editor/`)
- Each wizard step is its own component for maintainability
- Parent component (`discovery-wizard.tsx`) orchestrates state and navigation

### Component Responsibility Map
| Component | Responsibility |
|-----------|----------------|
| `discovery-wizard.tsx` | Orchestrates 4 steps, manages navigation |
| `step-*.tsx` | Individual step UI and local interactions |
| `progress-bar.tsx` | Visual progress indicator (reused in review) |
| `affirmation-review.tsx` | Review loop state machine |
| `affirmation-card.tsx` | Single affirmation display with actions |
| `mid-journey-checkin.tsx` | Check-in display with collection preview |
| `adjustment-panel.tsx` | Preference modification form |
| `collection-summary.tsx` | Final list with export actions |

---

## 7. Navigation Integration

### Decision
Add a top-level entry to `navTree` in `nav.config.ts` with "Demo" and "Info" children.

### Rationale
- Follows exact pattern of AF-01 and Good Ten
- Provides consistent user experience across features
- Info page documents feature for users

### Implementation
```typescript
// In nav.config.ts
{
  label: "Full Process",
  href: "/full-process",
  children: [
    { label: "Demo", href: "/full-process" },
    { label: "Info", href: "/full-process/info" },
  ],
},
```

---

## 8. Export Functionality

### Decision
Implement copy-to-clipboard and file download using native browser APIs.

### Rationale
- No external dependencies needed
- `navigator.clipboard.writeText()` is well-supported
- Blob + object URL pattern is standard for file downloads

### Implementation Pattern
```typescript
// Copy to clipboard
const handleCopy = async () => {
  await navigator.clipboard.writeText(affirmations.join('\n\n'));
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// Download as file
const handleDownload = () => {
  const blob = new Blob([affirmations.join('\n\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-affirmations.txt';
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Research Conclusion

All technical decisions are aligned with existing codebase patterns. No external research or clarification was needed. The implementation can proceed directly to Phase 1 design artifacts.
