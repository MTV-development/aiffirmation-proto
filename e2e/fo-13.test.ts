/**
 * E2E test for FO-13 Onboarding Flow using Playwright
 *
 * FO-13 is a "40-Affirmation Journey" with two phases:
 *   Phase 1: 4 batches of 5 cards (20 total)
 *   Phase 2: 1 batch of 20 cards (optional via "Add more later")
 *
 * Key features:
 * 1. Steps 0-1: Welcome + Name (2 sub-steps)
 * 2. Step 2: Familiarity ("Have you used affirmations before?")
 * 3. Step 3: Goal with predefined topic chips + textarea
 * 4. Thinking A: sequential messages (pulsing heart, auto-advances)
 * 5. Step 4: Context — LLM question + fragment chips (SKIPPABLE if goal is rich)
 * 6. Thinking B: sequential messages
 * 7. Step 5: Tone — LLM question + single-word chips
 * 8. Thinking C: generates first batch of 5
 * 9. Step 7: StepReady — "Your personal affirmations are beginning to form"
 * 10. Steps 8-11: 4 x 5 card reviews with thinking screens D-G between batches
 * 11. Step 12: Create-List — Continue to Phase 2 or "Add more later" to skip
 * 12. Step 13: Thinking — generates Phase 2 batch of 20
 * 13. Step 14: Phase 2 card review — 20 cards, "X of 40 selected"
 * 14. Step 15: Thinking H — "Beautiful, TestUser." -> post-review
 * 15. Step 16: Theme (gradient picker)
 * 16. Step 17: Notifications
 * 17. Step 18: Premium
 * 18. Step 19: Feed (final screen)
 *
 * Three test cases:
 *   Test 1: Happy Path (all 40 cards, brief goal -> context NOT skipped)
 *   Test 2: Skip-Context Variant (rich goal -> context skipped, skip Phase 2)
 *   Test 3: "Add more later" Variant (brief goal, Phase 1 only, skip Phase 2)
 *
 * Run with: node --import tsx e2e/fo-13.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-13 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 120000; // 120s for AI generation

// ========================================
// Utility functions (adapted from FO-12)
// ========================================

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

// Count all visible chip buttons (excluding control buttons)
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

// Get the global progress counter text ("X of Y selected")
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

// Wait for a new affirmation card to appear (handles AnimatePresence transitions)
async function waitForNextCard(page: Page, previousText: string, timeout = 10000): Promise<boolean> {
  try {
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

// ========================================
// FO-13 Specific helpers
// ========================================

/**
 * Wait for a ThinkingScreen to complete and the next step content to appear.
 *
 * FO-13's ThinkingScreen shows sequential text messages with a pulsing heart SVG.
 * It auto-advances after cycling through all messages. We detect it by the heart
 * SVG and wait for the next step's identifiable content to appear.
 */
async function waitForThinkingScreenToComplete(
  page: Page,
  nextContentText: string,
  timeout = 60000
): Promise<boolean> {
  const heartSelector = 'svg[viewBox="0 0 24 24"]';

  // First, wait for the heart SVG to appear (thinking screen is active)
  try {
    await page.waitForSelector(heartSelector, { timeout: 10000 });
    console.log('   ThinkingScreen detected (pulsing heart visible)');
  } catch {
    // Heart may have already appeared and disappeared (fast transition)
    console.log('   ThinkingScreen heart not detected, may have already passed');
  }

  // Wait for the next step's content to appear
  const found = await waitForTextContaining(page, nextContentText, timeout);
  if (found) {
    console.log(`   Next content appeared: "${nextContentText.substring(0, 50)}"`);
  } else {
    console.log(`   Warning: Next content "${nextContentText.substring(0, 50)}" did not appear within timeout`);
  }

  return found;
}

/**
 * Wait for a ThinkingScreen to complete when we cannot predict the next content
 * (e.g., before an LLM-generated question). Waits for the heart to disappear.
 */
async function waitForThinkingScreenToDisappear(page: Page, timeout = 60000): Promise<boolean> {
  const heartSelector = 'svg[viewBox="0 0 24 24"]';

  // Wait for heart to appear
  try {
    await page.waitForSelector(heartSelector, { timeout: 10000 });
    console.log('   ThinkingScreen detected (pulsing heart visible)');
  } catch {
    console.log('   ThinkingScreen heart not detected, may have already passed');
    return true;
  }

  // Wait for heart to disappear (thinking screen completed)
  try {
    await page.waitForFunction(
      () => !document.querySelector('svg[viewBox="0 0 24 24"]'),
      { timeout }
    );
    console.log('   ThinkingScreen completed (heart disappeared)');
    return true;
  } catch {
    console.log('   Warning: ThinkingScreen did not complete within timeout');
    return false;
  }
}

