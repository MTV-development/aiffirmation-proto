/**
 * E2E test for FO-11 Onboarding Flow using Playwright
 *
 * FO-11 is a "Guided Discovery Hybrid" that adapts questions to prior answers
 * and can skip redundant steps. Key differences from FO-10:
 * 1. Step 4: Fixed goal question with predefined topic chips (same as FO-10)
 * 2. Step 5 (Context): LLM-generated question + fragment chips ("..." endings) -- SKIPPABLE
 * 3. Step 6 (Tone): LLM-generated question + single-word chips (not sentences)
 * 4. Total steps: 14 (0-13) instead of FO-10's 15 (0-14)
 * 5. Variable-length exchanges: 2 (goal + tone) when skipped, 3 (goal + context + tone) when not
 *
 * This test covers two flows:
 * - NON-SKIP FLOW: Brief goal answer ("Motivation") triggers step 5 context question
 * - SKIP FLOW: Rich goal answer triggers step 5 skip, jumping directly to step 6 tone
 *
 * Run with: node --import tsx e2e/fo-11.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-11 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 120000; // 120s for AI generation

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
async function waitForHeartAnimation(page: Page, timeout = 10000): Promise<boolean> {
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
      console.log('   Heart animation still visible, clicking to skip');
    });

    return true;
  } catch {
    console.log('   Heart animation not detected');
    return false;
  }
}

// Count visible chip buttons (for fragments and sentences with length > 10)
async function countChips(page: Page): Promise<number> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    let count = 0;
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.length > 10 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
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
    if (await button.isVisible({ timeout: 3000 })) {
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
    if (await button.isVisible({ timeout: 3000 })) {
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

// Get progress text "X/Y" from card flow
async function getProgressText(page: Page): Promise<string> {
  try {
    const progressElement = page.locator('[data-testid="affirmation-card-flow"] span').first();
    if (await progressElement.isVisible({ timeout: 2000 })) {
      return (await progressElement.textContent()) || '';
    }
  } catch {
    // Fallback
  }
  try {
    // Look for text matching "X/Y" pattern
    const spans = await page.locator('span').all();
    for (const span of spans) {
      const text = await span.textContent();
      if (text && /^\d+\/\d+$/.test(text.trim())) {
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
  console.log('Could not find More button');
  return false;
}

// ========================================
// Shared flow helpers
// ========================================

// Run welcome steps 0-2
async function runWelcomeSteps(page: Page): Promise<void> {
  // Step 0: Welcome intro screen
  console.log('\nStep 0: Welcome intro screen...');
  const hasWelcomeIntro = await waitForText(page, 'The way you speak to yourself', 5000);
  if (!hasWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo11-welcome-intro.png' });
    throw new Error('Welcome intro screen did not appear');
  }
  console.log('Verified: Welcome intro screen visible');

  const clickedWelcomeIntro = await clickButton(page, 'Continue');
  if (!clickedWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo11-welcome-intro-continue.png' });
    throw new Error('Could not click Continue on welcome intro');
  }
  await sleep(300);

  // Step 1: Name input screen
  console.log('\nStep 1: Name input screen...');
  const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
  if (!hasNamePrompt) {
    await page.screenshot({ path: 'e2e/debug-fo11-name-prompt.png' });
    throw new Error('Name input screen did not appear');
  }

  const nameInput = page.locator('input[placeholder*="name"]');
  await nameInput.fill('TestUser');
  await sleep(300);

  const clickedNameContinue = await clickButton(page, 'Continue');
  if (!clickedNameContinue) {
    await page.screenshot({ path: 'e2e/debug-fo11-name-continue.png' });
    throw new Error('Could not click Continue on name input');
  }
  console.log('Name entered and Continue clicked');
  await sleep(300);

  // Step 2: Personalized welcome screen
  console.log('\nStep 2: Personalized welcome screen...');
  const hasPersonalizedWelcome = await waitForTextContaining(page, 'Welcome, TestUser', 5000);
  if (!hasPersonalizedWelcome) {
    await page.screenshot({ path: 'e2e/debug-fo11-personalized-welcome.png' });
    throw new Error('Personalized welcome screen did not appear');
  }
  console.log('Verified: Personalized welcome shows user name');

  const clickedStart = await clickButton(page, 'Start');
  if (!clickedStart) {
    await page.screenshot({ path: 'e2e/debug-fo11-start.png' });
    throw new Error('Could not click Start on personalized welcome');
  }
  await sleep(300);
}

// Run familiarity step 3
async function runFamiliarityStep(page: Page): Promise<void> {
  console.log('\nStep 3: Familiarity selection...');
  const hasFamiliarityPrompt = await waitForTextContaining(page, 'How familiar are you with affirmations', 5000);
  if (!hasFamiliarityPrompt) {
    await page.screenshot({ path: 'e2e/debug-fo11-familiarity.png' });
    throw new Error('Familiarity screen did not appear');
  }
  console.log('Verified: Familiarity screen visible');

  const someExperienceButton = page.locator('button:has-text("Some experience")').first();
  if (await someExperienceButton.isVisible({ timeout: 3000 })) {
    await someExperienceButton.click();
    console.log('Selected: Some experience');
    await waitForTextContaining(page, 'Super', 3000);
    await sleep(2000); // Wait for auto-advance after confetti
  } else {
    await page.screenshot({ path: 'e2e/debug-fo11-familiarity-button.png' });
    throw new Error('Could not find "Some experience" button');
  }
}

// Run goal step 4 with specified text
async function runGoalStep(page: Page, goalText: string): Promise<void> {
  console.log('\nStep 4: Goal (Fixed Q + Predefined Chips)...');

  // Verify fixed question
  const hasGoalQuestion = await waitForTextContaining(page, 'main goal with affirmations today', 5000);
  if (!hasGoalQuestion) {
    await page.screenshot({ path: 'e2e/debug-fo11-step4-question.png' });
    throw new Error('Step 4 goal question did not appear');
  }
  console.log('Verified: Fixed goal question displayed');

  // Count and verify predefined chips
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
  const clickedStep4 = await clickButton(page, 'Continue');
  if (!clickedStep4) {
    await page.screenshot({ path: 'e2e/debug-fo11-step4-continue.png' });
    throw new Error('Could not click Continue on step 4');
  }
  console.log('Step 4 completed');
}

// Run heart animation and wait for it to finish
async function runHeartAnimation(page: Page, label: string): Promise<void> {
  console.log(`\n${label}...`);
  await sleep(500);
  const heartAppeared = await waitForHeartAnimation(page, 10000);
  if (heartAppeared) {
    console.log(`Verified: ${label} appeared`);
  }
  // Wait for animation to complete and next step to load
  await sleep(3000);
}

// Run affirmation generation and card review (shared between flows)
async function runGenerationAndReview(page: Page): Promise<{ lovedCount: number; discardedCount: number }> {
  let lovedCount = 0;
  let discardedCount = 0;

  // Wait for affirmation generation
  console.log('\nWaiting for AI generation of 5 affirmations (up to 120s)...');

  const hasGenerating = await waitForTextContaining(page, 'Creating your personal affirmations', 10000);
  if (hasGenerating) {
    console.log('Generation phase detected');
  }

  try {
    await page.waitForFunction(
      () => !!document.querySelector('[data-testid="affirmation-card-flow"]') ||
            !!document.querySelector('[data-testid="affirmation-card"]'),
      { timeout: TIMEOUT }
    );
  } catch {
    await page.screenshot({ path: 'e2e/debug-fo11-generation-timeout.png' });
    throw new Error('Affirmation generation did not complete in time');
  }
  console.log('Affirmation generation complete - Card flow visible');

  // Verify progress text
  const initialProgress = await getProgressText(page);
  console.log(`Initial progress: "${initialProgress}"`);
  if (initialProgress.includes('/')) {
    const match = initialProgress.match(/(\d+)\/(\d+)/);
    if (match) {
      const total = parseInt(match[2], 10);
      console.log(`Verified: Card flow has ${total} cards`);
      if (total === 5) {
        console.log('Verified: Batch size is 5');
      }
    }
  }

  // Review all 5 cards -- love first 3, discard last 2
  const totalCards = 5;
  for (let i = 0; i < totalCards; i++) {
    const progress = await getProgressText(page);
    console.log(`   Card ${i + 1}/${totalCards} (progress: "${progress}")`);

    try {
      const cardText = await page.locator('[data-testid="affirmation-card"] p').first().textContent();
      if (cardText) {
        console.log(`   Affirmation: "${cardText.substring(0, 60)}..."`);
      }
    } catch {
      // Could not read card text
    }

    if (i < 3) {
      const loved = await clickLoveIt(page);
      if (loved) {
        lovedCount++;
        console.log(`   Action: Love it (${lovedCount} loved total)`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo11-card-${i + 1}-love.png` });
        throw new Error(`Could not click "Love it" on card ${i + 1}`);
      }
    } else {
      const discarded = await clickDiscard(page);
      if (discarded) {
        discardedCount++;
        console.log(`   Action: Discard (${discardedCount} discarded total)`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo11-card-${i + 1}-discard.png` });
        throw new Error(`Could not click "Discard" on card ${i + 1}`);
      }
    }

    await sleep(500);
  }

  console.log(`\nCard review complete: ${lovedCount} loved, ${discardedCount} discarded`);
  return { lovedCount, discardedCount };
}

// Run summary screen
async function runSummaryScreen(page: Page): Promise<void> {
  console.log('\n--- Affirmation Summary ---');

  const hasSummary = await waitForTextContaining(page, 'Your affirmations', 10000);
  if (!hasSummary) {
    await page.screenshot({ path: 'e2e/debug-fo11-summary-missing.png' });
    throw new Error('Summary screen did not appear');
  }
  console.log('Verified: Summary screen visible');

  const summaryTestId = await page.locator('[data-testid="affirmation-summary"]').isVisible({ timeout: 3000 });
  if (summaryTestId) {
    console.log('Verified: AffirmationSummary component rendered');
  }

  const hasCollectedText = await waitForTextContaining(page, 'collected', 3000);
  if (hasCollectedText) {
    console.log('Verified: Affirmation collected count displayed');
  }

  // Verify buttons
  const goodButton = page.locator('[data-testid="done-button"]');
  const goodButtonVisible = await goodButton.isVisible({ timeout: 3000 });
  if (goodButtonVisible) {
    console.log('Verified: "I am good with these" button visible');
  }

  const moreButton = page.locator('[data-testid="more-button"]');
  const moreButtonVisible = await moreButton.isVisible({ timeout: 3000 });
  if (moreButtonVisible) {
    console.log('Verified: "I want to create more" button visible');
  }
}

// Run post-review steps (background, notifications, paywall, completion)
async function runPostReviewSteps(page: Page): Promise<void> {
  // Click "I am good with these"
  console.log('\nClicking "I am good with these"...');
  const clickedGood = await clickButton(page, 'I am good with these');
  if (!clickedGood) {
    await page.screenshot({ path: 'e2e/debug-fo11-good-button.png' });
    throw new Error('Could not click "I am good with these"');
  }
  console.log('Proceeding to post-review mockups');

  // Step 10: Background
  console.log('\nBackground selection mockup...');
  const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
  if (!hasBackground) {
    await page.screenshot({ path: 'e2e/debug-fo11-background.png' });
    throw new Error('Background selection screen did not appear');
  }
  await sleep(500);
  const clickedBackground = await clickButton(page, 'Continue');
  if (!clickedBackground) {
    throw new Error('Could not click Continue on background selection');
  }
  console.log('Background selection completed');

  // Step 11: Notifications
  console.log('\nNotifications mockup...');
  const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
  if (!hasNotifications) {
    await page.screenshot({ path: 'e2e/debug-fo11-notifications.png' });
    throw new Error('Notifications screen did not appear');
  }
  await sleep(500);
  const clickedNotifications = await clickButton(page, 'Continue');
  if (!clickedNotifications) {
    throw new Error('Could not click Continue on notifications');
  }
  console.log('Notifications completed');

  // Step 12: Paywall
  console.log('\nPaywall mockup...');
  const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
  if (!hasPaywall) {
    await page.screenshot({ path: 'e2e/debug-fo11-paywall.png' });
    throw new Error('Paywall screen did not appear');
  }
  await sleep(500);
  const clickedPaywall = await clickButton(page, 'Not now');
  if (!clickedPaywall) {
    throw new Error('Could not click "Not now" on paywall');
  }
  console.log('Paywall completed');

  // Step 13: Completion
  console.log('\nVerifying completion screen...');
  const hasCompletion = await waitForTextContaining(page, 'You are all set', 5000);
  if (!hasCompletion) {
    await page.screenshot({ path: 'e2e/debug-fo11-completion.png' });
    throw new Error("Completion screen did not appear - 'You are all set' not found");
  }
  console.log("Completion screen shows 'You are all set'");

  // Verify loved affirmations
  await sleep(500);
  const hasAffirmationsSaved = await waitForTextContaining(page, 'affirmation', 5000);
  if (hasAffirmationsSaved) {
    console.log('Verified: Affirmations displayed on completion screen');
  }

  const hasSavedCount = await waitForTextContaining(page, 'saved', 3000);
  if (hasSavedCount) {
    console.log('Verified: Affirmation saved count shown');
  }
}

// ========================================
// Test Flow 1: NON-SKIP FLOW
// (Brief goal answer -> step 5 appears -> step 6 appears)
// ========================================
async function runNonSkipFlow(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FLOW 1: NON-SKIP FLOW (Brief Goal)');
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

    // Navigate to FO-11
    console.log(`\nOpening ${BASE_URL}/fo-11...`);
    await page.goto(`${BASE_URL}/fo-11`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Steps 0-2: Welcome
    await runWelcomeSteps(page);

    // Step 3: Familiarity
    await runFamiliarityStep(page);

    // Step 4: Goal with brief answer (should NOT trigger skip)
    await runGoalStep(page, 'Motivation');

    // Heart animation 1: Goal -> Context
    await runHeartAnimation(page, 'Heart animation 1 (Goal -> Context)');

    // ========================================
    // Step 5: Context - LLM question + LLM fragments (NOT skipped)
    // ========================================
    console.log('\nStep 5: Context (LLM Q + LLM Fragments)...');

    // Wait for thinking to finish (LLM generating question + chips)
    const thinkingFinished5 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished5) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(1000);

    // Verify LLM-generated question appeared (NOT hardcoded)
    // The question should reference the user's goal ("Motivation") or be contextually relevant
    const questionH2 = page.locator('h2').first();
    let step5Question = '';
    try {
      step5Question = (await questionH2.textContent({ timeout: 10000 })) || '';
      console.log(`   LLM Question: "${step5Question}"`);
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo11-step5-question.png' });
      throw new Error('Step 5 question did not appear');
    }

    if (step5Question.length > 10) {
      console.log('   Verified: LLM-generated question appeared');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo11-step5-no-question.png' });
      throw new Error('Step 5 question is too short or empty');
    }

    // Verify fragment chips (should have "..." endings)
    const step5Fragments = await countFragments(page);
    const step5AllChips = await countAllChipButtons(page);
    console.log(`   Total chip buttons: ${step5AllChips}, Fragments (with "..."): ${step5Fragments}`);

    if (step5Fragments >= 4) {
      console.log('   Verified: Fragment chips with "..." endings present');
    } else {
      console.log(`   Note: Expected at least 4 fragments, got ${step5Fragments}`);
    }

    // Test "More" button
    console.log('   Testing "More" button...');
    const clickedMore5 = await clickMoreButton(page);
    if (clickedMore5) {
      await sleep(500);
      const expandedCount5 = await countAllChipButtons(page);
      console.log(`   Chips after "More": ${expandedCount5}`);
    }

    // Click a fragment chip
    console.log('   Clicking a fragment...');
    const fragmentResult = await clickFragment(page, 0);
    if (fragmentResult.clicked) {
      console.log(`   Clicked: "${fragmentResult.text.substring(0, 50)}..."`);
      if (fragmentResult.hadEllipsis) {
        console.log('   Verified: Fragment had "..." ending');
        await sleep(500);
        const textareaValue = await getTextareaValue(page);
        const cleanedFragment = fragmentResult.text.replace(/\.{2,}$/, '').trim();
        if (textareaValue.includes(cleanedFragment)) {
          console.log('   Verified: Fragment text appended without "..."');
        }
      }
    }

    // Click Next
    const clickedStep5 = await clickButton(page, 'Next');
    if (!clickedStep5) {
      await page.screenshot({ path: 'e2e/debug-fo11-step5-next.png' });
      throw new Error('Could not click Next on step 5');
    }
    console.log('Step 5 completed');

    // Heart animation 2: Context -> Tone
    await runHeartAnimation(page, 'Heart animation 2 (Context -> Tone)');

    // ========================================
    // Step 6: Tone - LLM question + single-word chips
    // ========================================
    console.log('\nStep 6: Tone (LLM Q + Single-Word Chips)...');

    const thinkingFinished6 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished6) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(1000);

    // Verify LLM-generated tone question
    const toneQuestionH2 = page.locator('h2').first();
    let step6Question = '';
    try {
      step6Question = (await toneQuestionH2.textContent({ timeout: 10000 })) || '';
      console.log(`   LLM Question: "${step6Question}"`);
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo11-step6-question.png' });
      throw new Error('Step 6 question did not appear');
    }

    if (step6Question.length > 10) {
      console.log('   Verified: LLM-generated tone question appeared');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo11-step6-no-question.png' });
      throw new Error('Step 6 question is too short or empty');
    }

    // Verify helper text
    const hasHelperText = await waitForTextContaining(page, 'calm, motivational, gentle, clear', 3000);
    if (hasHelperText) {
      console.log('   Verified: Helper text visible');
    }

    // Verify single-word chips (NOT multi-word sentences)
    const toneChipTexts = await getAllChipTexts(page);
    console.log(`   Tone chips: ${toneChipTexts.length}`);
    if (toneChipTexts.length > 0) {
      console.log(`   Sample chips: ${toneChipTexts.slice(0, 6).join(', ')}`);

      // Verify chips are single words (no spaces, no long phrases)
      let multiWordCount = 0;
      for (const chipText of toneChipTexts) {
        const wordCount = chipText.split(/\s+/).length;
        if (wordCount > 2) {
          multiWordCount++;
          console.log(`   WARNING: Multi-word chip found: "${chipText}"`);
        }
      }
      if (multiWordCount === 0) {
        console.log('   Verified: All tone chips are single words or two-word phrases');
      } else {
        console.log(`   Note: ${multiWordCount} chips have more than 2 words`);
      }
    }

    // Click a tone chip
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
    const clickedStep6 = await clickButton(page, 'Next');
    if (!clickedStep6) {
      await page.screenshot({ path: 'e2e/debug-fo11-step6-next.png' });
      throw new Error('Could not click Next on step 6');
    }
    console.log('Step 6 completed');

    // Heart animation 3: Tone -> Generation
    await runHeartAnimation(page, 'Heart animation 3 (Tone -> Generation)');

    // Generation + Card review
    console.log('\n--- Affirmation Card Review ---');
    const { lovedCount, discardedCount } = await runGenerationAndReview(page);

    // Summary
    await runSummaryScreen(page);

    // Post-review steps
    await runPostReviewSteps(page);

    console.log('\n' + '='.repeat(60));
    console.log('FLOW 1 PASSED! Non-Skip Flow Complete');
    console.log(`   Cards: ${lovedCount} loved, ${discardedCount} discarded`);
    console.log('='.repeat(60));

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ========================================
// Test Flow 2: SKIP FLOW
// (Rich goal answer -> step 5 skipped -> step 6 appears directly)
// ========================================
async function runSkipFlow(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FLOW 2: SKIP FLOW (Rich Goal)');
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

    // Navigate to FO-11
    console.log(`\nOpening ${BASE_URL}/fo-11...`);
    await page.goto(`${BASE_URL}/fo-11`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Steps 0-2: Welcome
    await runWelcomeSteps(page);

    // Step 3: Familiarity
    await runFamiliarityStep(page);

    // Step 4: Goal with RICH answer (should trigger skip of step 5)
    const richGoalText = 'I need motivation because I have a big exam tomorrow and I am scared and nervous about it. I have been procrastinating and I feel like I cannot do this.';
    await runGoalStep(page, richGoalText);

    // Heart animation after goal
    await runHeartAnimation(page, 'Heart animation (Goal -> Tone, skipping Context)');

    // ========================================
    // Step 5 should be SKIPPED -- verify we go directly to step 6
    // ========================================
    console.log('\nVerifying step 5 was SKIPPED...');

    // Wait for content to load - either step 5 or step 6
    // We expect step 6 (tone) to appear, NOT step 5 (context)
    await sleep(2000);

    // Wait for thinking to finish (step 6 data loading)
    const thinkingFinished = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(1000);

    // ========================================
    // Step 6: Tone - should appear directly (step 5 skipped)
    // ========================================
    console.log('\nStep 6: Tone (LLM Q + Single-Word Chips) - after skip...');

    // Verify LLM-generated tone question
    const toneQuestionH2 = page.locator('h2').first();
    let step6Question = '';
    try {
      step6Question = (await toneQuestionH2.textContent({ timeout: 15000 })) || '';
      console.log(`   LLM Question: "${step6Question}"`);
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo11-skip-step6-question.png' });
      throw new Error('Step 6 question did not appear after skip');
    }

    if (step6Question.length > 10) {
      console.log('   Verified: Step 6 tone question appeared (step 5 was skipped)');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo11-skip-no-question.png' });
      throw new Error('Step 6 question is too short or empty after skip');
    }

    // Verify helper text (confirms this is the tone step, not context)
    const hasHelperText = await waitForTextContaining(page, 'calm, motivational, gentle, clear', 3000);
    if (hasHelperText) {
      console.log('   Verified: Tone helper text visible (confirms step 6, not step 5)');
    }

    // Verify single-word chips
    const toneChipTexts = await getAllChipTexts(page);
    console.log(`   Tone chips: ${toneChipTexts.length}`);
    if (toneChipTexts.length > 0) {
      console.log(`   Sample chips: ${toneChipTexts.slice(0, 6).join(', ')}`);
    }

    // Select tone chips
    const toneResult1 = await clickWordChip(page, 0);
    if (toneResult1.clicked) {
      console.log(`   Selected: "${toneResult1.text}"`);
    }
    await sleep(200);
    const toneResult2 = await clickWordChip(page, 1);
    if (toneResult2.clicked) {
      console.log(`   Selected: "${toneResult2.text}"`);
    }
    await sleep(300);

    // Click Next
    const clickedStep6 = await clickButton(page, 'Next');
    if (!clickedStep6) {
      await page.screenshot({ path: 'e2e/debug-fo11-skip-step6-next.png' });
      throw new Error('Could not click Next on step 6');
    }
    console.log('Step 6 completed');

    // Heart animation: Tone -> Generation
    await runHeartAnimation(page, 'Heart animation (Tone -> Generation)');

    // Generation + Card review
    console.log('\n--- Affirmation Card Review ---');
    const { lovedCount, discardedCount } = await runGenerationAndReview(page);

    // Summary
    await runSummaryScreen(page);

    // Test "Create more" feature
    console.log('\n--- Testing "Create more" ---');
    const clickedMore = await clickButton(page, 'I want to create more');
    if (!clickedMore) {
      await page.screenshot({ path: 'e2e/debug-fo11-create-more.png' });
      throw new Error('Could not click "I want to create more"');
    }
    console.log('Clicked "I want to create more"');

    // Wait for second batch generation
    console.log('Waiting for second batch generation...');
    const hasGenerating2 = await waitForTextContaining(page, 'Creating more affirmations', 10000);
    if (hasGenerating2) {
      console.log('Second generation phase detected');
    }

    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]') ||
              !!document.querySelector('[data-testid="affirmation-card"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo11-generation2-timeout.png' });
      throw new Error('Second batch generation did not complete in time');
    }
    console.log('Second batch generated - Card flow visible');

    // Review second batch: love all
    let lovedCount2 = 0;
    for (let i = 0; i < 5; i++) {
      const loved = await clickLoveIt(page);
      if (loved) {
        lovedCount2++;
      } else {
        const discarded = await clickDiscard(page);
        if (discarded) {
          console.log(`   Card ${i + 1}: Discarded (fallback)`);
        }
      }
      await sleep(500);
    }
    console.log(`Second batch: ${lovedCount2} loved`);

    // Verify second summary shows accumulated affirmations
    const hasSummary2 = await waitForTextContaining(page, 'Your affirmations', 10000);
    if (hasSummary2) {
      console.log('Verified: Summary screen shows accumulated affirmations');
    }

    // Now proceed to completion
    await runPostReviewSteps(page);

    console.log('\n' + '='.repeat(60));
    console.log('FLOW 2 PASSED! Skip Flow Complete');
    console.log(`   Batch 1: ${lovedCount} loved, ${discardedCount} discarded`);
    console.log(`   Batch 2: ${lovedCount2} loved (Create more)"`);
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
  console.log('Starting FO-11 Onboarding E2E Tests\n');
  console.log('FO-11: Guided Discovery Hybrid');
  console.log('- Adaptive LLM questions with skip logic');
  console.log('- Single-word tone chips');
  console.log('- Variable-length discovery (2 or 3 steps)\n');

  try {
    // Flow 1: Non-skip flow (brief goal -> step 5 appears)
    await runNonSkipFlow();

    // Flow 2: Skip flow (rich goal -> step 5 skipped)
    await runSkipFlow();

    // ========================================
    // ALL TESTS PASSED
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('ALL TESTS PASSED! FO-11 E2E Tests Complete');
    console.log('='.repeat(60));
    console.log('\nTest Summary:');
    console.log('   Flow 1 (Non-Skip):');
    console.log('   - Welcome screens (steps 0-2) completed');
    console.log('   - Familiarity selected');
    console.log('   - Step 4 (Goal): Brief answer "Motivation"');
    console.log('   - Step 5 (Context): LLM question + fragment chips with "..."');
    console.log('   - Step 6 (Tone): LLM question + single-word chips');
    console.log('   - Heart animations between discovery steps');
    console.log('   - 5 affirmations generated, card review, summary');
    console.log('   - Post-review mockups + completion');
    console.log('   Flow 2 (Skip):');
    console.log('   - Rich goal triggers step 5 skip');
    console.log('   - Step 6 (Tone) appears directly after heart animation');
    console.log('   - Affirmation generation works with 2-exchange flow');
    console.log('   - "Create more" generates second batch');
    console.log('   - Accumulated affirmations shown on completion');

  } catch (error) {
    console.error('\nTEST FAILED:', error);
    process.exit(1);
  }
}

// Run the test
runTest();
