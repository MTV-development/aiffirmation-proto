# E2E Cookbook Template

Copy this file to `docs/projects/<date>-<feature>/E2E-COOKBOOK.md` when starting a new E2E epic. Fill in the placeholders and remove the instructions.

---

# E2E Testing Cookbook - [FEATURE NAME]

**Project:** [Project Name]
**Last updated:** [Date]

This cookbook captures everything learned about running E2E tests for [feature]. It is a living document - update it whenever you learn something new.

---

## Quick Reference

### Full Run (Cold Start)

```bash
# Start the dev server in background
cmd //c "start /b npm run dev"   # Windows Git Bash
# npm run dev &                  # Linux/Mac

# Wait for server to be ready
sleep 15

# Run the test
node --import tsx e2e/[test-name].test.ts
```

### Quick Re-Run (Server Already Running)

```bash
# Just re-run the test (fastest iteration cycle)
node --import tsx e2e/[test-name].test.ts
```

### Check Server Status

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 307 = running (redirect to password page is normal)
# 000 = not running
```

---

## Architecture

```
Browser (Chromium via Playwright)
    |
    +-- Dev Server (localhost:3000)
    |   npm run dev
    |
    +-- Auth Bypass
    |   Cookie: e2e_test_mode=true
    |
    +-- Test Runner
        node --import tsx e2e/[test-name].test.ts
        [N] steps, [M] screenshots
```

---

## Test Flow ([N] Steps)

| Step | What it does | Detection method |
|------|-------------|-----------------|
| 1 | Navigate to page | `page.goto()` |
| 2 | [Screen name] | data-testid: `[testid]` |
| 3 | [Action] | [method] |
| ... | ... | ... |

---

## Known Issues and Workarounds

<!-- Add numbered entries as you discover issues. For each entry include:
     Symptom, Root cause, Fix/workaround, Key insight -->

### 1. [Issue Title]

**Symptom:** [What you observe]

**Root cause:** [Why it happens]

**Fix:** [How to work around it]

**Key insight:** [What future ticks should know]

---

## Environment Details

| Component | Path/Value |
|-----------|-----------|
| Base URL | `http://localhost:3000` |
| Browser | Chromium (Playwright) |
| Runner | `node --import tsx` |
| Test file | `e2e/[test-name].test.ts` |
| Screenshots | Project root or specified path |

---

## Debugging a Failed Test

1. **Check the console output** for which step failed
2. **Check screenshots** in the project root or specified path
3. **Run with visible browser** — set `headless: false` in `chromium.launch()`
4. **List available buttons** — `await page.locator('button').allTextContents()`
5. **Take debug screenshots** — `await page.screenshot({ path: 'debug.png' })`
6. **Check dev server logs** in the server terminal for errors
7. **Verify server is running** — `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`

---

## Common Failure Patterns

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Connection refused | Dev server not running | Start with `npm run dev` |
| Timeout waiting for element | Page not loaded or wrong selector | Check selector, increase timeout |
| Auth redirect to password page | Missing e2e_test_mode cookie | Ensure cookie is set before navigation |
| [Add patterns as discovered] | | |

---

## What This Test Verifies

<!-- Describe what the test proves when it passes.
     Include which screenshots to check and what to look for. -->

### Screenshots to verify

- **Screenshot [N]**: [What it should show]
- **Screenshot [M]**: [What it should show]

### What to look for in screenshots

- [Positive indicator] = feature is working
- [Negative indicator] = feature is broken / showing fallback

---

## Process Notes

All process notes and test run history go in the companion file:
`docs/projects/[date]-[feature]/E2E-TESTING-LOG.md`

Update that log with every test run attempt, including:
- Run number
- What happened
- Root cause of any failure
- What was fixed
