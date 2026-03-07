/**
 * E2E test for FO-14 Onboarding Flow using Playwright
 *
 * FO-14 is a "40-Affirmation Journey" with two phases:
 *   Phase 1: 4 batches of 5 cards (20 total)
 *   Phase 2: 3 sub-batches (8+8+4 = 20 cards) with Thinking H/I/J between them
 *
 * Key differences from FO-13:
 * 1. Phase 2 is split into 3 sub-batches on separate screens:
 *    - Step 14: 8 cards → Thinking H → Step 16: 8 cards → Thinking I → Step 18: 4 cards → Thinking J
 * 2. Counter shows "X of 20" counting cards SHOWN (not loved), with data-testid="card-counter"
 * 3. Headline "Does this affirmation resonate with you?" with data-testid="card-headline"
 * 4. Post-review steps shifted to 20-23 (was 16-19 in FO-13)
 *
 * Flow overview:
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
 * 12. Step 13: Thinking — generates Phase 2 sub-batch 1 (8 cards)
 * 13. Step 14: Phase 2 sub-batch 1 — 8 cards
 * 14. Step 15: Thinking H
 * 15. Step 16: Phase 2 sub-batch 2 — 8 cards
 * 16. Step 17: Thinking I
 * 17. Step 18: Phase 2 sub-batch 3 — 4 cards
 * 18. Step 19: Thinking J — post-review transition
 * 19. Step 20: Theme (gradient picker)
 * 20. Step 21: Notifications
 * 21. Step 22: Premium
 * 22. Step 23: Feed (final screen)
 *
 * Two test cases:
 *   Test 1: Happy Path (all 40 cards, brief goal -> context NOT skipped)
 *   Test 2: "Add more later" Variant (skip Phase 2 via "Add more later")
 *
 * Run with: node --import tsx e2e/fo-14.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-14 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 120000; // 120s for AI generation

// ========================================
// Utility functions (adapted from FO-13)
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

// Get the card counter text ("X of 20") via data-testid="card-counter"
async function getCardCounterText(page: Page): Promise<string> {
  try {
    const counter = page.locator('[data-testid="card-counter"]');
    if (await counter.isVisible({ timeout: 3000 })) {
      return (await counter.textContent()) || '';
    }
  } catch {
    // Fallback
  }
  try {
    const spans = await page.locator('span').all();
    for (const span of spans) {
      const text = await span.textContent();
      if (text && /\d+ of \d+/.test(text.trim())) {
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
// FO-14 Specific helpers
// ========================================

/**
 * Wait for a ThinkingScreen to complete and the next step content to appear.
 *
 * FO-14's ThinkingScreen shows sequential text messages with a pulsing heart SVG.
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
 * Run welcome steps 0-1 for FO-14.
 */
async function runWelcomeSteps(page: Page): Promise<void> {
  // Step 0: Welcome intro screen
  console.log('\nStep 0: Welcome intro screen...');
  const hasWelcomeIntro = await waitForTextContaining(page, 'Let\'s get to know you', 10000);
  if (!hasWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo14-welcome-intro.png' });
    throw new Error('Welcome intro screen did not appear');
  }
  console.log('Verified: Welcome intro screen visible');

  const hasCreateText = await waitForTextContaining(page, 'create your personal affirmations', 3000);
  if (hasCreateText) {
    console.log('Verified: "create your personal affirmations" text present');
  }

  const clickedWelcomeIntro = await clickButton(page, 'Continue');
  if (!clickedWelcomeIntro) {
    await page.screenshot({ path: 'e2e/debug-fo14-welcome-intro-continue.png' });
    throw new Error('Could not click Continue on welcome intro');
  }
  await sleep(500);

  // Step 1: Name input screen
  console.log('\nStep 1: Name input screen...');
  const hasNamePrompt = await waitForTextContaining(page, 'your name', 5000);
  if (!hasNamePrompt) {
    await page.screenshot({ path: 'e2e/debug-fo14-name-prompt.png' });
    throw new Error('Name input screen did not appear');
  }

  // FO-14 uses a text input (not textarea) for name
  const nameInput = page.locator('input[placeholder*="name"]');
  await nameInput.fill('TestUser');
  await sleep(300);

  const clickedNameContinue = await clickButton(page, 'Continue');
  if (!clickedNameContinue) {
    await page.screenshot({ path: 'e2e/debug-fo14-name-continue.png' });
    throw new Error('Could not click Continue on name input');
  }
  console.log('Name entered and Continue clicked');
  await sleep(300);
}

