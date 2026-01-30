# E2E Configuration — aiffirmation-proto

> **Purpose:** Project-level E2E config read by sdd-local commands (`createplan`, `e2e-epic-builder`, `run-all`) to discover project-specific E2E details. This is Layer 2 of the 4-layer E2E architecture.

---

## Configuration Fields

### Framework

**Playwright** (TypeScript)

Web-based E2E testing using Playwright's Chromium browser automation. Tests are written as TypeScript files executed via Node.js.

### Runner Command

```bash
node --import tsx e2e/<file>.ts
```

> **Note:** Always use `node --import tsx` instead of `npx tsx` — the latter doesn't reliably output to stdout in some environments (especially Git Bash on Windows).

### Test File Pattern

```
e2e/<name>.test.ts
```

Test files live in the `e2e/` directory at the project root. Current tests: `fo-01.test.ts` through `fo-09.test.ts`.

### Orchestration Pattern

**npm scripts**

```bash
# Install test browsers
npm run test:e2e:install

# Start dev server (background)
npm run dev &          # Linux/Mac
cmd //c "start /b npm run dev"  # Windows Git Bash

# Wait for server readiness
sleep 15

# Run test
node --import tsx e2e/<file>.ts
```

Server readiness check:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 307 = running (redirect to password page is normal)
# 000 = not running
```

### Shared Resource

**Browser instance** (low contention)

Playwright launches isolated Chromium instances per test. Each test gets its own browser context, so multiple tests can run concurrently without interference.

### Serialization Required

**false**

Browser instances are cheap and isolated. Multiple E2E tests can run in parallel without resource conflicts. No special serialization is needed at plan time — `createplan` should NOT chain E2E ticks with `--blocked-by` for this project.

### Screenshot Method

**Playwright built-in**

```typescript
await page.screenshot({ path: 'debug.png' });
```

Screenshots are saved to the project root or a specified path. Existing debug screenshots live in `e2e/` alongside test files.

### Environment Setup

1. **Prerequisites:** Node.js 20+, Chromium installed via `npm run test:e2e:install`
2. **Dev server:** Must be running at `http://localhost:3000` before tests execute
3. **Auth bypass:** Tests set an `e2e_test_mode` cookie to bypass password protection middleware:
   ```typescript
   await context.addCookies([{
     name: 'e2e_test_mode',
     value: 'true',
     domain: 'localhost',
     path: '/',
   }]);
   ```
4. **Headless mode:** Configurable per test file via `chromium.launch({ headless: true/false })`
5. **Base URL:** `process.env.TEST_URL || 'http://localhost:3000'`

### E2E Docs Path

```
docs/current/e2e/
```

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `TEST_URL` | `http://localhost:3000` (default) | Base URL for test navigation |

No special E2E-mode environment variables are needed for the app itself — auth bypass is handled via cookie, not env vars.

---

## Timeouts

| Operation | Default Timeout |
|-----------|-----------------|
| Page navigation | 30s |
| Element visibility | 5s |
| AI generation | 60s |

---

## Consumer Reference

This config is consumed by:

| Consumer | What it reads |
|----------|--------------|
| `createplan` | Framework, serialization required, e2e docs path |
| `e2e-epic-builder` | All fields — used to generate project-appropriate epic structure |
| `run-all` | Serialization required, runner command, orchestration pattern |
| Tick workers | Runner command, environment setup, screenshot method |
