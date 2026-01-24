# Epic Context: oub - FO-05 Summary: E2E Testing

## Relevant Code
- `e2e/fo-05.test.ts` - E2E test file (~900 lines)
- `app/fo-05/components/step-completion.tsx` - Component being tested

## Architecture
- Playwright for E2E testing
- Cookie-based auth bypass: `e2e_test_mode: 'true'`
- Helper functions: clickButton, waitForText, waitForTextContaining

## Testing Commands
- Run test: `node --import tsx e2e/fo-05.test.ts`
- Dev server must be running: `npm run dev`
- Use headless: false for debugging

## Conventions
- Use `node --import tsx` not `npx tsx`
- 60s timeout for AI generation
- Take screenshots on failure for debugging
- Step 12 is the completion screen verification