/**
 * Run familiarity step 2 for FO-14.
 */
async function runFamiliarityStep(page: Page): Promise<void> {
  console.log('\nStep 2: Familiarity selection...');
  const hasFamiliarityPrompt = await waitForTextContaining(page, 'Have you used affirmations before', 5000);
  if (!hasFamiliarityPrompt) {
    await page.screenshot({ path: 'e2e/debug-fo14-familiarity.png' });
    throw new Error('Familiarity screen did not appear');
  }
  console.log('Verified: Familiarity screen visible');

  // Verify FO-14 specific option labels
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
    await page.screenshot({ path: 'e2e/debug-fo14-familiarity-button.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step3-question.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step3-continue.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step4-question.png' });
    throw new Error('Step 4 question did not appear');
  }

  if (step4Question.length > 10) {
    console.log('   Verified: LLM-generated context question appeared');
  } else {
    await page.screenshot({ path: 'e2e/debug-fo14-step4-no-question.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step4-next.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step5-question.png' });
    throw new Error('Step 5 question did not appear');
  }

  if (step5Question.length > 10) {
    console.log('   Verified: LLM-generated tone question appeared');
  } else {
    await page.screenshot({ path: 'e2e/debug-fo14-step5-no-question.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step5-next.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step-ready.png' });
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
    await page.screenshot({ path: 'e2e/debug-fo14-step-ready-continue.png' });
    throw new Error('Could not click Continue on StepReady');
  }
  console.log('StepReady completed');
  await sleep(500);
}

/**
 * Review a single batch of affirmation cards with the love/discard pattern.
 * Pattern: love first `loveCutoff` cards, discard the rest.
 *
 * FO-14 counter: "X of 20" counting cards SHOWN (not loved).
 * Uses data-testid="card-counter" and data-testid="card-headline".
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

    // Get counter text via data-testid="card-counter"
    const counter = await getCardCounterText(page);

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
        console.log(`   ${phaseName} Card ${i + 1}/${batchSize}: Love it (counter: ${counter}) - "${cardText.substring(0, 50)}..."`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo14-${phaseName.toLowerCase().replace(/\s/g, '-')}-card-${i + 1}-love.png` });
        throw new Error(`Could not click "Love it" on card ${i + 1} in ${phaseName}`);
      }
    } else {
      const discarded = await clickDiscard(page);
      if (discarded) {
        discardedCount++;
        console.log(`   ${phaseName} Card ${i + 1}/${batchSize}: Discard (counter: ${counter})`);
      } else {
        await page.screenshot({ path: `e2e/debug-fo14-${phaseName.toLowerCase().replace(/\s/g, '-')}-card-${i + 1}-discard.png` });
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
      await page.screenshot({ path: `e2e/debug-fo14-${phaseName.toLowerCase()}-start.png` });
      throw new Error(`${phaseName} card flow did not appear`);
    }
    console.log(`${phaseName} card flow visible`);

    // Verify counter
    const counter = await getCardCounterText(page);
    console.log(`   Initial counter: "${counter}"`);

    // Review 5 cards
    const batch = await reviewCardBatch(page, 5, loveCutoff, phaseName);
    totalLoved += batch.lovedCount;
    totalDiscarded += batch.discardedCount;

    console.log(`   Running total: ${totalLoved} loved, ${totalDiscarded} discarded`);

    // After the last card in a batch, thinking screen appears automatically (no click needed).
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
        await page.screenshot({ path: `e2e/debug-fo14-thinking-${String.fromCharCode(68 + batchIndex).toLowerCase()}.png` });
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
        await page.screenshot({ path: 'e2e/debug-fo14-thinking-g.png' });
        throw new Error('Create-List screen did not appear after Thinking G');
      }
    }
  }

  console.log(`\nPhase 1 totals: ${totalLoved} loved, ${totalDiscarded} discarded`);
  return { totalLoved, totalDiscarded };
}

/**
 * Run Phase 2 card review: 3 sub-batches (8+8+4 = 20 cards) on separate screens
 * with Thinking H/I/J transitions between them.
 *
 * FO-14 counter shows "X of 20" counting cards SHOWN (not loved).
 * Headline: "Does this affirmation resonate with you?" (data-testid="card-headline")
 */
