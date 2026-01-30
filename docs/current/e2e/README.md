# E2E Testing Documentation Hub

Reusable knowledge base for Playwright-based end-to-end testing. This hub contains patterns, templates, and guides extracted from real E2E testing epics.

## Key Principle: E2E Testing is Integrated, Not Bolted On

E2E testing is part of every UI tick, not a separate phase at the end. When you implement UI, you verify it with E2E in the same tick.

## Quick Navigation

### Project Configuration

| Document | Purpose |
|----------|---------|
| **[e2e-config.md](e2e-config.md)** | **Project E2E config — framework, runner, serialization, env vars** |

### For Planning (/sdd-local:createplan)

| Document | Purpose |
|----------|---------|
| **[ui-epic-structure.md](ui-epic-structure.md)** | **How to structure UI tasks as epics with integrated E2E** |
| **[project-e2e-directory.md](project-e2e-directory.md)** | **Project e2e/ subdirectory pattern for shared knowledge** |
| [epic-writing-guide.md](epic-writing-guide.md) | Tick templates and dependency patterns for the `tk` system |
| [cookbook-template.md](cookbook-template.md) | Copy-paste template for project cookbooks |

### For Implementing (Individual Ticks)

| Document | Purpose |
|----------|---------|
| **[tick-quick-reference.md](tick-quick-reference.md)** | **Minimal knowledge to run E2E tests - read this first** |
| [playwright-patterns.md](playwright-patterns.md) | Reusable Playwright TypeScript patterns with copy-paste examples |
| [troubleshooting.md](troubleshooting.md) | Common issues and fixes |

### For Automation (Subagents)

| Document | Purpose |
|----------|---------|
| [autonomous-execution.md](autonomous-execution.md) | How subagents run E2E tests without human intervention |

### Parent Setup Guide

| Document | Purpose |
|----------|---------|
| [../e2e-testing.md](../e2e-testing.md) | **Full setup guide — install, run, write tests** |

## What Are You Trying to Do?

### Planning a UI feature with `/sdd-local:createplan`?

1. **Read [ui-epic-structure.md](ui-epic-structure.md)** - How to break UI work into epics with E2E
2. Each UI "chunk" becomes an epic with its own E2E scope
3. Every UI tick includes E2E verification, not just the last tick

### Working on a tick that needs E2E testing?

1. **Read [tick-quick-reference.md](tick-quick-reference.md)** - Everything you need on one page
2. Read your project's cookbook: `docs/projects/<date>-<feature>/E2E-COOKBOOK.md`
3. Reference [playwright-patterns.md](playwright-patterns.md) for TypeScript syntax

### Setting up E2E for a new feature?

1. Copy [cookbook-template.md](cookbook-template.md) to your project directory
2. Create a testing log: `docs/projects/<date>-<feature>/E2E-TESTING-LOG.md`
3. Create or extend TypeScript test in `e2e/`
4. Use `/e2e-epic-builder` skill to scaffold the full structure

### Debugging a failing test?

1. Read [troubleshooting.md](troubleshooting.md) for known issues
2. Check your project's cookbook for feature-specific workarounds
3. Log your findings in the testing log and update the cookbook

## UI Epic = E2E Scope

When breaking down UI work:

```
Spec: "Add affirmation generation flow"
          ↓
UI Chunk 1: Focus selection flow     → Epic with E2E
UI Chunk 2: Chat-based generation    → Epic with E2E
UI Chunk 3: Review and save          → Epic with E2E
```

Each epic has:
- Its own E2E TypeScript test
- Its own cookbook (living document)
- Its own testing log
- E2E verification in every UI tick

See [ui-epic-structure.md](ui-epic-structure.md) for the full pattern.

## Tick-Level E2E Integration

Every UI tick should answer:

| Question | Example Answer |
|----------|----------------|
| What test file verifies this? | `e2e/fo-01.test.ts` |
| What screenshot proves success? | Screenshot shows generated affirmations |
| What's the run command? | `node --import tsx e2e/fo-01.test.ts` |
| Where's the cookbook? | `docs/projects/2026-01-28-fo-02/E2E-COOKBOOK.md` |
| What if it fails? | See [tick-quick-reference.md](tick-quick-reference.md) |

## Infrastructure Quick Links

| Resource | Path |
|----------|------|
| Test files (TypeScript) | `e2e/` |
| Parent setup guide | `docs/current/e2e-testing.md` |
| Project E2E config | `docs/current/e2e/e2e-config.md` |
| Screenshot output | Project root or specified path |

## Autonomous Execution

Almost all E2E testing runs autonomously. Subagents can:
- Start the dev server in the background
- Execute Playwright tests
- Visually verify screenshots (Claude is multimodal)
- Check console output for errors
- Create bug ticks when tests reveal code issues
- Update documentation

Human involvement is limited to one-time environment setup and PR approval.

See [autonomous-execution.md](autonomous-execution.md) for the full guide.
