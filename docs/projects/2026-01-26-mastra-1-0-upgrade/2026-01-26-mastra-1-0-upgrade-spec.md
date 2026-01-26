# Mastra 1.0 Upgrade Specification

**Created:** 2026-01-26
**Status:** Complete

## Overview

This specification covers upgrading the aiffirmation-proto project from Mastra 1.0 beta packages to the stable Mastra 1.0 release.

### Current State
- `mastra`: ^1.0.0-beta.12
- `@mastra/core`: ^1.0.0-beta.19
- `@mastra/pg`: ^1.0.0-beta.11
- `@mastra/memory`: ^1.0.0-beta.10
- `@mastra/loggers`: ^1.0.0-beta.3
- `@mastra/libsql`: ^1.0.0-beta.10

### Target State
- All Mastra packages updated to stable `@latest` releases

## Prerequisites

**Node.js Version:** Mastra v1 requires Node.js 22.13.0 or higher. Verify with:
```bash
node --version
```

## Migration Strategy

### Step 1: Run Mastra Codemod

The official migration tool handles automated transformations:

```bash
npx @mastra/codemod@latest v1
```

This should update:
- Imports to use subpath entry points (`@mastra/core/agent`, `@mastra/core/tools`)
- `RuntimeContext` → `RequestContext` renames
- `createTool` execute signature changes to `(inputData, context)`
- Collection accessor renames (`.get*` → `.list*`)
- Pagination: `offset/limit` → `page/perPage`

### Step 2: Update Package Versions

Update all packages to `@latest`:

```bash
npm install @mastra/core@latest @mastra/loggers@latest @mastra/memory@latest @mastra/pg@latest @mastra/libsql@latest mastra@latest
```

### Step 3: Manual Review

After codemod, manually review:

1. **Tool execute signatures** - Verify `createTool` uses `(inputData, context)` pattern
2. **Import paths** - Confirm subpath imports are correct
3. **Storage configuration** - Verify PostgresStore is compatible
4. **Workflow API** - Check workflow suspend/resume patterns still work
5. **Type casts** - Review `as any` usage and remove if now properly typed
6. **Remove `format` parameter** - Remove from agent method calls if present

### Step 4: Verification

1. Run the dev server: `npm run dev`
2. Run Mastra Studio: `npx mastra dev`
3. Execute E2E test: `node --import tsx e2e/fo-05.test.ts`

## Complete Mastra API Usage Inventory

### Packages Installed
| Package | Current Version | Used? |
|---------|-----------------|-------|
| `mastra` | ^1.0.0-beta.12 | Yes - CLI |
| `@mastra/core` | ^1.0.0-beta.19 | Yes - Agent, Workflow, Tools |
| `@mastra/pg` | ^1.0.0-beta.11 | Yes - PostgresStore |
| `@mastra/loggers` | ^1.0.0-beta.3 | Yes - PinoLogger |
| `@mastra/libsql` | ^1.0.0-beta.10 | No - installed but unused |
| `@mastra/memory` | ^1.0.0-beta.10 | No - installed but unused |

### APIs Actually Used
1. **Core Classes**: `Mastra`, `Agent`, `PostgresStore`, `PinoLogger`
2. **Factories**: `createWorkflow()`, `createStep()`, `createTool()`
3. **Agent Methods**: `agent.generate(prompt)` → `{ text: string }`
4. **Workflow Methods**: `workflow.run()`, `workflow.resume()`, `mastra.getWorkflow()`
5. **Storage Methods**: `mastra.getStorage()`, `storage.getStore()`, `store.loadWorkflowSnapshot()`
6. **Step Functions**: `suspend()` callback for pause/resume

### APIs NOT Used (safe to ignore in migration)
- Memory APIs (`@mastra/memory`)
- LibSQL storage (`@mastra/libsql`)
- RuntimeContext / RequestContext
- Pagination (offset, limit, page, perPage)
- Semantic recall / embeddings
- Voice APIs

## Files to Update

### Primary Files
- `package.json` - Version updates
- `src/mastra/index.ts` - Mastra instance configuration
- `src/mastra/tools/weather-tool.ts` - Tool execute signature `(inputData, context)`

