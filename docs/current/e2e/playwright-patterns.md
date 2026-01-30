# Playwright TypeScript Patterns

Reusable copy-paste patterns for writing Playwright E2E tests in this project. See [troubleshooting.md](troubleshooting.md) for debugging failed tests. See [../e2e-testing.md](../e2e-testing.md) for full setup instructions.

## Browser Launch and Auth Bypass

### Standard Test Setup

```typescript
import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTest(): Promise<void> {
  let browser: Browser | null = null;

  try {
    // Launch browser (headless: true for CI, false for debugging)
    browser = await chromium.launch({ headless: true });
    const context: BrowserContext = await browser.newContext();

    // Set test mode cookie (bypasses password protection middleware)
    await context.addCookies([{
      name: 'e2e_test_mode',
      value: 'true',
      domain: new URL(BASE_URL).hostname,
      path: '/',
    }]);

    const page: Page = await context.newPage();

    // Navigate to feature
    await page.goto(`${BASE_URL}/your-page`);

    // Test steps go here...

  } finally {
    if (browser) await browser.close();
  }
}

runTest();
```

The `e2e_test_mode` cookie bypasses the password protection middleware. The middleware checks:

```typescript
const testMode = request.headers.get('x-e2e-test') || request.cookies.get('e2e_test_mode');
if (testMode) {
  return NextResponse.next();
}
```

### Headless vs Non-Headless

```typescript
// Headless (CI, automated runs)
browser = await chromium.launch({ headless: true });

// Non-headless (debugging, watching tests)
browser = await chromium.launch({ headless: false });
```

Toggle per-file. There is no global config — each test file controls its own headless setting.

## Helper Functions

### clickButton — Click by Visible Text

```typescript
async function clickButton(page: Page, text: string): Promise<boolean> {
  try {
    const button = page.locator('button', { hasText: text });
    await button.waitFor({ state: 'visible', timeout: 5000 });
    await button.click();
    return true;
  } catch (error) {
    console.log(`Could not click button "${text}": ${error}`);
    return false;
  }
}
```

Usage:
```typescript
await clickButton(page, "Confidence");
await clickButton(page, "Skip");
await clickButton(page, "I like it");
```

### waitForText — Wait for Text to Appear

```typescript
async function waitForText(page: Page, text: string, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(`text="${text}"`, { timeout });
    return true;
  } catch (error) {
    console.log(`Text "${text}" not found within ${timeout}ms`);
    return false;
  }
}
```

Usage:
```typescript
await waitForText(page, "Choose your focus");
await waitForText(page, "Generating affirmations...", 60000); // AI generation
```

### sleep — Wait for Async Operations

```typescript
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

Usage:
```typescript
await sleep(2000); // Wait for animation
await sleep(5000); // Wait for API response
```

## Navigation

### Navigate to a Page

```typescript
await page.goto(`${BASE_URL}/full-process-3`);
```

Default navigation timeout: 30 seconds.

### Navigate with Custom Timeout

```typescript
await page.goto(`${BASE_URL}/full-process-3`, { timeout: 60000 });
```

### Wait for Navigation After Action

```typescript
await Promise.all([
  page.waitForNavigation(),
  page.click('button:has-text("Next")'),
]);
```

## Element Interaction

### Click by data-testid (Preferred)

```typescript
await page.locator('[data-testid="feature-element"]').click();
```

### Click by Text Content

```typescript
await page.locator('button', { hasText: 'Save' }).click();
```

### Click by Role

```typescript
await page.getByRole('button', { name: 'Save' }).click();
```

### Type into Input

```typescript
await page.locator('[data-testid="chat-input"]').fill('Hello world');
```

### Press Key

```typescript
await page.keyboard.press('Enter');
```

### Click nth Element (When Multiple Match)

```typescript
// Click the first button with text "Select"
await page.locator('button', { hasText: 'Select' }).first().click();

