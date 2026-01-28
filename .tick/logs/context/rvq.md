# Epic Context: rvq - fo-08: E2E Testing and Final Validation

## Relevant Code

- `e2e/fo-07.test.ts` - Source for E2E test structure
- `e2e/fo-06.test.ts` - Additional reference for fragment testing
- `docs/current/e2e-testing.md` - E2E testing patterns and conventions

## Architecture

- E2E tests use Playwright
- Run with: `node --import tsx e2e/fo-08.test.ts`
- Tests navigate through full user flow
- Verify UI elements, interactions, and data flow

## Test Requirements for FO-08

1. **Fragment display:**
   - 8 fragments visible immediately (no "Inspiration" link)
   - "More" button reveals 15 additional fragments

2. **Fragment interaction:**
   - Click removes "...", appends to textarea, focuses cursor

3. **No progress bar:** Verify absence at all steps

4. **Heart animation:** Appears between dynamic screens

5. **Affirmation review:**
   - Thumbs up/down buttons work
   - All 10 must be rated before Continue enables

6. **Full flow verification:**
   - Welcome → Name → Familiarity → Topics → Dynamic screens → Review → Mockups → Completion

## Running Tests

```bash
# Seed database first
npm run db:seed

# Run FO-08 test
node --import tsx e2e/fo-08.test.ts

# Regression tests
node --import tsx e2e/fo-06.test.ts
node --import tsx e2e/fo-07.test.ts
```

## Testing

- Verify test file exists with `test -f`
- Grep for 'fo-08' and 'fragment' in test file
- Test must exit with "TEST PASSED"

## Conventions

- Follow existing test structure from fo-07.test.ts
- Use data-testid attributes for element selection
- Include descriptive test step logging
