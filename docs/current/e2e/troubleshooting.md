# E2E Troubleshooting Guide

Consolidated FAQ and debugging guide from real E2E testing experience. See [playwright-patterns.md](playwright-patterns.md) for TypeScript syntax help. See [../e2e-testing.md](../e2e-testing.md) for full setup instructions.

## Environment Issues

| Problem | Solution |
|---------|----------|
| Connection refused on localhost:3000 | Dev server not running. Start with `npm run dev`. Wait 15 seconds for startup. |
| Server returns 000 status | Not running. Start with `npm run dev`. |
| Server returns 307 | Normal — redirect to password page. The e2e_test_mode cookie bypasses this. |
| Chromium not found | Run `npm run test:e2e:install` to download Chromium. |
| Node.js version error | Requires Node.js 20+. Check with `node --version`. |
| Test output not visible | Use `node --import tsx` instead of `npx tsx`. The latter doesn't reliably output to stdout in Git Bash. |

## Auth / Cookie Issues

| Problem | Solution |
|---------|----------|
| Test redirects to password page | e2e_test_mode cookie not set. Set cookie on context BEFORE creating page. |
| Cookie set but still redirected | Check cookie domain matches. Use `new URL(BASE_URL).hostname` for the domain value. |
| Cookie not persisting between pages | Set cookie on the browser context, not the page. |

### Cookie Setup Pattern (Correct)

```typescript
// CORRECT: Set cookie on context BEFORE creating page
const context = await browser.newContext();
await context.addCookies([{
  name: 'e2e_test_mode',
  value: 'true',
  domain: new URL(BASE_URL).hostname,
  path: '/',
}]);
const page = await context.newPage();
await page.goto(`${BASE_URL}/your-page`);
```

### Cookie Setup Pattern (Wrong)

```typescript
// WRONG: Setting cookie after navigation — too late, middleware already redirected
const page = await context.newPage();
await page.goto(`${BASE_URL}/your-page`); // Already redirected!
await context.addCookies([...]); // Too late
```

## Playwright Issues

| Problem | Solution |
|---------|----------|
| Element not found | Check selector. Use `page.locator('button').allTextContents()` to list available buttons. |
| Timeout waiting for element | Element may not exist or selector is wrong. Take a screenshot to see current state. |
| Click doesn't register | Element may be obscured by overlay. Try `{ force: true }` or wait for overlay to dismiss. |
| Text selector doesn't match | Check for extra whitespace, line breaks, or dynamic content. Use `hasText` for partial matches. |
| `waitForSelector` returns but element is not interactable | Use `waitFor({ state: 'visible' })` instead, then add a short sleep. |
| Browser crash on CI | Ensure `headless: true` is set. Headless mode uses less memory. |

## Selector Issues

### Finding the Right Selector

When a selector doesn't work, use these debugging techniques:

**List all buttons:**
```typescript
const buttons = await page.locator('button').allTextContents();
console.log('Buttons:', buttons);
```

**List all test IDs:**
```typescript
const testIds = await page.locator('[data-testid]').evaluateAll(
  elements => elements.map(el => el.getAttribute('data-testid'))
);
console.log('Test IDs:', testIds);
```

**Take debug screenshot:**
```typescript
await page.screenshot({ path: 'debug-current-state.png' });
```

**Get page HTML:**
```typescript
const html = await page.content();
console.log(html.substring(0, 1000));
```

### Selector Priority

Prefer selectors in this order:

1. **data-testid** — Most stable, won't change with UI updates
2. **Role** — `getByRole('button', { name: 'Save' })` — semantic and stable
3. **Text content** — `locator('button', { hasText: 'Save' })` — may change with copy updates
4. **CSS class** — Least stable, changes with styling updates

## Timing Issues

