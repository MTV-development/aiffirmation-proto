# Epic Context: zzw - mastra-1-0: E2E testing

## Relevant Code
- `e2e/fo-05.test.ts` - Main E2E test file
- `app/fo-05/**` - FO-05 UI components
- `src/mastra/agents/fo-05/**` - FO-05 agents

## Testing
- Dev server: `npm run dev` (runs on localhost:3000)
- E2E test: `node --import tsx e2e/fo-05.test.ts`
- Prerequisite: `npm run db:seed` (populate KV store)

## Previous Findings
- Packages upgraded to stable (1.0.0-1.0.4)
- Fixed resumeSchema breaking change in workflow steps
- All APIs verified compatible

## What E2E Test Covers
- FO-05 full onboarding flow
- Dynamic AI-generated screens
- Affirmation generation and swiping
- Summary generation
- All 19 agents work correctly
