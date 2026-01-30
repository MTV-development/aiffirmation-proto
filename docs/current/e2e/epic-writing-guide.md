# E2E Epic Writing Guide

How to structure E2E testing epics and ticks for the `tk` system. Patterns extracted from battle-tested epics.

## Epic Description Template

```
Title: E2E: <what you are verifying>
Type: epic

Description:

End-to-end test epic for verifying <feature description>.

## Context

**Project:** <Feature Name>
**Spec:** `docs/projects/<date>-<feature>/SPEC.md`
**Branch:** <branch-name>
**Cookbook:** `docs/projects/<date>-<feature>/E2E-COOKBOOK.md` (READ FIRST)
**Log:** `docs/projects/<date>-<feature>/E2E-TESTING-LOG.md` (WRITE NOTES HERE)

## What we are verifying

1. <First E2E verification point>
2. <Second E2E verification point>
3. <Third E2E verification point>

## Process

- ALWAYS read the cookbook before starting any tick
- ALWAYS take process notes in the log
- UPDATE the cookbook when you learn something new
```

## Standing Rules

After creating the epic, immediately add this note:

```bash
tk note <epic-id> "STANDING RULE FOR ALL TICKS: Every tick MUST update the cookbook with any new learnings before closing. New workarounds, timing discoveries, selector strategies, Playwright quirks, debugging techniques - all go in the cookbook. Also log every test run attempt in E2E-TESTING-LOG.md."
```

This ensures knowledge is captured across every tick in the epic.

## Tick Types

### Type A: E2E Verification Tick (Autonomous)

The primary tick type. Subagents execute these without human intervention. See [autonomous-execution.md](autonomous-execution.md) for the full execution guide.

```bash
tk create "Run E2E test and verify <what>" --parent <epic-id> \
  --acceptance "<specific verifiable outcome tied to screenshots/logs>"
```

**Description template:**

```
Run the E2E test and verify <feature> works correctly through screenshot analysis.

## Context

**Cookbook:** docs/projects/<date>-<feature>/E2E-COOKBOOK.md (READ FIRST)
**Log:** docs/projects/<date>-<feature>/E2E-TESTING-LOG.md (WRITE NOTES HERE)
**Test file:** e2e/<test-name>.test.ts

## Step 1: Read the cookbook
Read docs/projects/<date>-<feature>/E2E-COOKBOOK.md

## Step 2: Ensure dev server is running
Check if server is running:
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
If not running, start it:
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
- Analyze failure screenshots
- Determine: test infra issue vs app code bug
- If app code bug: create a blocking bug tick under this epic
- If test infra: fix and re-run
- Leave this tick open with findings note
```

### Type B: Bug Tick (Blocking)

Created mid-epic when E2E testing reveals app code issues. Blocks verification ticks.

```bash
tk create "Fix <root cause description>" -t bug --parent <epic-id> \
  --acceptance "<tied to E2E screenshot evidence>"
```

**Description template:**

```
E2E test reveals <problem>. The <component/feature> does not work as expected.

## Evidence

- Screenshot shows: <what's wrong>
- Console output shows: <relevant output>
- Expected: <correct behavior>
- Actual: <broken behavior>

## Root Cause

<Analysis of why this happens. Reference specific files and functions.>

## Files to Fix

- `<file1>` - <change description>
- `<file2>` - <change description>
```

After creating, set blocking:
```bash
tk block <verification-tick-id> <bug-tick-id>
tk note <epic-id> "Bug found: <bug-id> - <brief description>. Blocks <verification-tick-id>."
```

### Type C: Test Infrastructure Tick

Creating or extending TypeScript tests, adding test IDs, setting up helpers.

```bash
tk create "Create E2E test for <feature>" --parent <epic-id> \
  --acceptance "Test file exists and passes basic smoke test"
```

**Description template:**