async function runPhase2CardReview(
  page: Page,
  loveCutoff: number
): Promise<{ totalLoved: number; totalDiscarded: number }> {
  let totalLoved = 0;
  let totalDiscarded = 0;

  const subBatches = [
    { size: 8, step: 14, name: 'Phase2-SubBatch1' },
    { size: 8, step: 16, name: 'Phase2-SubBatch2' },
    { size: 4, step: 18, name: 'Phase2-SubBatch3' },
  ];

  for (let subIndex = 0; subIndex < subBatches.length; subIndex++) {
    const { size, step, name } = subBatches[subIndex];

    console.log(`\n--- ${name} (Step ${step}): ${size} cards ---`);

    // Wait for card flow to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: 30000 }
      );
    } catch {
      await page.screenshot({ path: `e2e/debug-fo14-${name.toLowerCase()}-start.png` });
      throw new Error(`${name} card flow did not appear`);
    }
    console.log(`${name} card flow visible`);

    // Verify "X of 20" counter (shown count, not loved count)
    const initialCounter = await getCardCounterText(page);
    console.log(`   Initial counter: "${initialCounter}"`);
    if (subIndex === 0 && initialCounter.includes('of 20')) {
      console.log('   Verified: Phase 2 counter shows "of 20" (shown count)');
    }

    // Verify headline "Does this affirmation resonate with you?"
    if (subIndex === 0) {
      const headline = page.locator('[data-testid="card-headline"]');
      try {
        const headlineText = await headline.textContent({ timeout: 3000 });
        if (headlineText && headlineText.includes('Does this affirmation resonate with you')) {
          console.log('   Verified: Headline "Does this affirmation resonate with you?" visible');
        } else {
          console.log(`   Headline text: "${headlineText}"`);
        }
      } catch {
        console.log('   Could not find card-headline element');
      }
    }

    // Calculate love cutoff for this sub-batch
    // Distribute the loveCutoff across sub-batches proportionally
    const subBatchLoveCutoff = Math.min(loveCutoff, size);

    // Review cards in this sub-batch
    const batch = await reviewCardBatch(page, size, subBatchLoveCutoff, name);
    totalLoved += batch.lovedCount;
    totalDiscarded += batch.discardedCount;

    console.log(`   Running Phase 2 total: ${totalLoved} loved, ${totalDiscarded} discarded`);

    // After each sub-batch, a thinking screen appears
    if (subIndex < subBatches.length - 1) {
      // Thinking H (after sub-batch 1) or Thinking I (after sub-batch 2)
      const thinkingLabel = String.fromCharCode(72 + subIndex); // H, I
      console.log(`\nThinking ${thinkingLabel} (between ${name} and ${subBatches[subIndex + 1].name})...`);
      try {
        await page.waitForFunction(
          () => !!document.querySelector('svg[viewBox="0 0 24 24"]'),
          { timeout: 10000 }
        );
        console.log('   ThinkingScreen detected');
      } catch {
        console.log('   ThinkingScreen may have been too fast to detect');
      }

      // Wait for next sub-batch card flow to appear
      try {
        await page.waitForFunction(
          () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
          { timeout: TIMEOUT }
        );
      } catch {
        await page.screenshot({ path: `e2e/debug-fo14-thinking-${thinkingLabel.toLowerCase()}.png` });
        throw new Error(`Card flow did not reappear after Thinking ${thinkingLabel}`);
      }
      await sleep(500);
    } else {
      // After sub-batch 3 (step 18): Thinking J -> Theme (step 20)
      console.log('\nThinking J (after last Phase 2 sub-batch -> Theme)...');
      const reachedTheme = await waitForThinkingScreenToComplete(
        page,
        'Make your affirmations look beautiful',
        30000
      );
      if (!reachedTheme) {
        await page.screenshot({ path: 'e2e/debug-fo14-thinking-j.png' });
        throw new Error('Theme screen did not appear after Thinking J');
      }
    }
  }

  console.log(`\nPhase 2 totals: ${totalLoved} loved, ${totalDiscarded} discarded`);
  return { totalLoved, totalDiscarded };
}

/**
 * Run post-review steps: Theme (20), Notifications (21), Premium (22), Feed (23).
 */