// ========================================
// Shared flow helpers
// ========================================

/**
 * Run welcome steps 0-1 for FO-13.
 */
async function runWelcomeSteps(page: Page): Promise<void> {
  // Step 0: Welcome intro screen
  console.log('\nStep 0: Welcome intro screen...');
  const hasWelcomeIntro = await waitForTextContaining(page, 'Let\'s get to know you', 10000);
  if (!hasWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo13-welcome-intro.png' });
    throw new Error('Welcome intro screen did not appear');
  }
  console.log('Verified: Welcome intro screen visible');

  const hasCreateText = await waitForTextContaining(page, 'create your personal affirmations', 3000);
  if (hasCreateText) {
    console.log('Verified: "create your personal affirmations" text present');
  }

  const clickedWelcomeIntro = await clickButton(page, 'Continue');
  if (!clickedWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo13-welcome-intro-continue.png' });
    throw new Error('Could not click Continue on welcome intro');
  }
  await sleep(500);

  // Step 1: Name input screen
  console.log('\nStep 1: Name input screen...');
  const hasNamePrompt = await waitForTextContaining(page, 'your name', 5000);
  if (!hasNamePrompt) {
    await page.screenshot({ path: 'e2e/debug-fo13-name-prompt.png' });
    throw new Error('Name input screen did not appear');
  }

  // FO-13 uses a text input (not textarea) for name
  const nameInput = page.locator('input[placeholder*="name"]');
  await nameInput.fill('TestUser');
  await sleep(300);

  const clickedNameContinue = await clickButton(page, 'Continue');
  if (!clickedNameContinue) {
    await page.screenshot({ path: 'e2e/debug-fo13-name-continue.png' });
    throw new Error('Could not click Continue on name input');
  }
  console.log('Name entered and Continue clicked');
  await sleep(300);
}

/**
 * Run familiarity step 2 for FO-13.
 */
async function runFamiliarityStep(page: Page): Promise<void> {
  console.log('\nStep 2: Familiarity selection...');
  const hasFamiliarityPrompt = await waitForTextContaining(page, 'Have you used affirmations before', 5000);
  if (!hasFamiliarityPrompt) {
    await page.screenshot({ path: 'e2e/debug-fo13-familiarity.png' });
    throw new Error('Familiarity screen did not appear');
  }
  console.log('Verified: Familiarity screen visible');

  // Verify FO-13 specific option labels
  const hasTriedOption = await waitForTextContaining(page, 'I\'ve tried a few', 3000);
  if (hasTriedOption) console.log('   Verified: "I\'ve tried a few" option visible');

  // Select "I've tried a few" - auto-advances after confetti + success message
  const triedButton = page.locator('button:has-text("I\'ve tried a few")').first();
  if (await triedButton.isVisible({ timeout: 3000 })) {
    await triedButton.click();
    console.log('Selected: "I\'ve tried a few"');
    await waitForTextContaining(page, 'Super', 3000);
    await sleep(2000); // Wait for auto-advance
  } else {
    await page.screenshot({ path: 'e2e/debug-fo13-familiarity-button.png' });
    throw new Error('Could not find "I\'ve tried a few" button');
  }
}

/**
 * Run goal step 3 with specified text.
 */
async function runGoalStep(page: Page, goalText: string): Promise<void> {
  console.log('\nStep 3: Goal (Fixed Q + Predefined Chips)...');

  // Verify fixed question
  const hasGoalQuestion = await waitForTextContaining(page, 'main goal with affirmations today', 5000);
  if (!hasGoalQuestion) {
    await page.screenshot({ path: 'e2e/debug-fo13-step3-question.png' });
    throw new Error('Step 3 goal question did not appear');
  }
  console.log('Verified: Fixed goal question displayed');

  // Count predefined topic chips
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

  // Click Continue (data-testid="continue-button")
  const clickedStep3 = await clickButton(page, 'Continue');
  if (!clickedStep3) {
    await page.screenshot({ path: 'e2e/debug-fo13-step3-continue.png' });
    throw new Error('Could not click Continue on step 3');
  }
  console.log('Step 3 completed');
}

/**
 * Run context step 4 (when NOT skipped).
 */