// Click the third item
await page.locator('.item').nth(2).click();
```

## Wait Patterns

### Wait for Element to be Visible

```typescript
await page.locator('[data-testid="results-panel"]').waitFor({
  state: 'visible',
  timeout: 5000,
});
```

### Wait for Text to Appear (with Timeout)

```typescript
await page.waitForSelector('text="Your affirmations"', { timeout: 10000 });
```

### Wait for AI Generation (Long Timeout)

```typescript
// AI generation can take up to 60 seconds
await page.waitForSelector('text="Here are your affirmations"', { timeout: 60000 });
```

### Wait for Element to Disappear

```typescript
await page.locator('.loading-spinner').waitFor({
  state: 'hidden',
  timeout: 30000,
});
```

### Wait for Network Idle

```typescript
await page.waitForLoadState('networkidle');
```

## Screenshots

### Take a Screenshot

```typescript
await page.screenshot({ path: '01-initial-state.png' });
```

### Take a Full Page Screenshot

```typescript
await page.screenshot({ path: '02-full-page.png', fullPage: true });
```

### Screenshot Naming Convention

Use zero-padded sequential numbering with descriptive names:

```typescript
await page.screenshot({ path: '01-welcome-screen.png' });
await page.screenshot({ path: '02-focus-selected.png' });
await page.screenshot({ path: '03-generation-complete.png' });
```

### Screenshot an Element

```typescript
await page.locator('[data-testid="results-panel"]').screenshot({
  path: '04-results-panel.png',
});
```

## Assertions

### Check Element is Visible

```typescript
const isVisible = await page.locator('[data-testid="save-button"]').isVisible();
console.log(`Save button visible: ${isVisible}`);
```

### Check Text Content

```typescript
const text = await page.locator('.result-count').textContent();
console.log(`Result text: ${text}`);
```

### Assert Element Exists

```typescript
const count = await page.locator('[data-testid="affirmation-card"]').count();
if (count === 0) {
  throw new Error('No affirmation cards found');
}
```

## Debugging

### List All Buttons on Page

```typescript
const buttons = await page.locator('button').allTextContents();
console.log('Available buttons:', buttons);
```

### List All Elements with data-testid

```typescript
const testIds = await page.locator('[data-testid]').evaluateAll(
  elements => elements.map(el => el.getAttribute('data-testid'))
);
console.log('Available test IDs:', testIds);
```

### Get Page Content

```typescript
const content = await page.content();
console.log(content.substring(0, 500)); // First 500 chars
```

### Log Console Messages

```typescript
page.on('console', msg => {
  console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
});
```

## Test ID Conventions

### Naming Pattern

```
<feature>-<component>-<identifier>
```

### Standard Test IDs by Component Type

| Component Type | data-testid Pattern | Example |
|----------------|---------------------|---------|
| Page/Section | `<feature>-page` | `onboarding-page` |
| Input | `<feature>-<name>-input` | `chat-message-input` |
| Button | `<feature>-<action>-button` | `focus-select-button` |
| List | `<feature>-<name>-list` | `affirmation-list` |
| Card | `<feature>-card-<key>` | `affirmation-card-1` |

### Adding Test IDs in React/Next.js

```tsx
<button data-testid="focus-select-button" onClick={handleSelect}>
  Select Focus
</button>

<div data-testid="results-page">
  {results.map((r, i) => (
    <div key={i} data-testid={`result-card-${i}`}>{r.text}</div>
  ))}
</div>
```

## Timeouts Reference

| Operation | Recommended Timeout |
|-----------|-------------------|
| Page navigation | 30s (default) |
| Element visibility | 5s |
| AI generation | 60s |
| Server startup | 15s |
| Animation settle | 1-2s |

## Complete Test Step Template

```typescript
// =============================================================================
// STEP N: [Step Title]
// =============================================================================

console.log('Step N: [Description]...');

// Wait for expected state
await page.waitForSelector('text="Expected Text"', { timeout: 5000 });

// Take screenshot
await page.screenshot({ path: 'NN-descriptive-name.png' });

// Perform action
await clickButton(page, 'Button Text');

// Wait for result
await sleep(1000);

console.log('Step N: PASS');
```

## Running Tests

```bash
# Always use node --import tsx (NOT npx tsx)
node --import tsx e2e/<test-name>.test.ts

# Example
node --import tsx e2e/fo-01.test.ts
```

See [../e2e-testing.md](../e2e-testing.md) for full setup and running instructions.
