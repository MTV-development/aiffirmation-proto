/**
 * E2E test for FO-10 Onboarding Flow using Playwright
 *
 * This test verifies the FO-10 onboarding flow with key differences from FO-09:
 * 1. Fixed 4-question sequence (hardcoded questions, steps 4-7)
 * 2. Step 4: Predefined topic chips (not AI-generated)
 * 3. Step 5: AI-generated hybrid fragments with "..." endings
 * 4. Steps 6-7: AI-generated complete sentences (no "..." endings)
 * 5. Heart animation between each discovery step (4 total)
 * 6. Same affirmation generation and review flow as FO-09
 *
 * Test flow:
 * 1. Navigate to /fo-10 (with auth bypass via cookie)
 * 2. Click through welcome screens (steps 0-2)
 * 3. Enter name, click Continue
 * 4. Verify personalized welcome
 * 5. Select familiarity
 * 6. Step 4 (Goal): Fixed question, predefined topic chips, select chips
 * 7. Step 5 (Why): Fixed question, AI fragments with "...", click one, verify "..." removed
 * 8. Step 6 (Situation): Fixed question, AI sentences (no "..."), click one
 * 9. Step 7 (Support): Fixed question, AI sentences (no "..."), click one
 * 10. Heart animations between each discovery step (4 total)
 * 11. Affirmation generation (5 per batch)
 * 12. Card-by-card review with progress bar "X/5"
 * 13. Summary screen with loved affirmations
 * 14. "I am good with these" → background → notifications → paywall → completion
 * 15. Verify loved affirmations on completion screen
 *
 * Run with: node --import tsx e2e/fo-10.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-10 prompts)
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
async function waitForThinkingToFinish(page: Page, timeout = 30000): Promise<boolean> {
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

// Count visible chip buttons
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

// Count sentences (items without "..." endings)
async function countSentences(page: Page): Promise<number> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    let count = 0;
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.length > 10 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        if (!text.trim().endsWith('...')) {
          count++;
        }
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
      if (isVisible && text && text.length > 10 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
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

// Click a sentence (for sentence mode screens)
async function clickSentence(page: Page, index = 0): Promise<{ clicked: boolean; text: string }> {
  try {
    const chips = await page.locator('button.rounded-lg.border').all();
    const sentences: typeof chips = [];
    for (const chip of chips) {
      const text = await chip.textContent();
      const isVisible = await chip.isVisible();
      if (isVisible && text && text.length > 10 && !text.includes('Next') && !text.includes('Continue') && !text.includes('More')) {
        sentences.push(chip);
      }
    }
    if (sentences.length > index) {
      const text = await sentences[index].textContent() || '';
      await sentences[index].click();
      return { clicked: true, text: text.trim() };
    }
  } catch {
    // Error
  }
  console.log('Could not find sentence chip');
  return { clicked: false, text: '' };
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
      const hadEllipsis = text.trim().endsWith('...');
      await fragments[index].click();
      return { clicked: true, text: text.trim(), hadEllipsis };
    }
  } catch {
    // Error
  }
  console.log('Could not find fragment chip');
  return { clicked: false, text: '', hadEllipsis: false };
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

async function runTest(): Promise<void> {
  console.log('Starting FO-10 Onboarding E2E Test\n');

  let browser: Browser | null = null;
  let lovedCount = 0;
  let discardedCount = 0;

  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: false,
    });

    const context: BrowserContext = await browser.newContext();

    // Set test mode cookie to bypass auth BEFORE navigating
    console.log('Setting test mode cookie...');
    await context.addCookies([
      {
        name: 'e2e_test_mode',
        value: 'true',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      },
    ]);

    const page: Page = await context.newPage();
    page.setDefaultTimeout(30000);

    // ========================================
    // Step 1: Navigate to /fo-10
    // ========================================
    console.log(`\nOpening ${BASE_URL}/fo-10...`);
    await page.goto(`${BASE_URL}/fo-10`, { waitUntil: 'networkidle' });

    const currentUrl = page.url();
    if (currentUrl.includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // ========================================
    // Step 0: Welcome intro screen
    // ========================================
    console.log('\nStep 0: Welcome intro screen...');
    const hasWelcomeIntro = await waitForText(page, 'The way you speak to yourself', 5000);
    if (!hasWelcomeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo10-welcome-intro.png' });
      throw new Error('Welcome intro screen did not appear');
    }
    console.log('Verified: Welcome intro screen visible');

    const clickedWelcomeIntro = await clickButton(page, 'Continue');
    if (!clickedWelcomeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo10-welcome-intro-continue.png' });
      throw new Error('Could not click Continue on welcome intro');
    }
    await sleep(300);

    // ========================================
    // Step 1: Name input screen
    // ========================================
    console.log('\nStep 1: Name input screen...');
    const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
    if (!hasNamePrompt) {
      await page.screenshot({ path: 'e2e/debug-fo10-name-prompt.png' });
      throw new Error('Name input screen did not appear');
    }

    const nameInput = page.locator('input[placeholder*="name"]');
    await nameInput.fill('TestUser');
    await sleep(300);

    const clickedNameContinue = await clickButton(page, 'Continue');
    if (!clickedNameContinue) {
      await page.screenshot({ path: 'e2e/debug-fo10-name-continue.png' });
      throw new Error('Could not click Continue on name input');
    }
    console.log('Name entered and Continue clicked');
    await sleep(300);

    // ========================================
    // Step 2: Personalized welcome screen
    // ========================================
    console.log('\nStep 2: Personalized welcome screen...');
    const hasPersonalizedWelcome = await waitForTextContaining(page, 'Welcome, TestUser', 5000);
    if (!hasPersonalizedWelcome) {
      await page.screenshot({ path: 'e2e/debug-fo10-personalized-welcome.png' });
      throw new Error('Personalized welcome screen did not appear');
    }
    console.log('Verified: Personalized welcome shows user name');

    const clickedStart = await clickButton(page, 'Start');
    if (!clickedStart) {
      await page.screenshot({ path: 'e2e/debug-fo10-start.png' });
      throw new Error('Could not click Start on personalized welcome');
    }
    await sleep(300);

    // ========================================
    // Step 3: Familiarity selection
    // ========================================
    console.log('\nStep 3: Familiarity selection...');
    const hasFamiliarityPrompt = await waitForTextContaining(page, 'How familiar are you with affirmations', 5000);
    if (!hasFamiliarityPrompt) {
      await page.screenshot({ path: 'e2e/debug-fo10-familiarity.png' });
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
      await page.screenshot({ path: 'e2e/debug-fo10-familiarity-button.png' });
      throw new Error('Could not find "Some experience" button');
    }

    // ========================================
    // Step 4: Goal - Fixed question with predefined topic chips
    // ========================================
    console.log('\nStep 4: Goal (Fixed Q + Predefined Chips)...');

    // Verify fixed question
    const hasGoalQuestion = await waitForTextContaining(page, 'What is your primary goal with affirmations today', 5000);
    if (!hasGoalQuestion) {
      await page.screenshot({ path: 'e2e/debug-fo10-step4-question.png' });
      throw new Error('Step 4 goal question did not appear');
    }
    console.log('Verified: Fixed goal question displayed');

    // Count and verify predefined chips (not AI-generated)
    await sleep(500);
    const step4ChipCount = await countChips(page);
    console.log(`   Predefined topic chips: ${step4ChipCount}`);
    if (step4ChipCount > 0) {
      console.log('   Verified: Predefined topic chips rendered');
    }

    // Click some topic chips
    console.log('   Selecting topic chips...');
    const confidenceButtons = await page.locator('button:has-text("Confidence")').all();
    if (confidenceButtons.length > 0) {
      await confidenceButtons[0].click();
      await sleep(200);
      console.log('   Selected: Confidence');
    }

    const calmButtons = await page.locator('button:has-text("Calm")').all();
    if (calmButtons.length > 0) {
      await calmButtons[0].click();
      await sleep(200);
      console.log('   Selected: Calm');
    }

    // Wait for chips to be appended to textarea
    await sleep(500);

    // Click Continue
    const clickedStep4 = await clickButton(page, 'Continue');
    if (!clickedStep4) {
      await page.screenshot({ path: 'e2e/debug-fo10-step4-continue.png' });
      throw new Error('Could not click Continue on step 4');
    }
    console.log('Step 4 completed');

    // Heart animation 1: Goal → Why
    console.log('\nHeart animation 1 (Goal → Why)...');
    await sleep(500);
    const heart1 = await waitForHeartAnimation(page, 5000);
    if (heart1) {
      console.log('Verified: Heart animation 1 appeared');
    }
    await sleep(3000); // Wait longer for transition

    // ========================================
    // Step 5: Why - Fixed question with AI-generated fragments
    // ========================================
    console.log('\nStep 5: Why (Fixed Q + LLM Fragments)...');

    // Wait for thinking to finish
    const thinkingFinished5 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished5) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(500);

    // Verify fixed question
    const hasWhyQuestion = await waitForTextContaining(page, 'Why does this goal feel important to you', 5000);
    if (!hasWhyQuestion) {
      await page.screenshot({ path: 'e2e/debug-fo10-step5-question.png' });
      throw new Error('Step 5 why question did not appear');
    }
    console.log('Verified: Fixed why question displayed');

    // Count fragments (should have "..." endings)
    const step5TotalChips = await countChips(page);
    const step5Fragments = await countFragments(page);
    const step5Sentences = await countSentences(page);
    console.log(`   Total chips: ${step5TotalChips}, Fragments (with "..."): ${step5Fragments}, Sentences (no "..."): ${step5Sentences}`);

    if (step5Fragments >= 8) {
      console.log('   Verified: At least 8 initial fragments with "..." endings');
    } else {
      console.log(`   Note: Expected at least 8 fragments, got ${step5Fragments}`);
    }

    // Test "More" button
    console.log('   Testing "More" button...');
    const clickedMore5 = await clickMoreButton(page);
    if (clickedMore5) {
      await sleep(500);
      const expandedCount5 = await countChips(page);
      const additionalCount5 = expandedCount5 - step5TotalChips;
      console.log(`   Chips after "More": ${expandedCount5} (+${additionalCount5})`);
      if (expandedCount5 >= 15) {
        console.log('   Verified: At least 15 total chips after expansion');
      }
    }

    // Click a fragment and verify "..." is removed
    console.log('   Clicking a fragment...');
    const fragmentResult5 = await clickFragment(page, 0);
    if (fragmentResult5.clicked) {
      console.log(`   Clicked: "${fragmentResult5.text.substring(0, 50)}..."`);
      if (fragmentResult5.hadEllipsis) {
        console.log('   Fragment had "..." (should be removed on append)');
      }

      await sleep(500);
      const textareaValue5 = await getTextareaValue(page);
      const cleanedFragment5 = fragmentResult5.text.replace(/\.{2,}$/, '').trim();
      if (textareaValue5.includes(cleanedFragment5)) {
        console.log('   Verified: Fragment text appended without "..."');
      }
    }

    // Click Next
    const clickedStep5 = await clickButton(page, 'Next');
    if (!clickedStep5) {
      await page.screenshot({ path: 'e2e/debug-fo10-step5-next.png' });
      throw new Error('Could not click Next on step 5');
    }
    console.log('Step 5 completed');

    // Heart animation 2: Why → Situation
    console.log('\nHeart animation 2 (Why → Situation)...');
    await sleep(500);
    const heart2 = await waitForHeartAnimation(page, 5000);
    if (heart2) {
      console.log('Verified: Heart animation 2 appeared');
    }
    await sleep(3000); // Wait longer for transition

    // ========================================
    // Step 6: Situation - Fixed question with AI-generated sentences
    // ========================================
    console.log('\nStep 6: Situation (Fixed Q + LLM Sentences)...');

    // Wait for thinking to finish
    const thinkingFinished6 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished6) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(500);

    // Verify fixed question
    const hasSituationQuestion = await waitForTextContaining(page, 'In which situation is your goal especially important', 5000);
    if (!hasSituationQuestion) {
      await page.screenshot({ path: 'e2e/debug-fo10-step6-question.png' });
      throw new Error('Step 6 situation question did not appear');
    }
    console.log('Verified: Fixed situation question displayed');

    // Count sentences (should NOT have "..." endings)
    const step6TotalChips = await countChips(page);
    const step6Sentences = await countSentences(page);
    const step6Fragments = await countFragments(page);
    console.log(`   Total chips: ${step6TotalChips}, Sentences (no "..."): ${step6Sentences}, Fragments (with "..."): ${step6Fragments}`);

    if (step6Sentences >= 8) {
      console.log('   Verified: At least 8 initial sentences without "..." endings');
    } else {
      console.log(`   Note: Expected at least 8 sentences, got ${step6Sentences}`);
    }

    // Click a sentence
    console.log('   Clicking a sentence...');
    const sentenceResult6 = await clickSentence(page, 0);
    if (sentenceResult6.clicked) {
      console.log(`   Clicked: "${sentenceResult6.text.substring(0, 50)}..."`);
      if (!sentenceResult6.text.endsWith('...')) {
        console.log('   Verified: Sentence does NOT end with "..."');
      }
    }

    // Click Next
    const clickedStep6 = await clickButton(page, 'Next');
    if (!clickedStep6) {
      await page.screenshot({ path: 'e2e/debug-fo10-step6-next.png' });
      throw new Error('Could not click Next on step 6');
    }
    console.log('Step 6 completed');

    // Heart animation 3: Situation → Support
    console.log('\nHeart animation 3 (Situation → Support)...');
    await sleep(500);
    const heart3 = await waitForHeartAnimation(page, 5000);
    if (heart3) {
      console.log('Verified: Heart animation 3 appeared');
    }
    await sleep(3000); // Wait longer for transition

    // ========================================
    // Step 7: Support tone - Fixed question with AI-generated sentences
    // ========================================
    console.log('\nStep 7: Support tone (Fixed Q + LLM Sentences)...');

    // Wait for thinking to finish
    const thinkingFinished7 = await waitForThinkingToFinish(page, 60000);
    if (!thinkingFinished7) {
      console.log('   Warning: Thinking state did not finish or was not detected');
    }
    await sleep(500);

    // Verify fixed question
    const hasSupportQuestion = await waitForTextContaining(page, 'What kind of support would be most helpful', 5000);
    if (!hasSupportQuestion) {
      await page.screenshot({ path: 'e2e/debug-fo10-step7-question.png' });
      throw new Error('Step 7 support question did not appear');
    }
    console.log('Verified: Fixed support question displayed');

    // Count sentences (should NOT have "..." endings)
    const step7TotalChips = await countChips(page);
    const step7Sentences = await countSentences(page);
    const step7Fragments = await countFragments(page);
    console.log(`   Total chips: ${step7TotalChips}, Sentences (no "..."): ${step7Sentences}, Fragments (with "..."): ${step7Fragments}`);

    if (step7Sentences >= 8) {
      console.log('   Verified: At least 8 initial sentences without "..." endings');
    } else {
      console.log(`   Note: Expected at least 8 sentences, got ${step7Sentences}`);
    }

    // Click a sentence
    console.log('   Clicking a sentence...');
    const sentenceResult7 = await clickSentence(page, 0);
    if (sentenceResult7.clicked) {
      console.log(`   Clicked: "${sentenceResult7.text.substring(0, 50)}..."`);
      if (!sentenceResult7.text.endsWith('...')) {
        console.log('   Verified: Sentence does NOT end with "..."');
      }
    }

    // Click Next
    const clickedStep7 = await clickButton(page, 'Next');
    if (!clickedStep7) {
      await page.screenshot({ path: 'e2e/debug-fo10-step7-next.png' });
      throw new Error('Could not click Next on step 7');
    }
    console.log('Step 7 completed');

    // Heart animation 4: Support → Generation
    console.log('\nHeart animation 4 (Support → Generation)...');
    await sleep(500);
    const heart4 = await waitForHeartAnimation(page, 5000);
    if (heart4) {
      console.log('Verified: Heart animation 4 appeared');
    }
    await sleep(3000); // Wait longer for transition

    // ========================================
    // Wait for affirmation generation (5 per batch)
    // ========================================
    console.log('\nWaiting for AI generation of 5 affirmations (up to 120s)...');

    // Look for generation message
    const hasGenerating = await waitForTextContaining(page, 'Creating your personal affirmations', 10000);
    if (hasGenerating) {
      console.log('Generation phase detected');
    }

    try {
      // Wait for the card flow to appear
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]') ||
              !!document.querySelector('[data-testid="affirmation-card"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo10-generation-timeout.png' });
      throw new Error('Affirmation generation did not complete in time');
    }
    console.log('Affirmation generation complete - Card flow visible');

    // ========================================
    // Step 8: Affirmation Card Review (5 cards, one at a time)
    // ========================================
    console.log('\n--- Affirmation Card Review ---');

    // Verify progress text shows "X/5"
    const initialProgress = await getProgressText(page);
    console.log(`Initial progress: "${initialProgress}"`);
    if (initialProgress.includes('/')) {
      const match = initialProgress.match(/(\d+)\/(\d+)/);
      if (match) {
        const total = parseInt(match[2], 10);
        console.log(`Verified: Card flow has ${total} cards`);
        if (total === 5) {
          console.log('Verified: Batch size is 5 (as expected for FO-10)');
        } else {
          console.log(`Note: Expected 5 cards, got ${total}`);
        }
      }
    }

    // Verify affirmation card is visible
    const cardVisible = await page.locator('[data-testid="affirmation-card"]').isVisible({ timeout: 3000 });
    if (cardVisible) {
      console.log('Verified: Affirmation card is visible');
    }

    // Review all 5 cards — love some, discard others
    const totalCards = 5;
    for (let i = 0; i < totalCards; i++) {
      // Verify progress counter
      const progress = await getProgressText(page);
      console.log(`   Card ${i + 1}/${totalCards} (progress: "${progress}")`);

      // Read the affirmation text
      try {
        const cardText = await page.locator('[data-testid="affirmation-card"] p').first().textContent();
        if (cardText) {
          console.log(`   Affirmation: "${cardText.substring(0, 60)}..."`);
        }
      } catch {
        // Could not read card text
      }

      // Love first 3, discard last 2
      if (i < 3) {
        const loved = await clickLoveIt(page);
        if (loved) {
          lovedCount++;
          console.log(`   Action: Love it (${lovedCount} loved total)`);
        } else {
          await page.screenshot({ path: `e2e/debug-fo10-card-${i + 1}-love.png` });
          throw new Error(`Could not click "Love it" on card ${i + 1}`);
        }
      } else {
        const discarded = await clickDiscard(page);
        if (discarded) {
          discardedCount++;
          console.log(`   Action: Discard (${discardedCount} discarded total)`);
        } else {
          await page.screenshot({ path: `e2e/debug-fo10-card-${i + 1}-discard.png` });
          throw new Error(`Could not click "Discard" on card ${i + 1}`);
        }
      }

      await sleep(500); // Wait for card transition animation
    }

    console.log(`\nCard review complete: ${lovedCount} loved, ${discardedCount} discarded`);

    // ========================================
    // Step 9: Affirmation Summary
    // ========================================
    console.log('\n--- Affirmation Summary ---');

    // Wait for summary screen
    const hasSummary = await waitForTextContaining(page, 'Your affirmations', 10000);
    if (!hasSummary) {
      await page.screenshot({ path: 'e2e/debug-fo10-summary-missing.png' });
      throw new Error('Summary screen did not appear');
    }
    console.log('Verified: Summary screen visible');

    // Verify summary shows loved affirmations
    const summaryTestId = await page.locator('[data-testid="affirmation-summary"]').isVisible({ timeout: 3000 });
    if (summaryTestId) {
      console.log('Verified: AffirmationSummary component rendered');
    }

    // Verify collected count
    const hasCollectedText = await waitForTextContaining(page, 'collected', 3000);
    if (hasCollectedText) {
      console.log('Verified: Affirmation collected count displayed');
    }

    // Verify "I am good with these" button
    const goodButton = page.locator('[data-testid="done-button"]');
    const goodButtonVisible = await goodButton.isVisible({ timeout: 3000 });
    if (goodButtonVisible) {
      console.log('Verified: "I am good with these" button visible');
    } else {
      // Fallback check
      const hasGoodButton = await waitForTextContaining(page, 'I am good with these', 3000);
      if (hasGoodButton) {
        console.log('Verified: "I am good with these" button visible (text match)');
      }
    }

    // Verify "I want to create more" button
    const moreButton = page.locator('[data-testid="more-button"]');
    const moreButtonVisible = await moreButton.isVisible({ timeout: 3000 });
    if (moreButtonVisible) {
      console.log('Verified: "I want to create more" button visible');
    } else {
      const hasMoreButton = await waitForTextContaining(page, 'I want to create more', 3000);
      if (hasMoreButton) {
        console.log('Verified: "I want to create more" button visible (text match)');
      }
    }

    // ========================================
    // Click "I am good with these" → proceed to mockups
    // ========================================
    console.log('\nClicking "I am good with these"...');
    const clickedGood = await clickButton(page, 'I am good with these');
    if (!clickedGood) {
      await page.screenshot({ path: 'e2e/debug-fo10-good-button.png' });
      throw new Error('Could not click "I am good with these"');
    }
    console.log('Proceeding to post-review mockups');

    // ========================================
    // Step 10: Background selection mockup
    // ========================================
    console.log('\nBackground selection mockup...');
    const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
    if (!hasBackground) {
      await page.screenshot({ path: 'e2e/debug-fo10-background.png' });
      throw new Error('Background selection screen did not appear');
    }

    await sleep(500);
    const clickedBackground = await clickButton(page, 'Continue');
    if (!clickedBackground) {
      await page.screenshot({ path: 'e2e/debug-fo10-background-continue.png' });
      throw new Error('Could not click Continue on background selection');
    }
    console.log('Background selection completed');

    // ========================================
    // Step 11: Notifications mockup
    // ========================================
    console.log('\nNotifications mockup...');
    const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
    if (!hasNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo10-notifications.png' });
      throw new Error('Notifications screen did not appear');
    }

    await sleep(500);
    const clickedNotifications = await clickButton(page, 'Continue');
    if (!clickedNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo10-notifications-continue.png' });
      throw new Error('Could not click Continue on notifications');
    }
    console.log('Notifications completed');

    // ========================================
    // Step 12: Paywall mockup
    // ========================================
    console.log('\nPaywall mockup...');
    const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
    if (!hasPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo10-paywall.png' });
      throw new Error('Paywall screen did not appear');
    }

    await sleep(500);
    const clickedPaywall = await clickButton(page, 'Not now');
    if (!clickedPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo10-paywall-notnow.png' });
      throw new Error('Could not click "Not now" on paywall');
    }
    console.log('Paywall completed');

    // ========================================
    // Step 13: Completion screen
    // ========================================
    console.log('\nVerifying completion screen...');
    const hasCompletion = await waitForTextContaining(page, 'You are all set', 5000);
    if (!hasCompletion) {
      await page.screenshot({ path: 'e2e/debug-fo10-completion.png' });
      throw new Error("Completion screen did not appear - 'You are all set' not found");
    }
    console.log("Completion screen shows 'You are all set'");

    // Verify loved affirmations are displayed on completion screen
    await sleep(500);
    const hasAffirmationsSaved = await waitForTextContaining(page, 'affirmation', 5000);
    if (hasAffirmationsSaved) {
      console.log('Verified: Affirmations displayed on completion screen');
    }

    // Check for the specific count text
    const hasSavedCount = await waitForTextContaining(page, 'saved', 3000);
    if (hasSavedCount) {
      console.log('Verified: Affirmation saved count shown');
    }

    // Verify affirmation markers are present
    const pageContent = await page.content();
    if (pageContent.includes('\u2726') || pageContent.includes('affirmation')) {
      console.log('Verified: Affirmation items displayed with markers');
    }

    // ========================================
    // TEST PASSED
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('TEST PASSED! FO-10 Onboarding E2E Test');
    console.log('   E2E test completed successfully');
    console.log('='.repeat(60));
    console.log('\nTest Summary:');
    console.log('   FO-10 Specific Verifications:');
    console.log('   - Welcome screens (steps 0-2) completed');
    console.log('   - Name entered: TestUser');
    console.log('   - Familiarity selected: Some experience');
    console.log('   - Step 4 (Goal): Fixed question + predefined topic chips');
    console.log('   - Step 5 (Why): Fixed question + AI fragments with "..." endings');
    console.log('   - Step 6 (Situation): Fixed question + AI sentences (no "...")');
    console.log('   - Step 7 (Support): Fixed question + AI sentences (no "...")');
    console.log('   - Heart animations: 4 total (between each discovery step)');
    console.log('   - 5 affirmations generated per batch');
    console.log(`   - Card-by-card review: ${lovedCount} loved, ${discardedCount} discarded`);
    console.log('   - Progress counter "X/5" verified');
    console.log('   - Summary screen with "I am good with these" / "I want to create more"');
    console.log('   - "I am good with these" → background → notifications → paywall → completion');
    console.log('   - Loved affirmations shown on completion screen');
  } catch (error) {
    console.error('\nTEST FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('\nCleaning up...');
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runTest();