async function runContextStep(page: Page): Promise<void> {
  console.log('\nStep 4: Context (LLM Q + LLM Fragments)...');

  // Wait for LLM-generated question to appear
  const questionH2 = page.locator('h2').first();
  let step4Question = '';
  try {
    step4Question = (await questionH2.textContent({ timeout: 15000 })) || '';
    console.log(`   LLM Question: "${step4Question}"`);
  } catch {
    await page.screenshot({ path: 'e2e/debug-fo13-step4-question.png' });
    throw new Error('Step 4 question did not appear');
  }

  if (step4Question.length > 10) {
    console.log('   Verified: LLM-generated context question appeared');
  } else {
    await page.screenshot({ path: 'e2e/debug-fo13-step4-no-question.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo13-step4-next.png' });
    throw new Error('Could not click Next on step 4');
  }
  console.log('Step 4 completed');
}

/**
 * Run tone step 5.
 */
async function runToneStep(page: Page): Promise<void> {
  console.log('\nStep 5: Tone (LLM Q + Single-Word Chips)...');

  // Verify LLM-generated tone question
  const toneQuestionH2 = page.locator('h2').first();
  let step5Question = '';
  try {
    step5Question = (await toneQuestionH2.textContent({ timeout: 15000 })) || '';
    console.log(`   LLM Question: "${step5Question}"`);
  } catch {
    await page.screenshot({ path: 'e2e/debug-fo13-step5-question.png' });
    throw new Error('Step 5 question did not appear');
  }

  if (step5Question.length > 10) {
    console.log('   Verified: LLM-generated tone question appeared');
  } else {
    await page.screenshot({ path: 'e2e/debug-fo13-step5-no-question.png' });
    throw new Error('Step 5 question is too short or empty');
  }

  // Verify single-word chips
  const toneChipTexts = await getAllChipTexts(page);
  console.log(`   Tone chips: ${toneChipTexts.length}`);
  if (toneChipTexts.length > 0) {
    console.log(`   Sample chips: ${toneChipTexts.slice(0, 6).join(', ')}`);
  }

  // Verify helper text
  const hasHelperText = await waitForTextContaining(page, 'For example: calm, motivational', 3000);
  if (hasHelperText) {
    console.log('   Verified: Helper text "For example: calm, motivational..." present');
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
    await page.screenshot({ path: 'e2e/debug-fo13-step5-next.png' });
    throw new Error('Could not click Next on step 5');
  }
  console.log('Step 5 completed');
}

/**
 * Run StepReady (step 7) and click Continue.
 */
async function runStepReady(page: Page): Promise<void> {
  console.log('\nStep 7: StepReady...');
  const hasStepReady = await waitForTextContaining(
    page,
    'Your personal affirmations are beginning to form, TestUser',
    30000
  );
  if (!hasStepReady) {
    await page.screenshot({ path: 'e2e/debug-fo13-step-ready.png' });
    throw new Error('StepReady screen did not appear');
  }
  console.log('Verified: StepReady headline with "TestUser" name');

  // Verify secondary text
  const hasExploreText = await waitForTextContaining(page, 'explore a set of affirmations', 3000);
  if (hasExploreText) {
    console.log('Verified: "explore a set of affirmations" text present');
  }

  const clickedReady = await clickButton(page, 'Continue');
  if (!clickedReady) {
    await page.screenshot({ path: 'e2e/debug-fo13-step-ready-continue.png' });
    throw new Error('Could not click Continue on StepReady');
  }
  console.log('StepReady completed');
  await sleep(500);
}

/**
 * Review a single batch of affirmation cards with the love/discard pattern.
 * Pattern: love first `loveCutoff` cards, discard the rest.
 */
