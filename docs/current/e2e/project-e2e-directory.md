# Project E2E Directory Pattern

**For `/sdd-local:createplan` and `/sdd-local:run-all`**

Every project that includes E2E testing should have a dedicated `e2e/` subdirectory within its project folder. This creates a shared knowledge space where all epics and ticks can communicate about E2E testing for that specific project.

## Directory Structure

```
docs/projects/<date>-<feature>/
├── SPEC.md                      # Project specification
├── e2e/                         # E2E experience directory
│   ├── README.md                # Quick reference for this project's E2E testing
│   ├── SCRATCHPAD.md            # Living document - what's working, what's not
│   ├── COOKBOOK.md              # Project-specific patterns and workarounds
│   ├── LOG.md                   # Test run history with results
│   └── tests/                   # Project-specific test files (if needed)
│       └── <feature>.test.ts    # Playwright test for this feature
```

## File Purposes

### README.md - Project E2E Quick Reference

```markdown
# E2E Testing - <Feature Name>

## Quick Start

1. Read the scratchpad: `e2e/SCRATCHPAD.md`
2. Run the test: `node --import tsx e2e/<test-name>.test.ts`
3. Check screenshots: project root or specified path

## Key Files

| File | Purpose |
|------|---------|
| `SCRATCHPAD.md` | Current status, blockers, discoveries |
| `COOKBOOK.md` | Patterns that work for this project |
| `LOG.md` | Every test run recorded |
| `tests/<name>.test.ts` | Playwright test file |

## References

- Knowledge base: `docs/current/e2e/`
- Tick quick reference: `docs/current/e2e/tick-quick-reference.md`
- Playwright patterns: `docs/current/e2e/playwright-patterns.md`
```

### SCRATCHPAD.md - Living Status Document

**This is the most important file.** Every tick writes here about:
- What they tried
- What worked / didn't work
- Current blockers
- Discoveries about this specific project's E2E quirks

```markdown
# E2E Scratchpad - <Feature Name>

## Current Status

<one-line summary: WORKING / BLOCKED / IN PROGRESS>

## Latest Findings

### <date> - <tick-id>: <brief description>

<what was discovered, what worked, what didn't>

## Known Issues

1. <Issue description>
   - Workaround: <how to handle it>

## What's Working

- <list of things confirmed working>

## What's NOT Working

- <list of blockers or issues>

## Questions / Unknowns

- <things still to figure out>
```

### COOKBOOK.md - Project-Specific Patterns

Patterns that work specifically for this project. Complements the global `docs/current/e2e/playwright-patterns.md` with project-specific knowledge.

```markdown
# E2E Cookbook - <Feature Name>

## Project-Specific Patterns

### <Pattern Name>

**Problem:** <what you were trying to solve>

**Solution:**
```typescript
// TypeScript snippet that works
```

**Why this works:** <explanation>

## Page-by-Page Guide

### <Page Name>

- **Selector works:** yes/no
- **Detection method:** data-testid / text content / role
- **Timing:** <wait requirements>
```

### LOG.md - Test Run History

Every test run gets logged, pass or fail.

```markdown
# E2E Test Log - <Feature Name>

## Run History

### Run N - <date> <time> - <PASS/FAIL>

**Tick:** <tick-id>
**Command:** `<what was run>`
**Result:** PASS/FAIL at Step X
**Screenshots:** `<path>`
**Notes:** <observations>

<If FAIL: root cause and fix applied>
```

### tests/*.test.ts - Project Test Files

Project-specific Playwright TypeScript files. These may:
- Be created fresh for this project
- Extend existing tests from `e2e/`
- Reference common patterns from the knowledge base

## How Ticks Use This Directory

### At Start of Any E2E Tick

1. **Read SCRATCHPAD.md** - See what previous ticks discovered
2. **Read COOKBOOK.md** - Check for known patterns
3. **Read LOG.md** - See recent test results

### During Work

1. **Update SCRATCHPAD.md** - Record findings as you go
2. **Run tests** - Use the test file in `e2e/`
3. **Take notes** - Don't wait until the end

### Before Closing

1. **Log the run** in LOG.md
2. **Update SCRATCHPAD.md** with final status
3. **Add patterns** to COOKBOOK.md if you discovered something reusable
4. **Update README.md** if quick reference changed