### Agent Files (19 agents across these files)
| File | Agents |
|------|--------|
| `src/mastra/agents/weather-agent.ts` | weatherAgent |
| `src/mastra/agents/ag-aff-01/agent.ts` | af1Agent + factory |
| `src/mastra/agents/ag-good-ten/agent.ts` | goodTenAgent + factory |
| `src/mastra/agents/full-process/agent.ts` | fullProcessAgent + factory |
| `src/mastra/agents/full-process-2/agent.ts` | fullProcess2Agent + factory |
| `src/mastra/agents/full-process-3/agent.ts` | fullProcess3Agent + factory |
| `src/mastra/agents/fo-01/agent.ts` | fo01Agent + factory |
| `src/mastra/agents/fo-02/agent.ts` | fo02Agent + factory |
| `src/mastra/agents/fo-03/agent.ts` | fo03Agent + factory |
| `src/mastra/agents/fo-04/agent.ts` | fo04DiscoveryAgent + factory |
| `src/mastra/agents/fo-04/affirmation-agent.ts` | fo04AffirmationAgent + factory |
| `src/mastra/agents/fo-05/agent.ts` | fo05DiscoveryAgent + factory |
| `src/mastra/agents/fo-05/affirmation-agent.ts` | fo05AffirmationAgent + factory |
| `src/mastra/agents/fo-05/summary-agent.ts` | fo05PreSummaryAgent, fo05PostSummaryAgent + factories |
| `src/mastra/agents/alt-process-1/agent.ts` | altProcess1Agent + factory |
| `src/mastra/agents/alt-process-2/agent.ts` | altProcess2Agent + factory |
| `src/mastra/agents/chat-survey/discovery-agent.ts` | discoveryAgent + factory |
| `src/mastra/agents/chat-survey/generation-agent.ts` | generationAgent + factory |
| `src/mastra/agents/chat-survey/profile-extractor-agent.ts` | profileExtractorAgent + factory |

### Workflow Files
- `src/mastra/workflows/chat-survey/index.ts` - Workflow definition
- `src/mastra/workflows/chat-survey/steps/discovery-chat.ts` - Discovery step
- `src/mastra/workflows/chat-survey/steps/profile-builder.ts` - Profile extraction step
- `src/mastra/workflows/chat-survey/steps/generate-stream.ts` - Generation step

### Storage/Init Files
- `src/db/init-mastra.ts` - Storage initialization script

### Server Action Files
- `app/chat-survey/actions.ts` - Uses workflow.run(), resume(), storage APIs
- Other `app/*/actions.ts` files - Use agent.generate() only

## Known Breaking Changes from 1.0 Announcement

### High Impact
| Change | Current Status | Action Required |
|--------|----------------|-----------------|
| `createTool` execute signature `(inputData, context)` | Needs verification | Codemod will update |
| Subpath imports | Already using some | Codemod will update |
| Pagination: `offset/limit` → `page/perPage` | Needs verification | Codemod will update |
| Observability: Install `@mastra/observability` | Not currently used | N/A |

### Medium Impact
| Change | Current Status | Action Required |
|--------|----------------|-----------------|
| `RuntimeContext` → `RequestContext` | Needs verification | Codemod will update |
| Storage methods: `.get*` → `.list*` | Needs verification | Codemod will update |
| Property access → getter methods | Needs verification | Codemod will update |
| Remove `format` parameter from agent methods | Needs verification | Manual review |

### Low Impact
| Change | Current Status | Action Required |
|--------|----------------|-----------------|
| Workflow: `createRunAsync` → `createRun` | Needs verification | Codemod will update |
| Memory defaults changed | Using explicit config | Verify behavior |

## Risks

1. **Workflow snapshot compatibility** - Existing workflow runs may not be compatible
2. **Beta API differences** - Some beta APIs may have changed before stable
3. **PostgresStore API** - Storage API may have changed
4. **Node.js version requirement** - Need to ensure Node.js 22.13.0+ is available

## Validation Criteria

1. `npm run dev` starts without errors
2. `npx mastra dev` opens Mastra Studio successfully
3. `node --import tsx e2e/fo-05.test.ts` passes
4. No TypeScript errors in the codebase

## Open Questions

- [x] What is the exact stable version number for each package? → @mastra/core@1.0.4, mastra@1.0.1, others@1.0.0
- [x] Does the spec cover all Mastra usage? → Yes, comprehensive audit completed (19 agents, 1 workflow, 3 steps, 1 tool)
- [x] Are there any additional breaking changes between beta.19 and stable 1.0? → Yes, `resumeSchema` required for workflow steps (fixed)
- [x] Does the workflow snapshot format need migration? → No, existing format compatible

## References

- [Mastra 1.0 Announcement](https://mastra.ai/blog/announcing-mastra-1)
- [Mastra v1 Migration Guide](https://mastra.ai/guides/v1/migrations/upgrade-to-v1/overview)
- [Mastra Documentation](https://mastra.ai/docs)
- [Mastra Installation](https://mastra.ai/docs/getting-started/installation)
- [Mastra GitHub Releases](https://github.com/mastra-ai/mastra/releases)
