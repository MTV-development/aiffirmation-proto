# UI Epic Structure with Integrated E2E Testing

**For `/sdd-local:createplan` and anyone structuring UI work.**

When planning UI features, break work into logical "chunks" where each chunk is an **epic** with its own E2E testing. This ensures:

1. Each UI chunk is independently verifiable
2. E2E testing is built into every tick, not bolted on at the end
3. Ticks have clear, testable acceptance criteria

## Principle: UI Chunk = Epic = E2E Scope

A **UI chunk** is a user-visible piece of functionality that:
- Can be demonstrated in an E2E test
- Has a clear "before" and "after" state
- Makes sense as a standalone deliverable

**Examples of good UI chunks:**
- "Add focus selection flow" (multiple screens, but one user journey)
- "Implement chat-based affirmation generation" (one component, but complex interactions)
- "Add review and save flow" (touches multiple files, but one visible outcome)

**Examples of bad chunking:**
- "Implement API for generation" (no UI to test)
- "Refactor prompt types" (invisible change)
- "Add all onboarding features" (too big to test coherently)

## Epic Structure Template

When createplan identifies a UI task, structure it as:

```
Epic: <User-visible outcome>
├── Tick 1: Set up E2E infrastructure (test file, helpers, test IDs)
├── Tick 2: Implement <first UI piece>
│   └── E2E: Verify via screenshot that <expected state>
├── Tick 3: Implement <second UI piece>
│   └── E2E: Verify via screenshot that <expected state>
├── ...
└── Tick N: Full E2E verification pass
```

> **Note:** Unlike Maestro-based projects, Playwright tests can run in parallel since each test gets its own isolated browser instance. No `--blocked-by` chaining is needed for E2E ticks.

## E2E Integration in Every UI Tick

Every UI tick should include E2E verification. The tick description template:

```markdown
## Task

<What to implement>

## Acceptance Criteria

<User-visible criteria - what the E2E test will verify>

## E2E Verification

**Cookbook:** docs/projects/<date>-<feature>/E2E-COOKBOOK.md
**Test file:** e2e/<test-name>.test.ts

After implementing, verify by running:
    node --import tsx e2e/<test-name>.test.ts

**Screenshot to verify:** Screenshot should show <expected state>

**Reference:** docs/current/e2e/tick-quick-reference.md

## If E2E Fails

- If test infrastructure issue: fix test code and re-run
- If app code bug: create blocking bug tick under this epic
- Log all runs in E2E-TESTING-LOG.md
- Update cookbook with learnings
```

## Epic Setup Steps

When an epic starts, the first tick should:

### 1. Create Project E2E Documentation

**Cookbook** - copy from template:
```bash
cp docs/current/e2e/cookbook-template.md docs/projects/<date>-<feature>/E2E-COOKBOOK.md
```

**Testing log** - create:
```bash
# Create docs/projects/<date>-<feature>/E2E-TESTING-LOG.md
```

### 2. Create or Extend TypeScript Test

Create `e2e/<feature>.test.ts`:

```typescript
import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTest(): Promise<void> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context: BrowserContext = await browser.newContext();

    // Set test mode cookie (bypasses password protection)
    await context.addCookies([{
      name: 'e2e_test_mode',
      value: 'true',
      domain: new URL(BASE_URL).hostname,
      path: '/',
    }]);

    const page: Page = await context.newPage();

    // Navigate to feature
    await page.goto(`${BASE_URL}/<feature-path>`);

    // Phase 1: Verify initial state
    await page.screenshot({ path: '01-initial-state.png' });

    // Phase 2+: Interact and verify
    // (Add phases as ticks implement features)

  } finally {
    if (browser) await browser.close();
  }
}

runTest();
```

### 3. Add Test IDs to Components

Every interactive element needs a test ID:

```tsx
<button data-testid="feature-action-button" onClick={handleClick}>
```

See [playwright-patterns.md](playwright-patterns.md) for naming conventions.

## Example: Onboarding Feature

**Spec says:** "Create a multi-step onboarding flow with focus selection, friction, and tone"

**UI chunks identified:**
1. Focus selection (UI - epic #1)
2. Friction selection (UI - epic #2)
3. Tone and generation (UI - epic #3)

**Epic #1: Focus selection flow**

```
Epic: Focus selection flow
├── Tick 1: Create E2E infrastructure
│   - Create cookbook from template
│   - Create test file: e2e/fo-01.test.ts
│   - Add test IDs to FocusSelection component
├── Tick 2: Implement focus selection UI
│   - Acceptance: Screenshot shows focus options rendered
│   - E2E verification included in tick
├── Tick 3: Full E2E pass
│   - All steps pass, screenshots verified
```

## Knowledge Base References

Include these references in epic/tick descriptions:

| Document | When to Reference |
|----------|-------------------|
| `docs/current/e2e/tick-quick-reference.md` | Every UI tick |
| `docs/current/e2e/playwright-patterns.md` | When writing test code |
| `docs/current/e2e/troubleshooting.md` | When tests fail |
| `docs/current/e2e/autonomous-execution.md` | Epic description |
| Project cookbook | Every tick in that epic |

## Anti-Patterns

### Don't: Save E2E for the end

```
❌ Epic: Implement onboarding feature
├── Tick 1: Backend API
├── Tick 2: UI component
├── Tick 3: Integration
├── Tick 4: Write tests (finally!)
└── Tick 5: Fix everything that broke
```

### Do: E2E in every UI tick

```
✓ Epic: Implement onboarding feature
├── Tick 1: Set up E2E infrastructure
├── Tick 2: UI component + E2E verification
├── Tick 3: Integration + E2E verification
└── Tick 4: Full E2E pass
```

### Don't: Vague acceptance criteria

```
❌ "Onboarding flow looks good"
```

### Do: Screenshot-verifiable criteria

```
✓ "Screenshot shows 3 focus option buttons rendered with correct labels"
```

### Don't: Assume selectors work

```
❌ "Click on the save button"
```

### Do: Specify detection method

```
✓ "Click save button via data-testid: `save-button`"
   (Or if testid doesn't work: click via text content "Save")
```

## Tick-Level E2E Knowledge Requirement

Every tick that touches UI should be able to answer:

1. **What test file verifies this?** (e.g., `e2e/fo-01.test.ts`)
2. **What screenshot proves success?** (e.g., "Screenshot shows focus options")
3. **What's the run command?** (e.g., `node --import tsx e2e/fo-01.test.ts`)
4. **Where's the cookbook?** (e.g., `docs/projects/2026-01-17-fo-02/E2E-COOKBOOK.md`)
5. **What do I do if it fails?** (Reference: [tick-quick-reference.md](tick-quick-reference.md))

If a tick description can't answer these, it's not ready to implement.