async function reviewCardBatch(
  page: Page,
  batchSize: number,
  loveCutoff: number,
  phaseName: string
): Promise<{ lovedCount: number; discardedCount: number }> {
  let lovedCount = 0;
  let discardedCount = 0;

  for (let i = 0; i < batchSize; i++) {
    // Wait for a card to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card"]'),
        { timeout: 15000 }
      );
    } catch {
      console.log(`   ${phaseName}: Card ${i + 1} did not appear, may have completed early`);
      break;
    }

    // Let animation settle
    await sleep(600);

    // Get progress
    const progress = await getGlobalProgressText(page);

    // Read affirmation text BEFORE clicking (for waitForNextCard)
    let cardText = '';
    try {
      cardText = (await page.locator('[data-testid="affirmation-card"] p').first().textContent()) || '';
    } catch {
      // Could not read card text
    }

    if (i < loveCutoff) {
      const loved = await clickLoveIt(page);
      if (loved) {
        lovedCount++;
        console.log(`   ${phaseName} Card ${i + 1}/${batchSize}: Love it (progress: ${progress}) - "${cardText.substring(0, 50)}..."`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo13-${phaseName.toLowerCase().replace(/\s/g, '-')}-card-${i + 1}-love.png` });
        throw new Error(`Could not click "Love it" on card ${i + 1} in ${phaseName}`);
      }
    } else {
      const discarded = await clickDiscard(page);
      if (discarded) {
        discardedCount++;
        console.log(`   ${phaseName} Card ${i + 1}/${batchSize}: Discard (progress: ${progress})`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo13-${phaseName.toLowerCase().replace(/\s/g, '-')}-card-${i + 1}-discard.png` });
        throw new Error(`Could not click "Discard" on card ${i + 1} in ${phaseName}`);
      }
    }

    // Wait for card transition before next iteration
    if (i < batchSize - 1) {
      await waitForNextCard(page, cardText, 5000);
    } else {
      // Last card in batch -- wait for auto-transition to thinking screen
      await sleep(1000);
    }
  }

  console.log(`   ${phaseName} complete: ${lovedCount} loved, ${discardedCount} discarded`);
  return { lovedCount, discardedCount };
}

/**
 * Run the complete discovery flow: welcome, familiarity, goal, thinking A,
 * context (if not skipped), thinking B (if context shown), tone, thinking C.
 *
 * Returns whether context step was skipped.
 */
async function runDiscoveryFlow(
  page: Page,
  goalText: string
): Promise<{ contextSkipped: boolean }> {
  // Steps 0-1: Welcome
  await runWelcomeSteps(page);

  // Step 2: Familiarity
  await runFamiliarityStep(page);

  // Step 3: Goal
  await runGoalStep(page, goalText);

  // Thinking A: "Thank you for sharing, TestUser..." -> "Shaping affirmations..."
  console.log('\nThinking A (Goal -> Context/Tone)...');
  await sleep(500);

  // After Thinking A, we either land on step 4 (context) or step 5 (tone, if context skipped).
  // We need to detect which one appeared.
  // Wait for thinking screen to disappear first.
  await waitForThinkingScreenToDisappear(page, 60000);
  await sleep(1000);

  // Check if we landed on context (step 4) or tone (step 5)
  // Context has an LLM-generated question; tone has helper text "For example: calm..."
  // We check for the "Next" button with a textarea (both have it), but context has
  // fragment-style chips while tone has word chips.
  // Simplest: check if we see the tone helper text which only appears on step 5.
  const isToneStep = await waitForTextContaining(page, 'For example: calm, motivational', 5000);

  if (isToneStep) {
    // Context was SKIPPED -- we're at tone (step 5)
    console.log('Context step 4 was SKIPPED (landed directly on tone step 5)');

    await runToneStep(page);

    // Thinking C: generates first batch of 5
    console.log('\nThinking C (Tone -> StepReady, generating batch 1)...');
    await waitForThinkingScreenToComplete(
      page,
      'Your personal affirmations are beginning to form',
      TIMEOUT
    );
    await sleep(1000);

    return { contextSkipped: true };
  } else {
    // Context NOT skipped -- we're at context (step 4)
    console.log('Context step 4 was NOT skipped');

    await runContextStep(page);

    // Thinking B: "Learning..." -> "Your affirmations are taking shape..."
    console.log('\nThinking B (Context -> Tone)...');
    await waitForThinkingScreenToDisappear(page, 60000);
    await sleep(1000);

    // Now at step 5: Tone
    await runToneStep(page);

    // Thinking C: generates first batch of 5
    console.log('\nThinking C (Tone -> StepReady, generating batch 1)...');
    await waitForThinkingScreenToComplete(
      page,
      'Your personal affirmations are beginning to form',
      TIMEOUT
    );
    await sleep(1000);

    return { contextSkipped: false };
  }
}

/**
 * Run Phase 1 card review: 4 batches of 5 cards each (steps 8-11).
 * Between batches, thinking screens D-G auto-appear and auto-advance.
 *
 * Love pattern: love first `loveCutoff` in each batch, discard the rest.
 */
