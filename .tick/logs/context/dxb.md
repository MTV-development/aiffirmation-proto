# Epic Context: dxb - fo-07: E2E Testing

## Relevant Code
- `e2e/fo-06.test.ts` - Reference for E2E test pattern
- `docs/current/e2e-testing.md` - E2E testing documentation

## Files to Create
- `e2e/fo-07.test.ts` - Happy path E2E test

## Test Flow
1. Navigate to /fo-07 (with auth bypass via cookie)
2. Verify NO progress bar
3. Enter name, click Continue
4. Select topics on intro screen (verify new H1/H2 copy)
5. Loop through dynamic screens (verify heart animation between screens)
6. Wait for 20 affirmations to generate
7. Verify summary appears at top
8. Rate all 20 cards (click thumbs up or down on each)
9. Verify Continue button becomes enabled
10. Click Continue
11. Navigate through mockups (background, notifications, paywall)
12. Verify completion screen

## Key Verification Points
- No progress bar at any step
- Heart animation appears (not confetti)
- 20 affirmation cards render
- Continue button disabled until all 20 rated
- Liked affirmations appear on completion screen

## Testing
- Run with: `node --import tsx e2e/fo-07.test.ts`
- Prerequisites: npm run db:seed, dev server running

## Conventions
- Use Playwright for browser automation
- Auth bypass cookie: `aiffirmation_auth=test-user`
- Wait for AI generation with appropriate timeouts
- Log progress for debugging
