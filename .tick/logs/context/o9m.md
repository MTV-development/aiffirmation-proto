# Epic Context: o9m - FO-05: Environment validation

## Relevant Code
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `e2e/fo-04.test.ts` - Existing E2E test to verify passes

## Architecture
- Next.js 15 App Router application
- Mastra agents for AI functionality
- Playwright for E2E testing

## Testing
- Build command: `npm run build`
- Lint command: `npm run lint`
- E2E test command: `node --import tsx e2e/fo-04.test.ts`
- Dev server must be running for E2E tests: `npm run dev`

## Conventions
- Use `node --import tsx` instead of `npx tsx` for better output on Windows Git Bash
- E2E tests use cookie-based auth bypass: `e2e_test_mode: 'true'`