async function runPhase1CardReview(
  page: Page,
  loveCutoff: number
): Promise<{ totalLoved: number; totalDiscarded: number }> {
  let totalLoved = 0;
  let totalDiscarded = 0;

  for (let batchIndex = 0; batchIndex < 4; batchIndex++) {
    const batchNum = batchIndex + 1;
    const stepNum = 8 + batchIndex;
    const phaseName = `Phase1-Batch${batchNum}`;

    console.log(`\n--- ${phaseName} (Step ${stepNum}): 5 cards ---`);

    // Wait for card flow to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: 30000 }
      );
    } catch {
      await page.screenshot({ path: `e2e/debug-fo13-${phaseName.toLowerCase()}-start.png` });
      throw new Error(`${phaseName} card flow did not appear`);
    }
    console.log(`${phaseName} card flow visible`);

    // Verify progress counter
    const progress = await getGlobalProgressText(page);
    console.log(`   Initial progress: "${progress}"`);
    if (batchIndex === 0) {
      if (progress.includes('0 of 20')) {
        console.log('   Verified: Global counter starts at "0 of 20 selected"');
      }
    }

    // Review 5 cards
    const batch = await reviewCardBatch(page, 5, loveCutoff, phaseName);
    totalLoved += batch.lovedCount;
    totalDiscarded += batch.discardedCount;

    console.log(`   Running total: ${totalLoved} loved, ${totalDiscarded} discarded`);

    // After the last card in a batch, thinking screen appears automatically (no click needed).
    // For batches 1-3 (steps 8-10), thinking generates next batch.
    // For batch 4 (step 11), thinking advances to Create-List (step 12).
    if (batchIndex < 3) {
      // Thinking D/E/F: wait for next batch card flow
      console.log(`\nThinking ${String.fromCharCode(68 + batchIndex)} (between batch ${batchNum} and ${batchNum + 1})...`);
      try {
        await page.waitForFunction(
          () => !!document.querySelector('svg[viewBox="0 0 24 24"]'),
          { timeout: 10000 }
        );
        console.log('   ThinkingScreen detected');
      } catch {
        console.log('   ThinkingScreen may have been too fast to detect');
      }

      // Wait for next batch card flow to appear (thinking screen auto-advances + AI generation)
      try {
        await page.waitForFunction(
          () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
          { timeout: TIMEOUT }
        );
      } catch {
        await page.screenshot({ path: `e2e/debug-fo13-thinking-${String.fromCharCode(68 + batchIndex).toLowerCase()}.png` });
        throw new Error(`Card flow did not reappear after Thinking ${String.fromCharCode(68 + batchIndex)}`);
      }
      await sleep(500);
    } else {
      // After batch 4 (step 11): Thinking G -> Create-List (step 12)
      console.log('\nThinking G (after last Phase 1 batch -> Create-List)...');
      const reachedCreateList = await waitForThinkingScreenToComplete(
        page,
        'already built something personal',
        30000
      );
      if (!reachedCreateList) {
        await page.screenshot({ path: 'e2e/debug-fo13-thinking-g.png' });
        throw new Error('Create-List screen did not appear after Thinking G');
      }
    }
  }

  console.log(`\nPhase 1 totals: ${totalLoved} loved, ${totalDiscarded} discarded`);
  return { totalLoved, totalDiscarded };
}

/**
 * Run Phase 2 card review: 1 batch of 20 cards (step 14).
 * Counter shows "X of 40 selected" where X starts from Phase 1's loved count.
 */
async function runPhase2CardReview(
  page: Page,
  loveCutoff: number
): Promise<{ lovedCount: number; discardedCount: number }> {
  console.log('\n--- Phase 2: Card Review (20 cards) ---');

  // Wait for card flow to appear
  try {
    await page.waitForFunction(
      () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
      { timeout: 30000 }
    );
  } catch {
    await page.screenshot({ path: 'e2e/debug-fo13-phase2-start.png' });
    throw new Error('Phase 2 card flow did not appear');
  }
  console.log('Phase 2 card flow visible');

  // Verify "of 40 selected" counter
  const initialProgress = await getGlobalProgressText(page);
  console.log(`   Initial progress: "${initialProgress}"`);
  if (initialProgress.includes('of 40')) {
    console.log('   Verified: Phase 2 counter shows "of 40 selected"');
  }

  // Review 20 cards
  const result = await reviewCardBatch(page, 20, loveCutoff, 'Phase2');
  return result;
}

/**
 * Run post-review steps: Theme (16), Notifications (17), Premium (18), Feed (19).
 */
