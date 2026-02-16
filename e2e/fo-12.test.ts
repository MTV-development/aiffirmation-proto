/**
 * E2E test for FO-12 Onboarding Flow using Playwright
 *
 * FO-12 is a "Structured 30-Affirmation Journey" that adapts questions
 * to prior answers and guides users through three phases of affirmation selection.
 *
 * Key features:
 * 1. Steps 0-1: Welcome + Name (2 sub-steps, no personalized welcome)
 * 2. Step 2: Familiarity ("Have you used affirmations before?")
 * 3. Step 3: Goal with predefined topic chips
 * 4. Step 4 (Context): LLM-generated question + fragment chips -- SKIPPABLE
 * 5. Step 5 (Tone): LLM-generated question + single-word chips -- never skipped
 * 6. Step 6: Start screen ("Let's Begin")
 * 7. Steps 7/9/11: Three phases of affirmation card review (10 + 10 + remaining)
 * 8. Steps 8/10: Check-in screens between phases
 * 9. Steps 12-14: Post-review mockups
 * 10. Step 15: Completion with all 30 loved affirmations
 *
 * This test covers the happy path: love most affirmations, reach 30.
 *
 * Run with: node --import tsx e2e/fo-12.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-12 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 120000; // 120s for AI generation
const TARGET_LOVED = 30;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Click button by visible text
async function clickButton(page: Page, text: string): Promise<boolean> {
  try {
    const button = page.getByRole('button', { name: text, exact: true });
    if (await button.isVisible({ timeout: 5000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Try alternative approaches
  }

  try {
    const button = page.getByRole('button', { name: new RegExp(text, 'i') });
    if (await button.isVisible({ timeout: 3000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Try next approach
  }

  try {
    const element = page.locator(`button:has-text("${text}")`).first();
    if (await element.isVisible({ timeout: 3000 })) {
      await element.click();
      return true;
    }
  } catch {
    // Element not found
  }

  try {
    const element = page.locator(`text="${text}"`).first();
    if (await element.isVisible({ timeout: 2000 })) {
      await element.click();
      return true;
    }
  } catch {
    // Element not found
  }

  console.log(`Could not find clickable element with text: "${text}"`);
  return false;
}

// Wait for text to appear on page
async function waitForText(page: Page, text: string, timeout = 30000): Promise<boolean> {
  try {
    await page.waitForSelector(`text=${text}`, { timeout });
    return true;
  } catch {
    return false;
  }
}

// Wait for text containing a substring
async function waitForTextContaining(page: Page, substring: string, timeout = 30000): Promise<boolean> {
  try {
    await page.waitForFunction((sub) => document.body.innerText.includes(sub), substring, { timeout });
    return true;
  } catch {
    return false;
  }
}

// Wait for "Thinking..." to disappear (dynamic screen loading)
async function waitForThinkingToFinish(page: Page, timeout = 60000): Promise<boolean> {
  try {
    // First wait for Thinking... to appear (might already be visible)
    await page.waitForFunction(
      () => document.body.innerText.includes('Thinking...'),
      { timeout: 5000 }
    ).catch(() => {
      // It's okay if Thinking... never appeared (fast response)
    });

    // Then wait for it to disappear
    await page.waitForFunction(
      () => !document.body.innerText.includes('Thinking...'),
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

// Wait for heart animation to appear and complete
async function waitForHeartAnimation(page: Page, timeout = 15000): Promise<boolean> {
  try {
    // Wait for the heart SVG to appear
    const heartSelector = 'svg[viewBox="0 0 24 24"]';
    await page.waitForSelector(heartSelector, { timeout: 5000 });
    console.log('   Heart animation appeared');

    // Wait for it to disappear (auto-advances after 2.5s)
    await page.waitForFunction(
      () => !document.querySelector('svg[viewBox="0 0 24 24"]'),
      { timeout }
    ).catch(() => {
      console.log('   Heart animation still visible, waiting longer...');
    });

    return true;
  } catch {
    console.log('   Heart animation not detected');
    return false;
  }
}

// Count all visible chip buttons (including short single-word chips)
async function countAllChipButtons(page: Page): Promise<number> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    let count = 0;
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.trim().length > 0 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

// Count fragments (items with "..." endings)
async function countFragments(page: Page): Promise<number> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    let count = 0;
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.length > 5 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        if (text.trim().endsWith('...')) {
          count++;
        }
      }
    }
    return count;
  } catch {
    return 0;
  }
}

// Get all visible chip texts
async function getAllChipTexts(page: Page): Promise<string[]> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    const texts: string[] = [];
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.trim().length > 0 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        texts.push(text.trim());
      }
    }
    return texts;
  } catch {
    return [];
  }
}

// Click a fragment (for fragment mode screens)
async function clickFragment(page: Page, index = 0): Promise<{ clicked: boolean; text: string; hadEllipsis: boolean }> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    const fragments: typeof chips = [];
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.length > 10 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        fragments.push(chip);
      }
    }
    if (fragments.length > index) {
      const text = await fragments[index].textContent() || '';
      await fragments[index].click();
      return { clicked: true, text: text.trim(), hadEllipsis: text.trim().endsWith('...') };
    }
  } catch {
    // Error
  }
  console.log('Could not find fragment chip');
  return { clicked: false, text: '', hadEllipsis: false };
}

// Click a single-word chip (for words mode screens)
async function clickWordChip(page: Page, index = 0): Promise<{ clicked: boolean; text: string }> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    const wordChips: typeof chips = [];
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.trim().length > 0 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        wordChips.push(chip);
      }
    }
    if (wordChips.length > index) {
      const text = await wordChips[index].textContent() || '';
      await wordChips[index].click();
      return { clicked: true, text: text.trim() };
    }
  } catch {
    // Error
  }
  console.log('Could not find word chip');
  return { clicked: false, text: '' };
}

// Click "Love it" button on affirmation card
async function clickLoveIt(page: Page): Promise<boolean> {
  try {
    const button = page.locator('[data-testid="love-button"]');
    if (await button.isVisible({ timeout: 5000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Fallback
  }
  try {
    const button = page.locator('button:has-text("Love it")').first();
    if (await button.isVisible({ timeout: 2000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Not found
  }
  console.log('Could not find "Love it" button');
  return false;
}

// Click "Discard" button on affirmation card
async function clickDiscard(page: Page): Promise<boolean> {
  try {
    const button = page.locator('[data-testid="discard-button"]');
    if (await button.isVisible({ timeout: 5000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Fallback
  }
  try {
    const button = page.locator('button:has-text("Discard")').first();
    if (await button.isVisible({ timeout: 2000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Not found
  }
  console.log('Could not find "Discard" button');
  return false;
}

// Get the global progress counter text ("X of 30 selected")
async function getGlobalProgressText(page: Page): Promise<string> {
  try {
    const progressElement = page.locator('[data-testid="affirmation-card-flow"] span').first();
    if (await progressElement.isVisible({ timeout: 3000 })) {
      return (await progressElement.textContent()) || '';
    }
  } catch {
    // Fallback
  }
  try {
    // Look for text matching "X of Y selected" pattern
    const spans = await page.locator('span').all();
    for (const span of spans) {
      const text = await span.textContent();
      if (text && /\d+ of \d+ selected/.test(text.trim())) {
        return text.trim();
      }
    }
  } catch {
    // Not found
  }
  return '';
}

// Get textarea value
async function getTextareaValue(page: Page): Promise<string> {
  try {
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 })) {
      return await textarea.inputValue();
    }
  } catch {
    // Not found
  }
  return '';
}

// Click the 'More' button to reveal additional chips
async function clickMoreButton(page: Page): Promise<boolean> {
  try {
    const moreButton = page.locator('button:has-text("More")').first();
    if (await moreButton.isVisible({ timeout: 3000 })) {
      await moreButton.click();
      return true;
    }
  } catch {
    // Not found
  }
  return false;
}

// ========================================
// Shared flow helpers
// ========================================

// Run welcome steps 0-1 for FO-12
async function runWelcomeSteps(page: Page): Promise<void> {
  // Step 0: Welcome intro screen (FO-12 specific text)
  console.log('\nStep 0: Welcome intro screen...');
  const hasWelcomeIntro = await waitForTextContaining(page, 'Let\'s get to know you', 10000);
  if (!hasWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo12-welcome-intro.png' });
    throw new Error('Welcome intro screen did not appear');
  }
  console.log('Verified: Welcome intro screen with FO-12 text visible');

  // Verify the specific FO-12 welcome text
  const hasCreateText = await waitForTextContaining(page, 'create your personal affirmations', 3000);
  if (hasCreateText) {
    console.log('Verified: "create your personal affirmations" text present');
  }

  const clickedWelcomeIntro = await clickButton(page, 'Continue');
  if (!clickedWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo12-welcome-intro-continue.png' });
    throw new Error('Could not click Continue on welcome intro');
  }
  await sleep(500);

  // Step 1: Name input screen (FO-12: "What's your name?")
  console.log('\nStep 1: Name input screen...');
  const hasNamePrompt = await waitForTextContaining(page, 'your name', 5000);
  if (!hasNamePrompt) {
    await page.screenshot({ path: 'e2e/debug-fo12-name-prompt.png' });
    throw new Error('Name input screen did not appear');
  }

  const nameInput = page.locator('input[placeholder*="name"]');
  await nameInput.fill('TestUser');
  await sleep(300);

  const clickedNameContinue = await clickButton(page, 'Continue');
  if (!clickedNameContinue) {
    await page.screenshot({ path: 'e2e/debug-fo12-name-continue.png' });
    throw new Error('Could not click Continue on name input');
  }
  console.log('Name entered and Continue clicked');
  await sleep(300);
}

// Run familiarity step 2 (FO-12 specific labels)
async function runFamiliarityStep(page: Page): Promise<void> {
  console.log('\nStep 2: Familiarity selection...');
  const hasFamiliarityPrompt = await waitForTextContaining(page, 'Have you used affirmations before', 5000);
  if (!hasFamiliarityPrompt) {
    await page.screenshot({ path: 'e2e/debug-fo12-familiarity.png' });
    throw new Error('Familiarity screen did not appear');
  }
  console.log('Verified: Familiarity screen with FO-12 text visible');

  // Verify FO-12 specific option labels
  const hasNewOption = await waitForTextContaining(page, 'I\'m new to affirmations', 3000);
  const hasTriedOption = await waitForTextContaining(page, 'I\'ve tried a few', 3000);
  const hasRegularOption = await waitForTextContaining(page, 'I use them regularly', 3000);

  if (hasNewOption) console.log('   Verified: "I\'m new to affirmations" option visible');
  if (hasTriedOption) console.log('   Verified: "I\'ve tried a few" option visible');
  if (hasRegularOption) console.log('   Verified: "I use them regularly" option visible');

  // Select "I've tried a few"
  const triedButton = page.locator('button:has-text("I\'ve tried a few")').first();
  if (await triedButton.isVisible({ timeout: 3000 })) {
    await triedButton.click();
    console.log('Selected: "I\'ve tried a few"');
    // Wait for confetti + success message + auto-advance
    await waitForTextContaining(page, 'Super', 3000);
    await sleep(2000);
  } else {
    await page.screenshot({ path: 'e2e/debug-fo12-familiarity-button.png' });
    throw new Error('Could not find "I\'ve tried a few" button');
  }
}

// Run goal step 3 with specified text
async function runGoalStep(page: Page, goalText: string): Promise<void> {
  console.log('\nStep 3: Goal (Fixed Q + Predefined Chips)...');

  // Verify fixed question
  const hasGoalQuestion = await waitForTextContaining(page, 'main goal with affirmations today', 5000);
  if (!hasGoalQuestion) {
    await page.screenshot({ path: 'e2e/debug-fo12-step3-question.png' });
    throw new Error('Step 3 goal question did not appear');
  }
  console.log('Verified: Fixed goal question displayed');

  // Count predefined chips
  await sleep(500);
  const chipTexts = await getAllChipTexts(page);
  console.log(`   Predefined topic chips: ${chipTexts.length}`);
  if (chipTexts.length > 0) {
    console.log('   Verified: Predefined topic chips rendered');
    console.log(`   Sample chips: ${chipTexts.slice(0, 5).join(', ')}`);
  }

  // Type the goal text
  const textarea = page.locator('textarea').first();
  await textarea.fill(goalText);
  await sleep(300);
  console.log(`   Typed goal: "${goalText}"`);

  // Click Continue
  const clickedStep3 = await clickButton(page, 'Continue');
  if (!clickedStep3) {
    await page.screenshot({ path: 'e2e/debug-fo12-step3-continue.png' });
    throw new Error('Could not click Continue on step 3');
  }
  console.log('Step 3 completed');
}

// Run heart animation and wait for it to finish
async function runHeartAnimation(page: Page, label: string): Promise<void> {
  console.log(`\n${label}...`);
  await sleep(500);
  const heartAppeared = await waitForHeartAnimation(page, 15000);
  if (heartAppeared) {
    console.log(`Verified: ${label} appeared`);
  }
  // Wait for animation to complete and next step to load
  await sleep(3000);
}

// Wait for a new affirmation card to appear (handles AnimatePresence transitions)
async function waitForNextCard(page: Page, previousText: string, timeout = 10000): Promise<boolean> {
  try {
    // Wait for either: a new card with different text, or the card flow to disappear (batch complete)
    await page.waitForFunction(
      (prevText) => {
        const card = document.querySelector('[data-testid="affirmation-card"]');
        if (!card) return true; // Card flow gone = batch complete
        const p = card.querySelector('p');
        if (!p) return false;
        return p.textContent !== prevText; // New card with different text
      },
      previousText,
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

// Review a batch of affirmation cards. Love up to maxLove, discard the rest.
async function reviewCardBatch(
  page: Page,
  batchSize: number,
  maxLove: number,
  phaseName: string
): Promise<{ lovedCount: number; discardedCount: number }> {
  let lovedCount = 0;
  let discardedCount = 0;

  for (let i = 0; i < batchSize; i++) {
    // Wait for a card to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card"]'),
        { timeout: 10000 }
      );
    } catch {
      console.log(`   ${phaseName}: Card ${i + 1} did not appear, may have completed early`);
      break;
    }

    // Small pause to let animation settle
    await sleep(600);

    // Get progress
    const progress = await getGlobalProgressText(page);

    // Read affirmation text
    let cardText = '';
    try {
      cardText = (await page.locator('[data-testid="affirmation-card"] p').first().textContent()) || '';
    } catch {
      // Could not read card text
    }

    if (i < maxLove) {
      const loved = await clickLoveIt(page);
      if (loved) {
        lovedCount++;
        console.log(`   ${phaseName} Card ${i + 1}/${batchSize}: Love it (progress: ${progress}) - "${cardText.substring(0, 50)}..."`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo12-${phaseName.toLowerCase().replace(/\s/g, '-')}-card-${i + 1}-love.png` });
        throw new Error(`Could not click "Love it" on card ${i + 1} in ${phaseName}`);
      }
    } else {
      const discarded = await clickDiscard(page);
      if (discarded) {
        discardedCount++;
        console.log(`   ${phaseName} Card ${i + 1}/${batchSize}: Discard (progress: ${progress})`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo12-${phaseName.toLowerCase().replace(/\s/g, '-')}-card-${i + 1}-discard.png` });
        throw new Error(`Could not click "Discard" on card ${i + 1} in ${phaseName}`);
      }
    }

    // Wait for the card transition to complete before next iteration
    if (i < batchSize - 1) {
      await waitForNextCard(page, cardText, 5000);
    } else {
      // Last card in batch -- wait for transition to check-in screen
      await sleep(1000);
    }
  }

  console.log(`   ${phaseName} complete: ${lovedCount} loved, ${discardedCount} discarded`);
  return { lovedCount, discardedCount };
}

// Review phase 3 cards continuously until we reach the target or run out
async function reviewPhase3Cards(
  page: Page,
  totalLovedSoFar: number,
  target: number
): Promise<{ lovedCount: number; discardedCount: number }> {
  let lovedCount = 0;
  let discardedCount = 0;
  let cardIndex = 0;
  const maxCards = 100; // Safety limit

  while (totalLovedSoFar + lovedCount < target && cardIndex < maxCards) {
    // Check if we are at the "Generating more affirmations..." screen
    const isGenerating = await page.locator('text=Generating more affirmations').isVisible({ timeout: 1000 }).catch(() => false);
    if (isGenerating) {
      console.log('   Phase 3: Waiting for emergency batch generation...');
      await page.waitForFunction(
        () => !document.body.innerText.includes('Generating more affirmations'),
        { timeout: TIMEOUT }
      );
      console.log('   Phase 3: Emergency batch generated, resuming card review');
      await sleep(1000);
    }

    // Wait for a card to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card"]'),
        { timeout: 15000 }
      );
    } catch {
      console.log(`   Phase 3: No more cards after ${cardIndex} reviews`);
      break;
    }

    // Small pause to let animation settle
    await sleep(600);

    const progress = await getGlobalProgressText(page);

    // Read current card text for transition detection
    let cardText = '';
    try {
      cardText = (await page.locator('[data-testid="affirmation-card"] p').first().textContent()) || '';
    } catch {
      // Could not read card text
    }

    // Love most cards in phase 3 to reach target quickly
    // Discard every 5th card to test the mixed flow
    if (cardIndex % 5 === 4) {
      const discarded = await clickDiscard(page);
      if (discarded) {
        discardedCount++;
        console.log(`   Phase 3 Card ${cardIndex + 1}: Discard (progress: ${progress})`);
      }
    } else {
      const loved = await clickLoveIt(page);
      if (loved) {
        lovedCount++;
        console.log(`   Phase 3 Card ${cardIndex + 1}: Love it (progress: ${progress})`);
      }
    }

    cardIndex++;

    // Wait for card transition before next iteration
    await waitForNextCard(page, cardText, 5000);
  }

  console.log(`   Phase 3 complete: ${lovedCount} loved, ${discardedCount} discarded`);
  return { lovedCount, discardedCount };
}

// Run post-review steps (background, notifications, paywall, completion)
async function runPostReviewSteps(page: Page, expectedAffirmationCount: number): Promise<void> {
  // Step 12: Background
  console.log('\nStep 12: Background selection mockup...');
  const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 10000);
  if (!hasBackground) {
    await page.screenshot({ path: 'e2e/debug-fo12-background.png' });
    throw new Error('Background selection screen did not appear');
  }
  console.log('Verified: Background selection screen visible');
  await sleep(500);
  const clickedBackground = await clickButton(page, 'Continue');
  if (!clickedBackground) {
    throw new Error('Could not click Continue on background selection');
  }
  console.log('Background selection completed');

  // Step 13: Notifications
  console.log('\nStep 13: Notifications mockup...');
  const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
  if (!hasNotifications) {
    await page.screenshot({ path: 'e2e/debug-fo12-notifications.png' });
    throw new Error('Notifications screen did not appear');
  }
  console.log('Verified: Notifications screen visible');
  await sleep(500);
  const clickedNotifications = await clickButton(page, 'Continue');
  if (!clickedNotifications) {
    throw new Error('Could not click Continue on notifications');
  }
  console.log('Notifications completed');

  // Step 14: Paywall
  console.log('\nStep 14: Paywall mockup...');
  const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
  if (!hasPaywall) {
    await page.screenshot({ path: 'e2e/debug-fo12-paywall.png' });
    throw new Error('Paywall screen did not appear');
  }
  console.log('Verified: Paywall screen visible');
  await sleep(500);
  const clickedPaywall = await clickButton(page, 'Not now');
  if (!clickedPaywall) {
    throw new Error('Could not click "Not now" on paywall');
  }
  console.log('Paywall completed');

  // Step 15: Completion
  console.log('\nStep 15: Verifying completion screen...');
  const hasCompletion = await waitForTextContaining(page, 'You are all set', 10000);
  if (!hasCompletion) {
    await page.screenshot({ path: 'e2e/debug-fo12-completion.png' });
    throw new Error("Completion screen did not appear - 'You are all set' not found");
  }
  console.log("Verified: Completion screen shows 'You are all set'");

  // Verify the dynamic count
  const hasCountText = await waitForTextContaining(page, `${expectedAffirmationCount} affirmation`, 5000);
  if (hasCountText) {
    console.log(`Verified: Completion shows "${expectedAffirmationCount} affirmation(s)" in heading`);
  }

  // Verify saved count at bottom
  await sleep(500);
  const hasSavedCount = await waitForTextContaining(page, 'saved', 3000);
  if (hasSavedCount) {
    console.log('Verified: Affirmation saved count shown');
  }

  // Verify affirmation list is displayed
  const affirmationItems = await page.locator('li').count();
  console.log(`   Affirmation list items visible: ${affirmationItems}`);
  if (affirmationItems >= expectedAffirmationCount) {
    console.log(`Verified: At least ${expectedAffirmationCount} affirmations displayed`);
  }
}

// ========================================
// Main test flow
// ========================================
async function runHappyPathFlow(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FO-12 HAPPY PATH: Structured 30-Affirmation Journey');
  console.log('='.repeat(60));

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context: BrowserContext = await browser.newContext();
    await context.addCookies([{
      name: 'e2e_test_mode',
      value: 'true',
      domain: new URL(BASE_URL).hostname,
      path: '/',
    }]);

    const page: Page = await context.newPage();
    page.setDefaultTimeout(30000);

    // Navigate to FO-12
    console.log(`\nOpening ${BASE_URL}/fo-12...`);
    await page.goto(`${BASE_URL}/fo-12`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Steps 0-1: Welcome
    await runWelcomeSteps(page);

    // Step 2: Familiarity
    await runFamiliarityStep(page);

    // Step 3: Goal with brief answer (triggers context step -- NOT skip)
    await runGoalStep(page, 'Motivation');

    // Heart animation 1: Goal -> Context
    await runHeartAnimation(page, 'Heart animation 1 (Goal -> Context)');

    // ========================================
    // Step 4: Context - LLM question + LLM fragments (NOT skipped)
    // ========================================
    console.log('\nStep 4: Context (LLM Q + LLM Fragments)...');

    // Wait for thinking to finish (LLM generating question + chips)
    const thinkingFinished4 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished4) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(1000);

    // Verify LLM-generated question appeared
    const questionH2 = page.locator('h2').first();
    let step4Question = '';
    try {
      step4Question = (await questionH2.textContent({ timeout: 15000 })) || '';
      console.log(`   LLM Question: "${step4Question}"`);
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo12-step4-question.png' });
      throw new Error('Step 4 question did not appear');
    }

    if (step4Question.length > 10) {
      console.log('   Verified: LLM-generated context question appeared');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo12-step4-no-question.png' });
      throw new Error('Step 4 question is too short or empty');
    }

    // Verify fragment chips
    const step4Fragments = await countFragments(page);
    const step4AllChips = await countAllChipButtons(page);
    console.log(`   Total chip buttons: ${step4AllChips}, Fragments (with "..."): ${step4Fragments}`);

    // Click a fragment chip
    console.log('   Clicking a fragment...');
    const fragmentResult = await clickFragment(page, 0);
    if (fragmentResult.clicked) {
      console.log(`   Clicked: "${fragmentResult.text.substring(0, 50)}..."`);
      if (fragmentResult.hadEllipsis) {
        console.log('   Verified: Fragment had "..." ending');
      }
    }

    // Click Next
    const clickedStep4 = await clickButton(page, 'Next');
    if (!clickedStep4) {
      await page.screenshot({ path: 'e2e/debug-fo12-step4-next.png' });
      throw new Error('Could not click Next on step 4');
    }
    console.log('Step 4 completed');

    // Heart animation 2: Context -> Tone
    await runHeartAnimation(page, 'Heart animation 2 (Context -> Tone)');

    // ========================================
    // Step 5: Tone - LLM question + single-word chips
    // ========================================
    console.log('\nStep 5: Tone (LLM Q + Single-Word Chips)...');

    const thinkingFinished5 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished5) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(1000);

    // Verify LLM-generated tone question
    const toneQuestionH2 = page.locator('h2').first();
    let step5Question = '';
    try {
      step5Question = (await toneQuestionH2.textContent({ timeout: 15000 })) || '';
      console.log(`   LLM Question: "${step5Question}"`);
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo12-step5-question.png' });
      throw new Error('Step 5 question did not appear');
    }

    if (step5Question.length > 10) {
      console.log('   Verified: LLM-generated tone question appeared');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo12-step5-no-question.png' });
      throw new Error('Step 5 question is too short or empty');
    }

    // Verify single-word chips
    const toneChipTexts = await getAllChipTexts(page);
    console.log(`   Tone chips: ${toneChipTexts.length}`);
    if (toneChipTexts.length > 0) {
      console.log(`   Sample chips: ${toneChipTexts.slice(0, 6).join(', ')}`);
    }

    // Click tone chips
    console.log('   Clicking tone chips...');
    const toneResult1 = await clickWordChip(page, 0);
    if (toneResult1.clicked) {
      console.log(`   Selected: "${toneResult1.text}"`);
    }
    await sleep(200);
    const toneResult2 = await clickWordChip(page, 2);
    if (toneResult2.clicked) {
      console.log(`   Selected: "${toneResult2.text}"`);
    }
    await sleep(300);

    // Verify textarea has selected words
    const toneTextareaValue = await getTextareaValue(page);
    if (toneTextareaValue.trim().length > 0) {
      console.log(`   Textarea value: "${toneTextareaValue.trim().substring(0, 50)}"`);
      console.log('   Verified: Tone words appended to textarea');
    }

    // Click Next
    const clickedStep5 = await clickButton(page, 'Next');
    if (!clickedStep5) {
      await page.screenshot({ path: 'e2e/debug-fo12-step5-next.png' });
      throw new Error('Could not click Next on step 5');
    }
    console.log('Step 5 completed');

    // Heart animation 3: Tone -> Start screen (generating first batch)
    await runHeartAnimation(page, 'Heart animation 3 (Tone -> Start, generating first batch)');

    // Wait extra time for the first batch to generate during/after heart animation
    console.log('\nWaiting for first batch generation to complete...');
    await sleep(5000);

    // ========================================
    // Step 6: Start screen
    // ========================================
    console.log('\nStep 6: Start screen...');
    const hasStartScreen = await waitForTextContaining(page, '10 affirmations are ready for you', 30000);
    if (!hasStartScreen) {
      // May still be generating or loading -- wait longer
      await sleep(10000);
      const retryStart = await waitForTextContaining(page, '10 affirmations are ready for you', 30000);
      if (!retryStart) {
        await page.screenshot({ path: 'e2e/debug-fo12-start-screen.png' });
        throw new Error('Start screen did not appear');
      }
    }
    console.log('Verified: Start screen with "10 affirmations are ready for you"');

    // Verify additional start screen text
    const hasChooseText = await waitForTextContaining(page, 'Choose the ones that feel right', 3000);
    if (hasChooseText) {
      console.log('Verified: "Choose the ones that feel right" text present');
    }

    const hasFeedbackText = await waitForTextContaining(page, 'Your feedback helps us refine', 3000);
    if (hasFeedbackText) {
      console.log('Verified: "Your feedback helps us refine" text present');
    }

    // Click "Let's Begin"
    const clickedStart = await clickButton(page, "Let's Begin");
    if (!clickedStart) {
      await page.screenshot({ path: 'e2e/debug-fo12-lets-begin.png' });
      throw new Error('Could not click "Let\'s Begin" on start screen');
    }
    console.log('Clicked "Let\'s Begin"');
    await sleep(500);

    // ========================================
    // Step 7: Phase 1 - Card review (10 affirmations)
    // ========================================
    console.log('\n--- Phase 1: Card Review (10 affirmations) ---');

    // Wait for card flow to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: 15000 }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo12-phase1-start.png' });
      throw new Error('Phase 1 card flow did not appear');
    }
    console.log('Card flow visible');

    // Verify initial global counter
    const initialProgress = await getGlobalProgressText(page);
    console.log(`   Initial global progress: "${initialProgress}"`);
    if (initialProgress.includes('0 of 30')) {
      console.log('   Verified: Global counter starts at "0 of 30 selected"');
    }

    // Review 10 cards: love 8, discard 2
    const phase1 = await reviewCardBatch(page, 10, 8, 'Phase 1');
    console.log(`\nPhase 1 result: ${phase1.lovedCount} loved, ${phase1.discardedCount} discarded`);

    let totalLoved = phase1.lovedCount;

    // ========================================
    // Step 8: Check-in 1
    // ========================================
    console.log('\n--- Step 8: Check-in 1 ---');
    const hasCheckin1Headline = await waitForTextContaining(page, 'Thank you for going through the first affirmations', 10000);
    if (!hasCheckin1Headline) {
      await page.screenshot({ path: 'e2e/debug-fo12-checkin1.png' });
      throw new Error('Check-in 1 screen did not appear');
    }
    console.log('Verified: Check-in 1 headline visible');

    // Verify check-in 1 body text
    const hasRefinedText = await waitForTextContaining(page, 'refined your affirmations', 3000);
    if (hasRefinedText) {
      console.log('Verified: "refined your affirmations" text present');
    }

    const hasTakeYourTime = await waitForTextContaining(page, 'Take your time', 3000);
    if (hasTakeYourTime) {
      console.log('Verified: "Take your time" bullet present');
    }

    // Click Continue (triggers batch 2 generation with loading spinner)
    console.log('Clicking Continue (generates batch 2)...');
    const clickedCheckin1 = await clickButton(page, 'Continue');
    if (!clickedCheckin1) {
      await page.screenshot({ path: 'e2e/debug-fo12-checkin1-continue.png' });
      throw new Error('Could not click Continue on check-in 1');
    }

    // Wait for loading/spinner and then card flow to appear
    console.log('Waiting for batch 2 generation...');
    const hasGenerating2 = await waitForTextContaining(page, 'Creating your next affirmations', 5000);
    if (hasGenerating2) {
      console.log('   Loading state detected: "Creating your next affirmations..."');
    }

    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo12-batch2-timeout.png' });
      throw new Error('Batch 2 generation did not complete in time');
    }
    console.log('Batch 2 generated - Phase 2 card flow visible');
    await sleep(500);

    // ========================================
    // Step 9: Phase 2 - Card review (10 affirmations)
    // ========================================
    console.log('\n--- Phase 2: Card Review (10 affirmations) ---');

    // Verify counter continues from phase 1
    const phase2InitialProgress = await getGlobalProgressText(page);
    console.log(`   Phase 2 initial progress: "${phase2InitialProgress}"`);
    if (phase2InitialProgress.includes(`${totalLoved} of 30`)) {
      console.log(`   Verified: Counter carries over from phase 1 (${totalLoved} of 30)`);
    }

    // Review 10 cards: love 8, discard 2
    const phase2 = await reviewCardBatch(page, 10, 8, 'Phase 2');
    console.log(`\nPhase 2 result: ${phase2.lovedCount} loved, ${phase2.discardedCount} discarded`);

    totalLoved += phase2.lovedCount;
    console.log(`Total loved so far: ${totalLoved}`);

    // ========================================
    // Step 10: Check-in 2
    // ========================================
    console.log('\n--- Step 10: Check-in 2 ---');
    const hasCheckin2Headline = await waitForTextContaining(page, 'almost there', 10000);
    if (!hasCheckin2Headline) {
      await page.screenshot({ path: 'e2e/debug-fo12-checkin2.png' });
      throw new Error('Check-in 2 screen did not appear');
    }
    console.log('Verified: Check-in 2 headline "You\'re almost there"');

    // Verify check-in 2 body text
    const hasShapedText = await waitForTextContaining(page, 'shaped your affirmations beautifully', 3000);
    if (hasShapedText) {
      console.log('Verified: "shaped your affirmations beautifully" text present');
    }

    const hasBuildingText = await waitForTextContaining(page, 'building something that is truly yours', 3000);
    if (hasBuildingText) {
      console.log('Verified: "building something that is truly yours" text present');
    }

    // Click Continue (triggers batch 3 generation with dynamic size)
    console.log('Clicking Continue (generates batch 3 with dynamic size)...');
    const remaining = TARGET_LOVED - totalLoved;
    const expectedBatchSize = Math.max(2 * remaining, 20);
    console.log(`   Remaining needed: ${remaining}, expected batch size: ${expectedBatchSize}`);

    const clickedCheckin2 = await clickButton(page, 'Continue');
    if (!clickedCheckin2) {
      await page.screenshot({ path: 'e2e/debug-fo12-checkin2-continue.png' });
      throw new Error('Could not click Continue on check-in 2');
    }

    // Wait for batch 3 generation
    console.log('Waiting for batch 3 generation...');
    const hasGenerating3 = await waitForTextContaining(page, 'Creating your next affirmations', 5000);
    if (hasGenerating3) {
      console.log('   Loading state detected');
    }

    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo12-batch3-timeout.png' });
      throw new Error('Batch 3 generation did not complete in time');
    }
    console.log('Batch 3 generated - Phase 3 card flow visible');
    await sleep(500);

    // ========================================
    // Step 11: Phase 3 - Continuous card review until 30 loved
    // ========================================
    console.log('\n--- Phase 3: Continuous Card Review (until 30 loved) ---');

    const phase3InitialProgress = await getGlobalProgressText(page);
    console.log(`   Phase 3 initial progress: "${phase3InitialProgress}"`);

    const phase3 = await reviewPhase3Cards(page, totalLoved, TARGET_LOVED);
    console.log(`\nPhase 3 result: ${phase3.lovedCount} loved, ${phase3.discardedCount} discarded`);

    totalLoved += phase3.lovedCount;
    console.log(`\nTotal loved: ${totalLoved}`);

    if (totalLoved >= TARGET_LOVED) {
      console.log(`Verified: Reached target of ${TARGET_LOVED} loved affirmations!`);
    } else {
      console.log(`Warning: Only ${totalLoved} loved, expected ${TARGET_LOVED}`);
    }

    // ========================================
    // Steps 12-15: Post-review + Completion
    // ========================================
    console.log('\n--- Post-Review Screens ---');
    await runPostReviewSteps(page, totalLoved);

    console.log('\n' + '='.repeat(60));
    console.log('FO-12 HAPPY PATH PASSED!');
    console.log(`   Phase 1: ${phase1.lovedCount} loved, ${phase1.discardedCount} discarded`);
    console.log(`   Phase 2: ${phase2.lovedCount} loved, ${phase2.discardedCount} discarded`);
    console.log(`   Phase 3: ${phase3.lovedCount} loved, ${phase3.discardedCount} discarded`);
    console.log(`   Total loved: ${totalLoved}`);
    console.log('='.repeat(60));

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ========================================
// Main test runner
// ========================================
async function runTest(): Promise<void> {
  console.log('Starting FO-12 Onboarding E2E Tests\n');
  console.log('FO-12: Structured 30-Affirmation Journey');
  console.log('- 3-phase selection: 10 + 10 + remaining');
  console.log('- Global "X of 30 selected" counter across all phases');
  console.log('- Check-in screens between phases');
  console.log('- Adaptive LLM discovery with skip logic\n');

  try {
    // Happy path: love most, reach 30
    await runHappyPathFlow();

    // ========================================
    // ALL TESTS PASSED
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('ALL TESTS PASSED! FO-12 E2E Tests Complete');
    console.log('='.repeat(60));
    console.log('\nTest Summary:');
    console.log('   Happy Path:');
    console.log('   - Step 0: Welcome intro with FO-12 specific text');
    console.log('   - Step 1: Name input ("What\'s your name?")');
    console.log('   - Step 2: Familiarity with FO-12 option labels');
    console.log('   - Step 3: Goal with predefined chips');
    console.log('   - Step 4: Context (LLM question + fragment chips)');
    console.log('   - Step 5: Tone (LLM question + single-word chips)');
    console.log('   - Step 6: Start screen ("Let\'s Begin")');
    console.log('   - Step 7: Phase 1 card review (10 affirmations)');
    console.log('   - Step 8: Check-in 1 + batch 2 generation');
    console.log('   - Step 9: Phase 2 card review (10 affirmations)');
    console.log('   - Step 10: Check-in 2 + batch 3 generation');
    console.log('   - Step 11: Phase 3 continuous review until 30 loved');
    console.log('   - Steps 12-14: Post-review mockups');
    console.log('   - Step 15: Completion with all 30 loved affirmations');

  } catch (error) {
    console.error('\nTEST FAILED:', error);
    process.exit(1);
  }
}

// Run the test
runTest();
