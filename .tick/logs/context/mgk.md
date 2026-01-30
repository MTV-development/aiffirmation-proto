# Epic Context: [mgk] FO-09: Registration and Final Validation

## 1. Relevant Code

### Files to Modify

| File | Purpose | Task |
|------|---------|------|
| `nav.config.ts` | Navigation tree (single source of truth) | [tzf] Add FO-09 entry after FO-08 (line ~147) |
| `app/overview/page.tsx` | Overview page with `versions` array and comparison table | [tzf] Add FO-09 VersionCard + table row |
| `app/fo-09/info/page.tsx` | **New file** - Info page for FO-09 | [mr7] Create using FO-08 template |

### Files to Run (not modify)

| File | Purpose | Task |
|------|---------|------|
| `e2e/fo-09.test.ts` | FO-09 E2E test (1073 lines) | [a8r] Run and verify pass |
| `e2e/fo-08.test.ts` | FO-08 E2E regression (907 lines) | [d6b] Run and verify pass |

### Key Reference Files

| File | Why |
|------|-----|
| `app/fo-08/info/page.tsx` | Template for FO-09 info page — uses `InfoPageWrapper`, `InfoSummaryBox`, `BestFor`, `InfoSection`, `TechnicalDetails` |
| `components/info-page-wrapper.tsx` | Shared components: `InfoPageWrapper({id, name, tagline})`, `InfoSummaryBox`, `BestFor`, `InfoSection({title})`, `TechnicalDetails` |
| `app/fo-09/layout.tsx` | Already exists — wraps children in `Fo09LayoutClient` |
| `docs/projects/2026-01-30-fo-09/2026-01-30-fo-09-spec.md` | Full spec with feature details |

## 2. Architecture Notes

### Navigation Registration Pattern
- `nav.config.ts` defines `navTree: NavItem[]` — single source of truth
- Each FO entry has `label`, `href`, and `children` with Demo + Info links
- FO-09 entry already present at lines 148-154 (already added)
- Section layout in `app/fo-09/layout.tsx` already exists

### Overview Page Pattern
- `app/overview/page.tsx` has `versions: VersionCard[]` array (lines 14-173) + comparison `<table>` (lines 230-353)
- FO-08 is the last entry in both — FO-09 goes after it
- `VersionCard` type: `{id, name, href, tagline, description, inputType, outputType, highlight?}`
- Table rows use consistent CSS classes: `py-2 pr-4 font-mono text-purple-400` for ID column

### Info Page Pattern
- Import from `@/components/info-page-wrapper`
- Structure: `InfoPageWrapper` > `InfoSummaryBox` + `BestFor` > custom sections > `InfoSection` > `TechnicalDetails`
- Custom sections use colored bg classes (amber for "Based on", purple for "Core Concept", emerald for "Key Differences", blue for details)
- FO-09 specifics: agent ID `fo-09-discovery`, KV namespace `versions.fo-09.*`, 5 affirmations per batch, card-based Love it/Discard

## 3. Task-Specific Details

### [tzf] nav.config.ts + overview
- **nav.config.ts**: FO-09 entry already exists at lines 148-154. Verify correctness.
- **overview**: Add to `versions` array after FO-08 (after line 173). Add table row after FO-08 row (after line 352).

### [mr7] Info page content from spec
- Two-stage discovery: sentences (screen 1) → fragments (screens 2+)
- Card-based curation: 5 per batch, Love it / Discard, unlimited generate-more
- Flow: Welcome → Discovery → Card Review → Summary → More/Done → Onboarding
- Key diff vs FO-08: sentences on screen 1 (not fragments), 5 cards (not 10 list), unlimited cycles, no reflective statements

### [a8r] E2E test expectations
- Test navigates to `/fo-09`, clicks through welcome→name→familiarity→topics→discovery(sentences then fragments)→card review(5 cards)→summary→mockups→completion
- Verifies: no progress bar, sentence mode screen 1, fragment mode screens 2+, no reflective statements, card flow with Love it/Discard, progress "X/5", summary with two buttons
- Run: `node --import tsx e2e/fo-09.test.ts` (NOT `npx tsx`)
- Requires: dev server on localhost:3000, KV store seeded

### [d6b] Regression test
- Run: `node --import tsx e2e/fo-08.test.ts`
- FO-08 test expects: fragment input on ALL screens, 10 affirmations, thumbs up/down review, "Review Your Affirmations" heading
- Should be unaffected since FO-09 uses its own `app/fo-09/` directory

## 4. Testing Patterns
- Playwright with direct script execution (`node --import tsx`)
- Auth bypass via `e2e_test_mode` cookie
- Headless: `false` by default (visible browser)
- Debug screenshots saved to `e2e/debug-*.png`
- AI generation timeout: 120s
- Dev server must be running (`npm run dev`)

## 5. Conventions
- Route: `/fo-09`, `/fo-09/info`
- Component exports: default function named `FO09InfoPage`
- Use exact same section color coding as FO-08 info page
- VersionCard `id` format: `"FO-09"`, href: `"/fo-09"`