| Problem | Solution |
|---------|----------|
| AI generation times out | Increase timeout to 60s: `await waitForText(page, "result", 60000)` |
| Page not loaded when assertion runs | Add `await page.waitForLoadState('networkidle')` before assertions |
| Animation interferes with click | Add `await sleep(1000)` after navigation before clicking |
| Element found but not clickable | Wait for `{ state: 'visible' }` and add short sleep |

### Timeout Reference

| Operation | Recommended Timeout |
|-----------|-------------------|
| Page navigation | 30s (default) |
| Element visibility | 5s |
| AI generation | 60s |
| Server startup | 15s |
| Animation settle | 1-2s |

## Server Issues

| Problem | Solution |
|---------|----------|
| Server won't start | Check for port conflict: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows) |
| Server starts but tests fail | Wait longer for startup. Check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` |
| Server shows database errors | Run `npm run db:migrate` to apply pending migrations |
| Hot reload breaks during test | Avoid editing files while tests are running |

## Windows / Git Bash Issues

| Problem | Solution |
|---------|----------|
| `npx tsx` shows no output | Use `node --import tsx` instead. Known issue with Git Bash on Windows. |
| Background server won't start | Use `cmd //c "start /b npm run dev"` in Git Bash. |
| `sleep` command not found | Use Git Bash (not cmd.exe). Git Bash includes `sleep`. |
| Port 3000 already in use | Kill existing process or use a different port via `PORT=3001 npm run dev`. |

## Debugging Checklist

When a test fails, follow this sequence:

1. **Read console output** — Which step failed? What error message?
2. **Take a debug screenshot** — `await page.screenshot({ path: 'debug.png' })`
3. **Read the screenshot** — What does the page actually show?
4. **Compare with expected** — What should it show at this step?
5. **List available elements** — `await page.locator('button').allTextContents()`
6. **Check dev server** — Is it running? Any errors in the server terminal?
7. **Check auth bypass** — Is the cookie set correctly?
8. **Verify URL** — Did navigation go to the right page?
9. **Check headless setting** — Run with `headless: false` to watch the test
10. **Check timeouts** — Is the operation taking longer than expected?

## Common Failure Pattern: Auth Redirect Loop

**Symptom:** Test navigates to feature page but ends up on password/login page.

**Cause:** Cookie not set before first navigation. The middleware checks cookies on every request.

**Fix:** Set `e2e_test_mode` cookie on the browser context BEFORE creating a page and navigating:

```typescript
const context = await browser.newContext();
await context.addCookies([{
  name: 'e2e_test_mode',
  value: 'true',
  domain: new URL(BASE_URL).hostname,
  path: '/',
}]);
const page = await context.newPage();
```

## Common Failure Pattern: AI Generation Timeout

**Symptom:** Test passes all navigation steps but times out waiting for AI-generated content.

**Cause:** AI generation (OpenAI API calls) can take 30-60 seconds. Default visibility timeout (5s) is too short.

**Fix:** Use 60-second timeout for steps that wait for AI-generated content:

```typescript
await waitForText(page, "Your affirmations", 60000);
```

## Common Failure Pattern: Button Text Mismatch

**Symptom:** `clickButton(page, "Save")` fails even though a save button is visible.

**Cause:** Button text doesn't match exactly. May have extra whitespace, different casing, or be an icon button with no text.

**Fix:** List all buttons to find the exact text:

```typescript
const buttons = await page.locator('button').allTextContents();
console.log('Available buttons:', buttons);
```

Then use the exact text, or switch to data-testid selector.

## Common Failure Pattern: Test Passes But Feature Broken

**Symptom:** All test steps pass (exit code 0), but screenshots show the feature isn't working correctly (e.g., generic content instead of personalized).

**Cause:** The test steps verify navigation and element presence, but the actual feature logic failed silently. The UI shows a graceful fallback.

**Action:** Check screenshots manually (or via Read tool for subagents) for evidence of the specific feature working, not just UI element presence. Update acceptance criteria to include specific content verification.
