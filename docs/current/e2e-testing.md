# E2E Testing

This project uses Playwright for end-to-end testing of the AI agent interfaces.

## Setup

### Install Chromium

```bash
npm run test:e2e:install
```

This downloads the Chromium browser needed for headless testing.

### Prerequisites

- Node.js 20+
- Dev server running (`npm run dev`)

## Running Tests

```bash
# Start the dev server first (in one terminal)
npm run dev

# Run tests (in another terminal)
npm run test:e2e
```

## Test Files

| File | Description |
|------|-------------|
| `e2e/full-process-3.test.ts` | Tests the Full Process 3 chat-based affirmation flow |

## How It Works

### Password Protection Bypass

The site has password protection via middleware. For E2E tests, we bypass this by setting a special cookie:

```typescript
await context.addCookies([{
  name: 'e2e_test_mode',
  value: 'true',
  domain: 'localhost',
  path: '/',
}]);
```

The middleware (`middleware.ts`) checks for this cookie and skips auth:

```typescript
const testMode = request.headers.get('x-e2e-test') || request.cookies.get('e2e_test_mode');
if (testMode) {
  return NextResponse.next();
}
```

### Test Flow (Full Process 3)

The test simulates a user going through the affirmation generation flow:

1. **Navigate** to `/full-process-3`
2. **Focus selection** - Click "Confidence" quick reply
3. **Friction** - Click "Skip" to skip friction selection
4. **Tone** - Click "Gentle" for voice preference
5. **Inspiration** - Click "Done" to skip example selection
6. **Generate** - Click "Nope" (no avoids) to start AI generation
7. **Review** - Wait for affirmations, click "I like it" to save one
8. **Verify** - Confirm the flow continues correctly

## Writing New Tests

### Basic Structure

```typescript
import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTest(): Promise<void> {
  let browser: Browser | null = null;

  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context: BrowserContext = await browser.newContext();

    // Set test mode cookie
    await context.addCookies([{
      name: 'e2e_test_mode',
      value: 'true',
      domain: new URL(BASE_URL).hostname,
      path: '/',
    }]);

    const page: Page = await context.newPage();

    // Navigate and interact
    await page.goto(`${BASE_URL}/your-page`);

    // Your test assertions...

  } finally {
    if (browser) await browser.close();
  }
}

runTest();
```

### Helper Functions

The test includes reusable helpers:

```typescript
// Click a button by visible text
async function clickButton(page: Page, text: string): Promise<boolean>

// Wait for text to appear on page
async function waitForText(page: Page, text: string, timeout?: number): Promise<boolean>

// Sleep for a duration
async function sleep(ms: number): Promise<void>
```

### Debugging Tips

1. **Run with visible browser** - Set `headless: false` in `chromium.launch()`
2. **Take screenshots** - Use `await page.screenshot({ path: 'debug.png' })`
3. **List available buttons** - `await page.locator('button').allTextContents()`
4. **Increase timeouts** - For slow AI operations, increase wait timeouts

## CI Integration

For CI environments, ensure:

1. Chromium is installed (`npm run test:e2e:install`)
2. Dev server is started before tests
3. `TEST_URL` env var is set if not using localhost:3000

Example CI workflow:

```yaml
- name: Install test browsers
  run: npm run test:e2e:install

- name: Start dev server
  run: npm run dev &

- name: Wait for server
  run: sleep 15

- name: Run E2E tests
  run: npm run test:e2e
```

## Timeouts

| Operation | Default Timeout |
|-----------|-----------------|
| Page navigation | 30s |
| Element visibility | 5s |
| AI generation | 60s |

Adjust these in the test file if needed for slower environments.
