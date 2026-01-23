# Epic Context: ec4 - FO-04: E2E Testing

## Relevant Code
- `e2e/fo-03.test.ts` - Reference test to adapt
- `docs/current/e2e-testing.md` - Testing documentation
- `app/fo-04/` - The implementation to test

## Architecture
- Playwright for browser automation
- Test bypasses auth via e2e_test_mode cookie
- Helper functions: clickButton, waitForText, sleep

## Test Coverage Required (from spec)
1. Full navigation through initial screens (Steps 0-4)
2. Dynamic detail-gathering flow:
   - Verify reflective statement and question appear
   - Test chip selection (clicking adds chip to input)
   - Test chip removal
   - Test free-text input
   - Verify "Next" disabled until input
   - Test "Show more" expansion
3. Verify 2-5 dynamic screens flow
4. Transition to affirmation generation
5. Swipe phase
6. Completion screen

## Testing
- Run: `node --import tsx e2e/fo-04.test.ts`
- Dev server must be running: `npm run dev`
- Use headless: false for debugging

## Conventions
- Increase timeouts for AI generation (60s)
- Take screenshots on failure
- Use descriptive test step logging
