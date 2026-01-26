# Epic Context: syl - FO-06: E2E Testing

## Relevant Code
- `e2e/fo-05.test.ts` - Reference E2E test (940 lines)
- `docs/current/e2e-testing.md` - E2E testing patterns

## Architecture
- Tests use Playwright with Chromium
- Auth bypassed via `e2e_test_mode` cookie
- Run with: `node --import tsx e2e/fo-06.test.ts`
- Dev server must be running: `npm run dev`

## Key FO-06 Test Assertions

1. **No progress bar** - Verify no element matching progress bar exists at any step
2. **Simplified flow start** - Name input directly, no welcome/familiarity/topic
3. **Fixed opening question** - "What's going on in your life right now that made you seek out affirmations?"
4. **No reflective statement** - Question only on each dynamic screen
5. **Fragment interaction** - Same as FO-05
6. **Complete flow** - Through completion screen

## Test Flow for FO-06

1. Navigate to /fo-06
2. Verify NO progress bar
3. Verify name input screen (not welcome)
4. Enter name "TestUser", click Continue
5. Verify exact opening question text
6. Click Inspiration, select fragment, click Next
7. Loop through dynamic screens (2-5)
8. Click "Create My Affirmations"
9. Swipe affirmations (keep 5, skip 5)
10. Navigate through mockups
11. Verify completion screen

## Key Differences from FO-05 Test

- Remove welcome/familiarity/topic steps
- Add progress bar absence check
- Verify fixed opening question text exactly
- No reflective statement verification (FO-06 doesn't have them)
- Simpler initial flow (just name input)