```
Create or extend a Playwright TypeScript test for <feature>.

## Context

**Cookbook:** docs/projects/<date>-<feature>/E2E-COOKBOOK.md (READ FIRST)
**Log:** docs/projects/<date>-<feature>/E2E-TESTING-LOG.md (WRITE NOTES HERE)
**Reference patterns:** docs/current/e2e/playwright-patterns.md

## What to create

Test file: e2e/<test-name>.test.ts

Steps:
1. Launch browser and create context
2. Set e2e_test_mode cookie
3. Navigate to feature page
4. Perform actions and assertions
5. Take screenshots at key points

## Test IDs needed

Add data-testid attributes to these components:
- `<file1>` - data-testid: '<feature>-<element>'
- `<file2>` - data-testid: '<feature>-<element>'

See docs/current/e2e/playwright-patterns.md for test ID conventions.
See docs/current/e2e/troubleshooting.md for common selector issues.

## Process

- Read the cookbook first
- Read playwright-patterns.md for TypeScript syntax
- Create the test file
- Run a quick smoke test
- Log results in E2E-TESTING-LOG.md
- Update cookbook with any new learnings
```

### Type D: Human Setup Tick

For one-time environment setup that requires human action.

```bash
tk create "<Setup description>" --parent <epic-id> --awaiting work \
  --acceptance "<verification command or check>"
```

**Description template:**

```
Human needs to perform one-time setup for E2E testing.

## Steps

1. <Specific action>
2. <Specific action>
3. <Verification command>

## Verification

Run this command to confirm setup is complete:
    <verification command>
```

## Dependency Patterns

Standard ordering for E2E epic ticks:

```
[Human Setup] (if needed, --awaiting work)
      |
[Test Infrastructure] (create test file, add test IDs)
      |
[Verification - Run 1] (run test, check results)
      |
[Bug Fix] (if E2E reveals code issues, created dynamically)
      |
[Verification - Run 2] (re-run after fix, blocked by bug)
      |
[Final Verification] (full pass, blocked by all previous)
```

Set dependencies with:
```bash
# Infrastructure before verification
tk block <verification-id> <infrastructure-id>

# Bug blocks re-verification
tk block <re-verification-id> <bug-id>

# Final depends on all verification
tk block <final-id> <re-verification-id>
```

> **Note:** E2E ticks in this project do NOT need to be chained with `--blocked-by` for serialization purposes. Playwright tests use isolated browser instances and can run in parallel.

## Epic Notes Usage

Use `tk note <epic-id> "<message>"` as a cross-tick running log. Include:
- Which tick prompted the note
- Key findings or decisions
- Tips for future ticks

Example:
```bash
tk note q8n "dme complete: Focus selection test IDs work. clickButton helper is reliable."
tk note q8n "tpd complete: Extended test to 8 steps. Cookie auth bypass works correctly."
tk note q8n "E2E RUN SUCCESSFUL (8/8 pass). AI generation takes 45s — increased timeout to 60s."
```

## Testing Log Template

Create `docs/projects/<date>-<feature>/E2E-TESTING-LOG.md` using this structure:

```markdown
# E2E Testing Log - <Feature Name>

## Test File
`e2e/<test-name>.test.ts`

## Environment

| Component | Path/Value |
|-----------|-----------|
| Base URL | `http://localhost:3000` |
| Browser | Chromium (Playwright) |
| Runner | `node --import tsx` |

## Key Learnings

(Numbered, added as discovered during test runs)

## Test Run History

### Run 1 - <brief description> (<PASS/FAIL>)
- **Date:** YYYY-MM-DD
- **Pre-conditions:** <server running, env state>
- **Result:** PASS/FAIL at Step X
- **Root cause (if fail):** <why it failed>
- **Fix applied:** <what was changed>
- **Screenshots:** <path to screenshots>
```

## Checklist: Creating an E2E Epic

1. [ ] Feature spec exists (`docs/projects/<date>-<feature>/SPEC.md`)
2. [ ] Feature branch exists
3. [ ] Cookbook created from template (copy `docs/current/e2e/cookbook-template.md`)
4. [ ] Testing log created from template (see above)
5. [ ] Epic created with Context / What we verify / Process sections
6. [ ] Standing rule note added to epic
7. [ ] Ticks created with proper types and descriptions
8. [ ] Dependencies set between ticks
9. [ ] Human setup tick created if environment setup needed (with `--awaiting work`)
