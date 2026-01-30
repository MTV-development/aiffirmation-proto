# E2E Quick Reference for Ticks

**Read this if your tick involves E2E testing.** This is the minimal knowledge you need to run E2E tests successfully.

## Before You Start

1. **Read your project's cookbook first**: `docs/projects/<date>-<feature>/E2E-COOKBOOK.md`
2. **Log everything**: `docs/projects/<date>-<feature>/E2E-TESTING-LOG.md`
3. **Reference patterns**: [playwright-patterns.md](playwright-patterns.md)

## Running an E2E Test

### Option A: Full Run (Cold Start)

```bash
# Start the dev server in background (Windows Git Bash)
cmd //c "start /b npm run dev"

# Wait for server to be ready
sleep 15

# Run the test
node --import tsx e2e/<test-name>.test.ts
```

**Timeout:** 120000ms (2 minutes) is typical.

### Option B: Just Run Test (Server Already Running)

```bash
node --import tsx e2e/<test-name>.test.ts
```

Use this when the dev server is already running from a previous run.

### Check if Server is Running

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 307 = running (redirect to password page is normal)
# 000 = not running
```

> **Note:** Always use `node --import tsx` instead of `npx tsx`. The latter doesn't reliably output to stdout in some environments.

## Checking Results

### Exit Code

- **0** = All steps passed
- **Non-zero** = Check output for which step failed

### Find Screenshots

Screenshots are saved to the path specified in `page.screenshot({ path })`. Check:
- Project root for files like `01-initial-state.png`
- The `e2e/` directory for debug screenshots

Then use the **Read tool** to view screenshot images (Claude is multimodal).

### Check Console Output

The test file logs step progress to stdout. Look for:
- Step pass/fail messages
- Error details and stack traces
- Timeout warnings

## If Test Passes

1. Verify screenshots show expected UI state
2. Log the run in `E2E-TESTING-LOG.md`
3. Update cookbook if you learned anything new
4. Close the tick with evidence summary

## If Test Fails

### Step 1: Diagnose

- Check the console output for the failure step
- Is it a **test infrastructure issue** (wrong selector, timing, Playwright quirk)?
- Or an **app code bug** (feature doesn't work)?

### Step 2: Act

**Test infrastructure issue:**
1. Fix the test TypeScript code
2. Re-run the test
3. Log the fix in cookbook

**App code bug:**
1. Create a blocking bug tick:
   ```bash
   tk create "Fix <root cause>" -t bug --parent <epic-id>
   tk block <this-tick-id> <bug-id>
   tk note <epic-id> "Bug found: <bug-id> - <description>. Blocks <this-tick-id>."
   ```
2. Add evidence from screenshots/console to bug description
3. Leave this tick open (blocked by the bug)

## Essential Playwright Patterns

### Launch Browser with Auth Bypass

```typescript
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.addCookies([{
  name: 'e2e_test_mode',
  value: 'true',
  domain: 'localhost',
  path: '/',
}]);
const page = await context.newPage();
```

### Navigate to Page

```typescript
await page.goto(`${BASE_URL}/your-page`);
```

**Navigation timeout:** 30s default.

### Click Button by Text

```typescript
await clickButton(page, "Button Text");
```

Or manually:
```typescript
await page.locator('button', { hasText: 'Button Text' }).click();
```

### Wait for Text to Appear

```typescript
await waitForText(page, "Expected text", 5000);
```

Or manually:
```typescript
await page.waitForSelector(`text="${expectedText}"`, { timeout: 5000 });
```

### Take Screenshot

```typescript
await page.screenshot({ path: '01-description.png' });
```

### Sleep (Wait for Async Operations)

```typescript
await sleep(2000); // Wait 2 seconds
```

Or inline:
```typescript
await new Promise(resolve => setTimeout(resolve, 2000));
```

## Test ID Conventions

Pattern: `<feature>-<component>-<identifier>`

| Type | Pattern | Example |
|------|---------|---------|
| Page | `<feature>-page` | `onboarding-page` |
| Button | `<feature>-<action>-button` | `focus-select-button` |
| Input | `<feature>-<name>-input` | `chat-message-input` |

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| `npx tsx` doesn't show output | Use `node --import tsx` instead |
| Cookie not set before navigation | Set cookies on context BEFORE creating page or navigating |
| Element not found | Use `page.locator('button').allTextContents()` to list available buttons |
| AI generation timeout | Increase wait timeout to 60s for AI operations |
| Server not running | Check with `curl`, start with `npm run dev` |

## Tick Completion Checklist

Before closing any tick that ran E2E tests:

- [ ] Logged the run in `E2E-TESTING-LOG.md`
- [ ] Updated cookbook with any new learnings
- [ ] Added epic note: `tk note <epic-id> "<tick-id> complete: <key finding>"`
- [ ] Included screenshot evidence in close message

## More Details

- Full patterns: [playwright-patterns.md](playwright-patterns.md)
- Troubleshooting: [troubleshooting.md](troubleshooting.md)
- Autonomous execution guide: [autonomous-execution.md](autonomous-execution.md)
- Parent setup guide: [../e2e-testing.md](../e2e-testing.md)
