# Epic Context: wjp - FO-05: E2E Testing

## Relevant Code
- `e2e/fo-04.test.ts` - Reference E2E test (~740 lines)
- `docs/current/e2e-testing.md` - Testing documentation
- `app/fo-05/` - FO-05 implementation to test

## Architecture
- Playwright for E2E testing
- Cookie-based auth bypass: `e2e_test_mode: 'true'`
- Helper functions: clickButton, waitForText, sleep

## Key Test Scenarios for FO-05
- Full flow from overview to affirmation
- Click "Inspiration" link to show 5 fragments
- Click a fragment chip (verify it appends to input)
- Click "Continue typing" button
- Verify chips become active again
- Click "More Inspiration" to show 8 more fragments
- Verify "More Inspiration" link disappears
- Verify Continue/Next button is disabled until after "Continue typing"
- Test info page at /fo-05/info

## Testing Commands
- Run test: `node --import tsx e2e/fo-05.test.ts`
- Dev server must be running: `npm run dev`
- Use headless: false for debugging

## Conventions
- Use `node --import tsx` not `npx tsx`
- 60s timeout for AI generation
- Take screenshots on failure for debugging