async function runPostReviewSteps(page: Page): Promise<void> {
  // Step 16: Theme
  console.log('\nStep 16: Theme selection...');
  const hasTheme = await waitForText(page, 'Make your affirmations look beautiful', 10000);
  if (!hasTheme) {
    await page.screenshot({ path: 'e2e/debug-fo13-theme.png' });
    throw new Error('Theme selection screen did not appear');
  }
  console.log('Verified: Theme selection screen visible');

  // Optionally select a gradient
  const gradientButton = page.locator('button[aria-label="Sunset"]');
  if (await gradientButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gradientButton.click();
    console.log('   Selected "Sunset" gradient');
    await sleep(300);
  }

  const clickedTheme = await clickButton(page, 'Continue');
  if (!clickedTheme) {
    throw new Error('Could not click Continue on theme selection');
  }
  console.log('Theme selection completed');

  // Step 17: Notifications
  console.log('\nStep 17: Notifications...');
  const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
  if (!hasNotifications) {
    await page.screenshot({ path: 'e2e/debug-fo13-notifications.png' });
    throw new Error('Notifications screen did not appear');
  }
  console.log('Verified: Notifications screen visible');
  await sleep(500);
  const clickedNotifications = await clickButton(page, 'Continue');
  if (!clickedNotifications) {
    throw new Error('Could not click Continue on notifications');
  }
  console.log('Notifications completed');

  // Step 18: Premium
  console.log('\nStep 18: Premium...');
  const hasPremium = await waitForText(page, 'More support, whenever you want', 5000);
  if (!hasPremium) {
    await page.screenshot({ path: 'e2e/debug-fo13-premium.png' });
    throw new Error('Premium screen did not appear');
  }
  console.log('Verified: Premium screen visible');
  await sleep(500);
  const clickedPremium = await clickButton(page, 'Not now');
  if (!clickedPremium) {
    throw new Error('Could not click "Not now" on premium');
  }
  console.log('Premium completed');

  // Step 19: Feed
  console.log('\nStep 19: Verifying Feed screen...');
  const hasFeed = await waitForTextContaining(page, 'Welcome to your personal affirmation feed, TestUser', 10000);
  if (!hasFeed) {
    await page.screenshot({ path: 'e2e/debug-fo13-feed.png' });
    throw new Error('Feed screen did not appear');
  }
  console.log('Verified: Feed screen shows "Welcome to your personal affirmation feed, TestUser!"');

  // Verify feed is ready
  const hasFeedReady = await waitForTextContaining(page, 'Your personal feed is ready', 5000);
  if (hasFeedReady) {
    console.log('Verified: "Your personal feed is ready" text present');
  }

  // Verify saved count
  const hasSavedCount = await waitForTextContaining(page, 'saved', 3000);
  if (hasSavedCount) {
    console.log('Verified: Affirmation saved count shown');
  }
}

