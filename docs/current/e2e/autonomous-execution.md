# Autonomous E2E Test Execution

Almost all E2E testing in this project is automated. Subagents can execute the full cycle without human intervention: run tests, analyze results (including visual screenshot verification), debug failures, create bug ticks, and update documentation.

## What Subagents CAN Do (Autonomous)

| Capability | How |
|------------|-----|
| **Start dev server** | `cmd //c "start /b npm run dev"` (Windows Git Bash) or `npm run dev &` (Linux/Mac) |
| **Check server readiness** | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` (307 = ready) |
| **Execute Playwright tests** | `node --import tsx e2e/<test-name>.test.ts` (check exit code: 0 = pass) |
| **Read screenshot files** | Claude's Read tool supports images (multimodal) |
| **Check console output** | Test output goes to stdout with step-by-step results |
| **Create/close ticks** | `tk create`, `tk close`, `tk note`, `tk update` |
| **Create blocking bug ticks** | When E2E reveals code issues, create bugs that block verification |
| **Update documentation** | Edit cookbook and testing log files directly |

## What Requires Human Intervention (Rare)

| Task | Why |
|------|-----|
| **One-time environment setup** | Installing Chromium via `npm run test:e2e:install` |
| **Approving PRs** | Final review and merge |
| **Host machine issues** | Disk space, OS-level problems |
| **External API credentials** | Setting up API keys in `.env.local` |

## Subagent E2E Execution Flow

When a subagent is assigned an E2E verification tick, it follows this flow:

```
1. Mark tick as in_progress
   tk update <id> --status in_progress

2. Read the cookbook
   Read docs/projects/<date>-<feature>/E2E-COOKBOOK.md

3. Read previous test runs
   Read docs/projects/<date>-<feature>/E2E-TESTING-LOG.md

4. Ensure dev server is running
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   If 000 (not running):
     cmd //c "start /b npm run dev"
     sleep 15

5. Run the E2E test
   node --import tsx e2e/<test-name>.test.ts
   (timeout: 120000ms / 2 minutes)

6. Check exit code
   0 = all steps passed
   Non-zero = failure (check output for which step)

7. If PASS → Verify via screenshots
   a. Read screenshot files using Read tool (supports images)
   b. Visually verify expected UI state vs actual
   c. Check console output for warnings
   d. Log run in testing log
   e. Update cookbook if new learnings
   f. Close tick with evidence summary

8. If FAIL → Diagnose and act
   a. Check console output for failure details
   b. Take debug screenshots if needed
   c. Determine: test infrastructure issue OR app code bug
   d. If test issue → fix TypeScript test, re-run (loop back to step 5)
   e. If app code bug → create blocking bug tick (see below)
   f. Log failure in testing log
   g. Update cookbook with failure pattern
   h. Leave tick open with findings note
```

## Screenshot Verification Guide

Screenshots are the primary verification method. The Read tool renders images visually, allowing the subagent to inspect UI state.

### How to find screenshots

Screenshots are saved to the path specified in `page.screenshot({ path })`. Common locations:
- Project root: `01-initial-state.png`, `02-focus-selected.png`, etc.
- Test directory: `e2e/debug.png`

### What to look for

- **Expected elements present** (buttons, text, cards, generated content)
- **Fallback indicators** (placeholder text, loading spinners that never resolve)
- **Error states** (error messages, blank pages, unexpected redirects)
- **Layout correctness** (elements positioned correctly, responsive layout intact)

### Example verification description

> Screenshot 03 shows the affirmation generation results page with 5 generated affirmations displayed as cards. Each card has "I like it" and "Skip" buttons. The header shows "Your Affirmations" confirming the generation completed successfully.

## Creating Bug Ticks from E2E Failures

When an E2E test reveals an app code bug, the subagent creates a blocking bug tick:

```bash
# 1. Create the bug tick
tk create "Fix <root cause description>" -t bug --parent <epic-id>

# 2. Add description with evidence
tk update <bug-id> -d "E2E test reveals <problem>.

## Evidence
- Screenshot shows: <description of what's wrong>
- Console output shows: <relevant output>
- Expected: <what should happen>
- Actual: <what happens>

## Root Cause
<analysis of why this happens>

## Files to Fix
- <file1> - <change needed>
- <file2> - <change needed>"

# 3. Set acceptance criteria
tk update <bug-id> --acceptance "E2E screenshots show <expected state>."

# 4. Block the verification tick
tk block <verification-tick-id> <bug-id>

# 5. Add epic note
tk note <epic-id> "Bug found: <bug-id> - <brief description>. Blocks <verification-tick-id>."
```

The subagent should then either:
- **Fix the bug itself** if it's a straightforward code change
- **Leave it for the next wave** if it requires architectural decisions

## Debugging Patterns for Subagents

### List Available Buttons (When Click Fails)

If `clickButton(page, "Save")` fails, list what's available:

```typescript
const buttons = await page.locator('button').allTextContents();
console.log('Available buttons:', buttons);
```

### Take Debug Screenshot (When State is Unclear)

```typescript
await page.screenshot({ path: 'debug-state.png' });
```

### Check for Error Messages

```typescript
const errors = await page.locator('.error, [role="alert"]').allTextContents();
console.log('Error messages:', errors);
```

### Verify Auth Bypass Working

If the test redirects to a password page, the cookie wasn't set correctly:

```typescript
// Cookie must be set on context BEFORE creating the page
await context.addCookies([{
  name: 'e2e_test_mode',
  value: 'true',
  domain: 'localhost',
  path: '/',
}]);
// THEN create page and navigate
const page = await context.newPage();
```

## Tick Description Template for Autonomous Verification

Use this template when creating verification ticks that subagents will execute:

```
## Context

**Cookbook:** docs/projects/<date>-<feature>/E2E-COOKBOOK.md (READ FIRST)
**Log:** docs/projects/<date>-<feature>/E2E-TESTING-LOG.md (WRITE NOTES HERE)
**Test file:** e2e/<test-name>.test.ts

## Step 1: Read the cookbook
Read docs/projects/<date>-<feature>/E2E-COOKBOOK.md

## Step 2: Ensure dev server is running
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
If not running (returns 000):
    cmd //c "start /b npm run dev"
    sleep 15

## Step 3: Run the E2E test
    node --import tsx e2e/<test-name>.test.ts
Timeout: 120000ms (2 minutes)

## Step 4: Check exit code
- Exit code 0 = all steps passed
- Non-zero = check output for failure details

## Step 5: Verify via screenshots
Read screenshot files using the Read tool (supports images):
- Screenshot <N>: Should show <expected state>
- Screenshot <M>: Should show <expected state>

## Step 6: Log results
Append to docs/projects/<date>-<feature>/E2E-TESTING-LOG.md

## Step 7: Update cookbook
Update docs/projects/<date>-<feature>/E2E-COOKBOOK.md if new learnings

## If test FAILS
- Analyze console output and failure screenshots
- Determine: test infra issue vs app code bug
- If app code bug: create a blocking bug tick
- If test infra: fix and re-run
- Leave this tick open with findings note
```
