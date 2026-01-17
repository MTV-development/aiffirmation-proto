# E2E Testing

This project uses Playwright for end-to-end testing of the AI agent interfaces.

## Setup

### Install Chromium

```bash
npm run test:e2e:install
```

This downloads the Chromium browser needed for testing.

### Prerequisites

- Node.js 20+
- Dev server running (see below for how to start it)

## Running Tests

### Starting the Dev Server

**Option 1: Manual (two terminals)**
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests
node --import tsx e2e/fo-01.test.ts
```

**Option 2: Autonomous (single terminal, Windows Git Bash)**
```bash
# Start server in background
cmd //c "start /b npm run dev"

# Wait for server to be ready
sleep 15

# Run test
node --import tsx e2e/fo-01.test.ts
```

**Option 3: Autonomous (single terminal, Linux/Mac)**
```bash
# Start server in background
npm run dev &

# Wait for server to be ready
sleep 15

# Run test
node --import tsx e2e/fo-01.test.ts
```

### Checking if Server is Running

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 307 = running (redirect to password page is normal)
# 000 = not running
```

### Running Tests: Headless vs Non-Headless

Tests can run in two modes:

**Non-headless (visible browser window)** — Good for debugging and watching tests run:
```bash
# Edit the test file, set headless: false (this is the default)
browser = await chromium.launch({ headless: false });

# Run the test
node --import tsx e2e/fo-01.test.ts
```

**Headless (no visible browser)** — Good for CI and automated runs:
```bash
# Edit the test file, set headless: true
browser = await chromium.launch({ headless: true });

# Run the test
node --import tsx e2e/fo-01.test.ts
```

### Important: Use `node --import tsx` for Output

Always use `node --import tsx` instead of `npx tsx` when running tests. The `npx tsx` command doesn't properly output to stdout in some environments (especially Git Bash on Windows).

```bash
# Correct - shows test output
node --import tsx e2e/fo-01.test.ts

# May not show output in some environments
npx tsx e2e/fo-01.test.ts
```

## Test Files

| File | Description |
|------|-------------|
| `e2e/fo-01.test.ts` | FO-01 Full Onboarding flow (10 steps, 3 swipe batches) |
| `e2e/full-process-3.test.ts` | Full Process 3 chat-based affirmation flow |

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
4. Tests run in headless mode (`headless: true` in test files)

Example CI workflow:

```yaml
- name: Install test browsers
  run: npm run test:e2e:install

- name: Start dev server
  run: npm run dev &

- name: Wait for server
  run: sleep 15

- name: Run E2E tests
  run: node --import tsx e2e/fo-01.test.ts
```

**Note:** For CI, edit the test file to use `headless: true` in `chromium.launch()`, or create a separate CI test script that overrides the setting.

## Timeouts

| Operation | Default Timeout |
|-----------|-----------------|
| Page navigation | 30s |
| Element visibility | 5s |
| AI generation | 60s |

Adjust these in the test file if needed for slower environments.