async function runPostReviewSteps(page: Page): Promise<void> {
  // Step 20: Theme
  console.log('\nStep 20: Theme selection...');
  const hasTheme = await waitForText(page, 'Make your affirmations look beautiful', 10000);
  if (!hasTheme) {
    await page.screenshot({ path: 'e2e/debug-fo14-theme.png' });
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

  // Step 21: Notifications
  console.log('\nStep 21: Notifications...');
  const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
  if (!hasNotifications) {
    await page.screenshot({ path: 'e2e/debug-fo14-notifications.png' });
    throw new Error('Notifications screen did not appear');
  }
  console.log('Verified: Notifications screen visible');
  await sleep(500);
  const clickedNotifications = await clickButton(page, 'Continue');
  if (!clickedNotifications) {
    throw new Error('Could not click Continue on notifications');
  }
  console.log('Notifications completed');

  // Step 22: Premium
  console.log('\nStep 22: Premium...');
  const hasPremium = await waitForText(page, 'More support, whenever you want', 5000);
  if (!hasPremium) {
    await page.screenshot({ path: 'e2e/debug-fo14-premium.png' });
    throw new Error('Premium screen did not appear');
  }
  console.log('Verified: Premium screen visible');
  await sleep(500);
  const clickedPremium = await clickButton(page, 'Not now');
  if (!clickedPremium) {
    throw new Error('Could not click "Not now" on premium');
  }
  console.log('Premium completed');

  // Step 23: Feed
  console.log('\nStep 23: Verifying Feed screen...');
  const hasFeed = await waitForTextContaining(page, 'Welcome to your personal affirmation feed, TestUser', 10000);
  if (!hasFeed) {
    await page.screenshot({ path: 'e2e/debug-fo14-feed.png' });
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
  console.log('[fo-14] TEST 1: HAPPY PATH (All 40 Cards)');
  console.log('='.repeat(60));
  console.log('Brief goal -> context NOT skipped -> all Phase 1 + Phase 2 (3 sub-batches)');

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

    // Navigate to FO-14
    console.log(`\n[fo-14] Opening ${BASE_URL}/fo-14...`);
    await page.goto(`${BASE_URL}/fo-14`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Discovery flow: brief goal -> context NOT skipped
    const { contextSkipped } = await runDiscoveryFlow(page, 'I want to feel more confident');
    if (contextSkipped) {
      console.log('[fo-14] WARNING: Context step was unexpectedly skipped with brief goal text');
    }

    // Step 7: StepReady
    await runStepReady(page);

    // Steps 8-11: Phase 1 card review (4 x 5 cards)
    // Pattern: love first 3, discard last 2 per batch
    const phase1 = await runPhase1CardReview(page, 3);
    console.log(`[fo-14] Phase 1 result: ${phase1.totalLoved} loved, ${phase1.totalDiscarded} discarded`);

    // Step 12: Create-List
    console.log('\n[fo-14] Step 12: Create-List...');
    const hasCreateList = await waitForTextContaining(page, 'already built something personal, TestUser', 5000);
    if (!hasCreateList) {
      await page.screenshot({ path: 'e2e/debug-fo14-create-list.png' });
      throw new Error('Create-List screen did not appear');
    }
    console.log('[fo-14] Verified: Create-List headline with "TestUser" name');

    // Verify loved count mention
    const hasLovedCountText = await waitForTextContaining(page, `${phase1.totalLoved} affirmation`, 3000);
    if (hasLovedCountText) {
      console.log(`[fo-14] Verified: Create-List mentions ${phase1.totalLoved} affirmations`);
    }

    // Click Continue to proceed to Phase 2
    const clickedCreateListContinue = await clickButton(page, 'Continue');
    if (!clickedCreateListContinue) {
      throw new Error('Could not click Continue on Create-List');
    }
    console.log('[fo-14] Create-List: Clicked Continue (proceeding to Phase 2)');

    // Step 13: Thinking (generates Phase 2 sub-batch 1 of 8 cards)
    console.log('\n[fo-14] Step 13: Thinking (generating Phase 2 sub-batch 1)...');
    // Wait for thinking screen then card flow to appear
    try {
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo14-phase2-generation.png' });
      throw new Error('Phase 2 card flow did not appear after generation');
    }
    await sleep(500);

    // Phase 2: 3 sub-batches (8+8+4) with Thinking H/I/J between them
    // Verify counter shows "X of 20" (shown count), headline visible
    // Pattern: love first 6 per sub-batch, discard the rest
    const phase2 = await runPhase2CardReview(page, 6);
    console.log(`[fo-14] Phase 2 result: ${phase2.totalLoved} loved, ${phase2.totalDiscarded} discarded`);

    const totalLoved = phase1.totalLoved + phase2.totalLoved;
    console.log(`[fo-14] Total loved across both phases: ${totalLoved}`);

    // Steps 20-23: Post-review (Theme -> Notifications -> Premium -> Feed)
    await runPostReviewSteps(page);

    // Take final screenshot
    await page.screenshot({ path: 'e2e/fo14-happy-path-feed.png' });

    console.log('\n' + '='.repeat(60));
    console.log('[fo-14] TEST 1 PASSED: Happy Path completed successfully');
    console.log('='.repeat(60));

    await browser.close();
  } catch (error) {
    console.error('\n[fo-14] TEST 1 FAILED:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// ========================================
// Test 2: "Add more later" Variant
// ========================================
async function testAddMoreLater(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('[fo-14] TEST 2: "ADD MORE LATER" VARIANT');
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

    // Navigate to FO-14
    console.log(`\n[fo-14] Opening ${BASE_URL}/fo-14...`);
    await page.goto(`${BASE_URL}/fo-14`, { waitUntil: 'networkidle' });

    if (page.url().includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Discovery flow: brief goal -> context should NOT be skipped
    const { contextSkipped } = await runDiscoveryFlow(page, 'I want more inner peace');
    if (contextSkipped) {
      console.log('[fo-14] NOTE: Context step was skipped despite brief goal (LLM decision)');
    } else {
      console.log('[fo-14] Confirmed: Context step was shown with brief goal text');
    }

    // Step 7: StepReady
    await runStepReady(page);

    // Steps 8-11: Phase 1 card review (4 x 5 cards)
    // Pattern: love first 3, discard last 2 per batch
    const phase1 = await runPhase1CardReview(page, 3);
    console.log(`[fo-14] Phase 1 result: ${phase1.totalLoved} loved, ${phase1.totalDiscarded} discarded`);

    // Step 12: Create-List
    console.log('\n[fo-14] Step 12: Create-List...');
    const hasCreateList = await waitForTextContaining(page, 'already built something personal, TestUser', 5000);
    if (!hasCreateList) {
      await page.screenshot({ path: 'e2e/debug-fo14-test2-create-list.png' });
      throw new Error('Create-List screen did not appear');
    }
    console.log('[fo-14] Verified: Create-List headline with "TestUser" name');

    // Verify "Add more later" link is present
    const addMoreLater = page.locator('[data-testid="add-more-later"]');
    const isAddMoreVisible = await addMoreLater.isVisible({ timeout: 5000 });
    if (!isAddMoreVisible) {
      await page.screenshot({ path: 'e2e/debug-fo14-test2-add-more-later.png' });
      throw new Error('"Add more later" link not visible');
    }
    console.log('[fo-14] Verified: "Add more later" link is visible');

    // Click "Add more later"
    await addMoreLater.click();
    console.log('[fo-14] Clicked "Add more later"');

    // Should jump directly to Theme (step 20), skipping Phase 2 entirely
    console.log('\n[fo-14] Verifying jump to Theme (skipping Phase 2)...');
    const hasTheme = await waitForText(page, 'Make your affirmations look beautiful', 10000);
    if (!hasTheme) {
      await page.screenshot({ path: 'e2e/debug-fo14-test2-theme.png' });
      throw new Error('Theme screen did not appear after "Add more later"');
    }
    console.log('[fo-14] Verified: Jumped directly to Theme (Phase 2 skipped)');

    // Steps 20-23: Post-review (Theme -> Notifications -> Premium -> Feed)
    await runPostReviewSteps(page);

    // Take final screenshot
    await page.screenshot({ path: 'e2e/fo14-add-more-later-feed.png' });

    console.log('\n' + '='.repeat(60));
    console.log('[fo-14] TEST 2 PASSED: "Add more later" Variant completed successfully');
    console.log('='.repeat(60));

    await browser.close();
  } catch (error) {
    console.error('\n[fo-14] TEST 2 FAILED:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// ========================================
// Main runner
// ========================================
async function main(): Promise<void> {
  console.log('[fo-14] FO-14 E2E Test Suite');
  console.log(`[fo-14] Target: ${BASE_URL}/fo-14`);
  console.log(`[fo-14] Timeout: ${TIMEOUT}ms`);
  console.log('');

  const startTime = Date.now();

  // Run both tests sequentially
  await testHappyPath();
  await testAddMoreLater();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log(`[fo-14] ALL FO-14 E2E TESTS PASSED! (${elapsed}s total)`);
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('\n[fo-14] FO-14 E2E TEST SUITE FAILED:', error);
  process.exit(1);
});