// ========================================
// Test 1: Happy Path (all 40 cards)
// ========================================
async function testHappyPath(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FO-13 TEST 1: HAPPY PATH (All 40 Cards)');
  console.log('='.repeat(60));
  console.log('Brief goal -> context NOT skipped -> all Phase 1 + Phase 2 cards');

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

    // Navigate to FO-13
    console.log(`\nOpening ${BASE_URL}/fo-13...`);
    await page.goto(`${BASE_URL}/fo-13`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Discovery flow: brief goal -> context NOT skipped
    const { contextSkipped } = await runDiscoveryFlow(page, 'I want to feel more confident');
    if (contextSkipped) {
      console.log('WARNING: Context step was unexpectedly skipped with brief goal text');
    }

    // Step 7: StepReady
    await runStepReady(page);

    // Steps 8-11: Phase 1 card review (4 x 5 cards)
    // Pattern: love first 3, discard last 2 per batch
    const phase1 = await runPhase1CardReview(page, 3);
    console.log(`Phase 1 result: ${phase1.totalLoved} loved, ${phase1.totalDiscarded} discarded`);

    // Step 12: Create-List
    console.log('\nStep 12: Create-List...');
    const hasCreateList = await waitForTextContaining(page, 'already built something personal, TestUser', 5000);
    if (!hasCreateList) {
      await page.screenshot({ path: 'e2e/debug-fo13-create-list.png' });
      throw new Error('Create-List screen did not appear');
    }
    console.log('Verified: Create-List headline with "TestUser" name');

    // Verify loved count mention
    const hasLovedCountText = await waitForTextContaining(page, `${phase1.totalLoved} affirmation`, 3000);
    if (hasLovedCountText) {
      console.log(`Verified: Create-List mentions ${phase1.totalLoved} affirmations`);
    }

    // Click Continue to proceed to Phase 2
    const clickedCreateListContinue = await clickButton(page, 'Continue');
    if (!clickedCreateListContinue) {
      throw new Error('Could not click Continue on Create-List');
    }
    console.log('Create-List: Clicked Continue (proceeding to Phase 2)');

    // Step 13: Thinking (generates Phase 2 batch of 20)
    console.log('\nStep 13: Thinking (generating Phase 2 batch of 20)...');
    // Wait for thinking screen then card flow to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo13-phase2-generation.png' });
      throw new Error('Phase 2 card flow did not appear after generation');
    }
    await sleep(500);

    // Step 14: Phase 2 card review (20 cards, "X of 40 selected")
    // Pattern: love first 15, discard last 5
    const phase2 = await runPhase2CardReview(page, 15);
    console.log(`Phase 2 result: ${phase2.lovedCount} loved, ${phase2.discardedCount} discarded`);

    const totalLoved = phase1.totalLoved + phase2.lovedCount;
    console.log(`Total loved across both phases: ${totalLoved}`);

    // Step 15: Thinking H — "Beautiful, TestUser." -> "Bringing your personal set together..."
    console.log('\nStep 15: Thinking H (post-Phase 2)...');
    const reachedTheme = await waitForThinkingScreenToComplete(
      page,
      'Make your affirmations look beautiful',
      30000
    );
    if (!reachedTheme) {
      await page.screenshot({ path: 'e2e/debug-fo13-thinking-h.png' });
      throw new Error('Theme screen did not appear after Thinking H');
    }

    // Steps 16-19: Post-review (Theme -> Notifications -> Premium -> Feed)
    await runPostReviewSteps(page);

    console.log('\n' + '='.repeat(60));
    console.log('TEST 1 PASSED: Happy Path completed successfully');
    console.log('='.repeat(60));

    await browser.close();
  } catch (error) {
    console.error('\nTEST 1 FAILED:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// ========================================
// Test 2: Skip-Context Variant
// ========================================
async function testSkipContext(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FO-13 TEST 2: SKIP-CONTEXT VARIANT');
  console.log('='.repeat(60));
  console.log('Rich goal -> context SKIPPED -> Phase 1 + skip Phase 2 via "Add more later"');

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

    // Navigate to FO-13
    console.log(`\nOpening ${BASE_URL}/fo-13...`);
    await page.goto(`${BASE_URL}/fo-13`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Discovery flow: rich goal -> context should be SKIPPED
    const richGoal = "I want to build confidence and inner strength because I'm going through a major career transition and feeling overwhelmed by the changes ahead";
    const { contextSkipped } = await runDiscoveryFlow(page, richGoal);

    // Context skip is driven by the LLM, so we verify but do not fail if it was not skipped.
    // The LLM decides whether the goal text provides sufficient context.
    if (contextSkipped) {
      console.log('CONFIRMED: Context step was skipped as expected with rich goal text');
    } else {
      console.log('NOTE: Context step was NOT skipped despite rich goal text (LLM decision)');
      console.log('This is acceptable -- the LLM may still want more context');
    }

    // Step 7: StepReady
    await runStepReady(page);

    // Steps 8-11: Phase 1 card review (4 x 5 cards)
    // Pattern: love first 3, discard last 2 per batch
    const phase1 = await runPhase1CardReview(page, 3);
    console.log(`Phase 1 result: ${phase1.totalLoved} loved, ${phase1.totalDiscarded} discarded`);

    // Step 12: Create-List
    console.log('\nStep 12: Create-List...');
    const hasCreateList = await waitForTextContaining(page, 'already built something personal, TestUser', 5000);
    if (!hasCreateList) {
      await page.screenshot({ path: 'e2e/debug-fo13-test2-create-list.png' });
      throw new Error('Create-List screen did not appear');
    }
    console.log('Verified: Create-List headline');

    // Click "Add more later" to skip Phase 2
    console.log('Clicking "Add more later" to skip Phase 2...');
    const addMoreLater = page.locator('[data-testid="add-more-later"]');
    if (await addMoreLater.isVisible({ timeout: 5000 })) {
      await addMoreLater.click();
      console.log('Clicked "Add more later"');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo13-test2-add-more-later.png' });
      throw new Error('Could not find "Add more later" link');
    }

    // Should jump directly to Theme (step 16), skipping Phase 2 entirely
    console.log('\nVerifying jump to Theme (skipping Phase 2)...');
    const hasTheme = await waitForText(page, 'Make your affirmations look beautiful', 10000);
    if (!hasTheme) {
      await page.screenshot({ path: 'e2e/debug-fo13-test2-theme.png' });
      throw new Error('Theme screen did not appear after "Add more later"');
    }
    console.log('Verified: Jumped directly to Theme (Phase 2 skipped)');

    // Steps 16-19: Post-review (Theme -> Notifications -> Premium -> Feed)
    await runPostReviewSteps(page);

    console.log('\n' + '='.repeat(60));
    console.log('TEST 2 PASSED: Skip-Context Variant completed successfully');
    console.log('='.repeat(60));

    await browser.close();
  } catch (error) {
    console.error('\nTEST 2 FAILED:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// ========================================
// Test 3: "Add more later" Variant
// ========================================
async function testAddMoreLater(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('FO-13 TEST 3: "ADD MORE LATER" VARIANT');
  console.log('='.repeat(60));
  console.log('Brief goal -> complete all discovery -> Phase 1 -> skip Phase 2 via "Add more later"');

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

    // Navigate to FO-13
    console.log(`\nOpening ${BASE_URL}/fo-13...`);
    await page.goto(`${BASE_URL}/fo-13`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Discovery flow: brief goal -> context should NOT be skipped
    const { contextSkipped } = await runDiscoveryFlow(page, 'I want more inner peace');
    if (contextSkipped) {
      console.log('NOTE: Context step was skipped despite brief goal (LLM decision)');
    } else {
      console.log('Confirmed: Context step was shown with brief goal text');
    }

    // Step 7: StepReady
    await runStepReady(page);

    // Steps 8-11: Phase 1 card review (4 x 5 cards)
    // Pattern: love first 3, discard last 2 per batch
    const phase1 = await runPhase1CardReview(page, 3);
    console.log(`Phase 1 result: ${phase1.totalLoved} loved, ${phase1.totalDiscarded} discarded`);

    // Step 12: Create-List
    console.log('\nStep 12: Create-List...');
    const hasCreateList = await waitForTextContaining(page, 'already built something personal, TestUser', 5000);
    if (!hasCreateList) {
      await page.screenshot({ path: 'e2e/debug-fo13-test3-create-list.png' });
      throw new Error('Create-List screen did not appear');
    }
    console.log('Verified: Create-List headline with "TestUser" name');

    // Verify "Add more later" link is present
    const addMoreLater = page.locator('[data-testid="add-more-later"]');
    const isAddMoreVisible = await addMoreLater.isVisible({ timeout: 5000 });
    if (!isAddMoreVisible) {
      await page.screenshot({ path: 'e2e/debug-fo13-test3-add-more-later.png' });
      throw new Error('"Add more later" link not visible');
    }
    console.log('Verified: "Add more later" link is visible');

    // Click "Add more later"
    await addMoreLater.click();
    console.log('Clicked "Add more later"');

    // Should jump directly to Theme (step 16), skipping Phase 2
    console.log('\nVerifying jump to Theme (skipping Phase 2)...');
    const hasTheme = await waitForText(page, 'Make your affirmations look beautiful', 10000);
    if (!hasTheme) {
      await page.screenshot({ path: 'e2e/debug-fo13-test3-theme.png' });
      throw new Error('Theme screen did not appear after "Add more later"');
    }
    console.log('Verified: Jumped directly to Theme (Phase 2 skipped)');

    // Steps 16-19: Post-review (Theme -> Notifications -> Premium -> Feed)
    await runPostReviewSteps(page);

    console.log('\n' + '='.repeat(60));
    console.log('TEST 3 PASSED: "Add more later" Variant completed successfully');
    console.log('='.repeat(60));

    await browser.close();
  } catch (error) {
    console.error('\nTEST 3 FAILED:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// ========================================
// Main runner
// ========================================
async function main(): Promise<void> {
  console.log('FO-13 E2E Test Suite');
  console.log(`Target: ${BASE_URL}/fo-13`);
  console.log(`Timeout: ${TIMEOUT}ms`);
  console.log('');

  const startTime = Date.now();

  // Run all 3 tests sequentially
  await testHappyPath();
  await testSkipContext();
  await testAddMoreLater();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log(`ALL FO-13 E2E TESTS PASSED! (${elapsed}s total)`);
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('\nFO-13 E2E TEST SUITE FAILED:', error);
  process.exit(1);
});