## Integration with Knowledge Base

The project e2e/ directory is **project-specific**. It references the global knowledge base:

| Project-Specific | Global Knowledge Base |
|------------------|----------------------|
| `e2e/SCRATCHPAD.md` | - |
| `e2e/COOKBOOK.md` | `docs/current/e2e/playwright-patterns.md` |
| `e2e/LOG.md` | - |
| `e2e/README.md` | `docs/current/e2e/tick-quick-reference.md` |
| `e2e/tests/*.test.ts` | `e2e/` (repo root) |

**Rule:** Project-specific discoveries that apply broadly should be promoted to the global knowledge base.

## createplan Integration

When `/sdd-local:createplan` creates epics for a feature with UI work:

1. **First tick creates the e2e/ directory structure**
2. **All UI ticks reference the project e2e/ directory**
3. **Standing rule on epic:** "Update e2e/SCRATCHPAD.md with findings"

### Example Epic Description

```markdown
## Context

**Spec:** `docs/projects/2026-01-17-fo-02/SPEC.md`
**E2E Directory:** `docs/projects/2026-01-17-fo-02/e2e/`

**Before starting any tick:**
1. Read `e2e/SCRATCHPAD.md` for current status
2. Read `e2e/COOKBOOK.md` for project patterns

**After every tick:**
1. Update `e2e/SCRATCHPAD.md` with findings
2. Log test runs in `e2e/LOG.md`
```

### Example Tick Description

```markdown
## E2E Context

**Scratchpad:** docs/projects/2026-01-17-fo-02/e2e/SCRATCHPAD.md (READ FIRST)
**Cookbook:** docs/projects/2026-01-17-fo-02/e2e/COOKBOOK.md
**Log:** docs/projects/2026-01-17-fo-02/e2e/LOG.md
**Test file:** e2e/fo-02.test.ts

**Quick reference:** docs/current/e2e/tick-quick-reference.md

Before starting, check the scratchpad for current status and blockers.
```

## run-all Integration

When `/sdd-local:run-all` executes ticks:

1. **Ticks read from SCRATCHPAD.md** to understand current state
2. **Ticks write to SCRATCHPAD.md** as they discover things
3. **Subsequent ticks in the same epic** see what previous ticks learned
4. **Cross-epic knowledge sharing** happens via the shared scratchpad

This enables autonomous agents to build on each other's E2E knowledge without human intervention.

## Template Files

Use these templates when creating a new project e2e/ directory:

### Minimal Setup Script

```bash
# Create project E2E directory
PROJECT_DIR="docs/projects/<date>-<feature>"
mkdir -p "$PROJECT_DIR/e2e/tests"

# Create README
cat > "$PROJECT_DIR/e2e/README.md" << 'EOF'
# E2E Testing - <Feature Name>

## Quick Start

1. Read the scratchpad: `SCRATCHPAD.md`
2. Run: `node --import tsx e2e/<test-name>.test.ts`
3. Screenshots: project root or specified path

## References

- Knowledge base: `docs/current/e2e/`
- Quick reference: `docs/current/e2e/tick-quick-reference.md`
EOF

# Create SCRATCHPAD
cat > "$PROJECT_DIR/e2e/SCRATCHPAD.md" << 'EOF'
# E2E Scratchpad - <Feature Name>

## Current Status

IN PROGRESS - Setting up E2E testing

## Latest Findings

(none yet)

## Known Issues

(none yet)

## What's Working

(to be determined)

## What's NOT Working

(to be determined)
EOF

# Create COOKBOOK
cat > "$PROJECT_DIR/e2e/COOKBOOK.md" << 'EOF'
# E2E Cookbook - <Feature Name>

## Project-Specific Patterns

(add patterns as discovered)

## Page-by-Page Guide

(document each page's E2E approach)
EOF

# Create LOG
cat > "$PROJECT_DIR/e2e/LOG.md" << 'EOF'
# E2E Test Log - <Feature Name>

## Run History

(log each test run here)
EOF
```

## Benefits

1. **Knowledge Continuity** - Ticks don't start from scratch
2. **Autonomous Operation** - Agents can learn from each other
3. **Project Isolation** - Each project's quirks are documented separately
4. **Global Learning** - Patterns can be promoted to knowledge base
5. **Debugging History** - LOG.md provides audit trail
