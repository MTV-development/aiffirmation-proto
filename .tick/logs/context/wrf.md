# Epic Context: [wrf] FO-03 E2E Testing

## Relevant Code

### Test Reference Pattern
- **e2e/fo-02.test.ts** - Reference E2E test (507 lines)
  - Uses Playwright with `chromium.launch({ headless: false })`
  - Sets `e2e_test_mode` cookie to bypass auth
  - Helper functions: `clickButton()`, `waitForText()`, `waitForTextContaining()`, `sleep()`
  - Swipe simulation via `page.keyboard.press('ArrowDown'/'ArrowUp')`
  - Uses `page.screenshot()` for debugging failed assertions

### FO-03 Implementation Files
- **app/fo-03/page.tsx** - Entry point, renders `<FOExperience />`
- **app/fo-03/components/fo-experience.tsx** - Main state manager (619 lines)
  - State: `OnboardingState` interface with steps 0-13
  - Key state fields: `currentStep`, `name`, `familiarity`, `topics`, `situation`, `feelings`, `whatHelps`, `approvedAffirmations`, `currentBatch`, `isGenerating`, `hasSwipedOnce`
  - `generateBatch()` calls server action for AI affirmations

### Step Components (under app/fo-03/components/)
| Step | Component | Key UI Elements |
|------|-----------|-----------------|
| 0-2 | step-welcome.tsx | "Continue" / "Start" buttons, name input |
| 3 | step-familiarity.tsx | "New"/"Some experience"/"Very familiar" buttons, auto-advances after confetti |
| 4 | step-topics.tsx | Toggleable chips, "Continue"/"Not sure" buttons, confetti on continue |
| 5-7 | text-with-chips.tsx | Textarea + chips, "Continue"/"Not sure" buttons |
| 8-9 | step-checkpoint.tsx | Checkpoint variants: `batch1` ("Continue"/"I am good"), `subsequent` ("Yes, please"/"No, continue"), `transition` (Continue only) |
| 10 | step-background.tsx | Grid of gradients, "Continue" button |
| 11 | step-notifications.tsx | Frequency options, "Continue" button |
| 12 | step-paywall.tsx | "Try free for 3 days"/"Not now" buttons |
| 13 | step-completion.tsx | Shows affirmation list with ✦ markers, "{N} affirmation(s) saved" text |

### Swipe Phase
- **swipe-phase.tsx** - Card swiping with keyboard support
  - Shows "Affirmation {index} of {total}" header
  - ArrowDown = keep (approve), ArrowUp = discard (skip)
  - Toast feedback: "Successfully saved" / "Discarded"
  - Intro message before first swipe, feedback message after

## Architecture Notes

### Step Flow
```
0: Welcome → Continue
1: Name input → Continue (needs name.trim())
2: Personalized welcome → Start
3: Familiarity → Select option → confetti + auto-advance (1.5s)
4: Topics → Select chips → Continue → confetti + auto-advance (1.5s)
5: Situation → text/chips → Continue → heart animation → auto-advance
6: Feelings → text/chips → Continue → heart animation → auto-advance
7: What helps → text/chips → Continue → triggers batch 1 generation
8-9: Swipe phase (batches, checkpoints)
10-12: Mockup screens (Continue through each)
13: Completion with affirmation list
```

### Swipe Batch Logic (Steps 8-9)
1. After step 7, `generateBatch(1)` is called
2. Loading state shows spinner with "Creating your personal affirmations..."
3. Swipe 10 cards via ArrowDown/ArrowUp
4. Checkpoint after batch 1 (`variant="batch1"`): Continue → batch 2, or "I am good" → transition
5. Checkpoint after batch 2+ (`variant="subsequent"`): "Yes, please" → next batch, or "No, continue" → transition
6. Max 3 batches, then transition screen → step 10

### Key Text Patterns for Assertions
- Step 0: "The way you speak to yourself becomes the way you live!"
- Step 1: "What should we call you?"
- Step 2: "Welcome, {name}!" 
- Step 3: "How familiar are you with affirmations"
- Step 4: "What do you want affirmations to help you with"
- Step 5: "What has been going on lately"
- Step 6: "What are you feeling right now"
- Step 7: "What normally makes you feel good"
- Swipe: "Affirmation 1 of 10"
- Checkpoint batch1: "Perfect, {name}!" + "I am good with the affirmations I chose"
- Checkpoint subsequent: "Great job, {name}!" + "Yes, please"
- Step 10: "Make your affirmations look beautiful"
- Step 11: "Set up reminders"
- Step 12: "More support, whenever you want"
- Step 13: "You are all set, {name}" + "{N} affirmation(s) saved"

## Testing Patterns

### E2E Test Structure
```typescript
import { chromium, Browser, Page, BrowserContext } from 'playwright';
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 60000; // for AI generation

async function runTest(): Promise<void> {
  browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  await context.addCookies([{
    name: 'e2e_test_mode', value: 'true',
    domain: new URL(BASE_URL).hostname, path: '/'
  }]);
  const page = await context.newPage();
  // ... test steps
}
```

### Common Helpers from fo-02
- `clickButton(page, text)` - Tries multiple selectors (exact, regex, locator)
- `waitForText(page, text, timeout)` - `page.waitForSelector(\`text=${text}\`)`
- `waitForTextContaining(page, substring, timeout)` - Uses `page.waitForFunction`
- `sleep(ms)` - Simple timeout wrapper

### Animation Timing Considerations
- Confetti animations (steps 3, 4): 1.5s auto-advance
- Heart animations (steps 5, 6): auto-advance on completion
- Swipe animation: ~300ms per card

## Conventions

### Selector Patterns
- Buttons: `page.getByRole('button', { name: text, exact: true })`
- Text input: `page.locator('input[placeholder*="first name"]')`
- Textarea: `page.locator('textarea[placeholder*="..."]')`
- Chips: Click button with exact text

### Error Handling
- Screenshot on failure: `page.screenshot({ path: 'e2e/debug-fo03-step{N}.png' })`
- Descriptive error messages: `throw new Error('Step X did not appear')`
- `try/finally` for browser cleanup

### Timeouts
- Default page timeout: 30s
- AI generation: 60s
- Text visibility: 5-10s
- Animation waits: sleep(300-500ms) between actions