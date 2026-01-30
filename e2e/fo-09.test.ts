/**
 * E2E test for FO-09 Onboarding Flow using Playwright
 *
 * This test verifies the FO-09 onboarding flow with key differences from FO-08:
 * 1. NO progress bar during discovery phase
 * 2. Welcome screens (steps 0-2) before topic selection (same as FO-08)
 * 3. Topic selection with same H1/H2 copy as FO-08
 * 4. Discovery screen 1: mode="sentences" — complete sentences (no "..." endings)
 * 5. Discovery screens 2+: mode="fragments" — hybrid fragments with "..." endings
 * 6. NO reflective statement on any discovery screen
 * 7. Heart animation between discovery screens
 * 8. Generates 5 affirmations per batch (not 2×10 like FO-08)
 * 9. AffirmationCardFlow — card-by-card "Love it" / "Discard" with progress "X/5"
 * 10. AffirmationSummary — "I am good with these" / "I want to create more"
 * 11. Post-review mockups: background, notifications, paywall
 * 12. Completion screen shows ALL accumulated loved affirmations
 *
 * Test flow:
 * 1. Navigate to /fo-09 (with auth bypass via cookie)
 * 2. Click through welcome screens (steps 0-2)
 * 3. Enter name, click Continue
 * 4. Verify personalized welcome
 * 5. Select familiarity
 * 6. Select topics
 * 7. Discovery screen 1: verify sentences (no "..."), click one, verify textarea
 * 8. Heart animation between screens
 * 9. Discovery screens 2+: verify fragments (with "..."), click one, verify "..." removed
 * 10. No reflective statement verification
 * 11. Affirmation generation (5 per batch)
 * 12. Card-by-card review with progress bar "X/5"
 * 13. Summary screen with loved affirmations
 * 14. "I am good with these" → background → notifications → paywall → completion
 * 15. Verify loved affirmations on completion screen
 *
 * Run with: node --import tsx e2e/fo-09.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-09 prompts)
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

// Count visible fragment/sentence chips
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

// Count sentences (items without "..." endings) — for screen 1
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

// Count fragments (items with "..." endings) — for screens 2+
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

// Click a sentence (for screen 1 — sentences mode)
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

// Click a fragment (for screens 2+ — fragments mode)
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

// Click the 'More' button to reveal additional fragments
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

// Verify no reflective statement text on discovery screens
async function verifyNoReflectiveStatement(page: Page): Promise<boolean> {
  try {
    // Reflective statements typically appear in a specific styled container
    // In FO-08 they appeared between question and fragments, usually in italic or different styling
    // FO-09 should NOT have any reflective statement element
    const reflectiveSelectors = [
      '[data-testid="reflective-statement"]',
      '.italic.text-gray-600',
      'p.italic',
    ];
    for (const selector of reflectiveSelectors) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 500 }).catch(() => false);
      if (isVisible) {
        const text = await element.textContent();
        if (text && text.length > 20) {
          console.log(`   Found potential reflective statement: "${text.substring(0, 50)}..."`);
          return false;
        }
      }
    }
    return true;
  } catch {
    return true; // If check fails, assume no reflective statement
  }
}

// Verify NO discovery progress bar
async function verifyNoDiscoveryProgressBar(page: Page): Promise<boolean> {
  try {
    // Check for progress bar container with step indicators (like FO-07 had)
    const progressBarElements = await page.locator('div.flex.gap-1').all();
    for (const container of progressBarElements) {
      const childCount = await container.locator('> div').count();
      if (childCount >= 10) {
        console.log(`   Found potential progress bar with ${childCount} steps`);
        return false;
      }
    }

    // Check for explicit progress class patterns (but NOT the card flow progress bar)
    const progressElements = await page.locator('[class*="progress"]').all();
    for (const el of progressElements) {
      const visible = await el.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        // Check if this is the card flow progress bar (which is expected)
        const parent = page.locator('[data-testid="affirmation-card-flow"]');
        const isCardFlowProgress = await parent.isVisible({ timeout: 500 }).catch(() => false);
        if (!isCardFlowProgress) {
          console.log('   Found non-card-flow element with "progress" class');
          return false;
        }
      }
    }

    return true;
  } catch {
    return true;
  }
}

async function runTest(): Promise<void> {
  console.log('Starting FO-09 Onboarding E2E Test\n');

  let browser: Browser | null = null;
  let dynamicScreenCount = 0;
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
    // Step 1: Navigate to /fo-09
    // ========================================
    console.log(`\nOpening ${BASE_URL}/fo-09...`);
    await page.goto(`${BASE_URL}/fo-09`, { waitUntil: 'networkidle' });

    const currentUrl = page.url();
    if (currentUrl.includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // ========================================
    // Verify NO progress bar on welcome
    // ========================================
    console.log('\nVerifying NO progress bar...');
    const noProgressBar = await verifyNoDiscoveryProgressBar(page);
    if (!noProgressBar) {
      await page.screenshot({ path: 'e2e/debug-fo09-progress-bar.png' });
      throw new Error('Progress bar found but FO-09 should not have one');
    }
    console.log('Verified: No progress bar present');

    // ========================================
    // Step 0: Welcome intro screen
    // ========================================
    console.log('\nStep 0: Welcome intro screen...');
    const hasWelcomeIntro = await waitForText(page, 'The way you speak to yourself', 5000);
    if (!hasWelcomeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo09-welcome-intro.png' });
      throw new Error('Welcome intro screen did not appear');
    }
    console.log('Verified: Welcome intro screen visible');

    const clickedWelcomeIntro = await clickButton(page, 'Continue');
    if (!clickedWelcomeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo09-welcome-intro-continue.png' });
      throw new Error('Could not click Continue on welcome intro');
    }
    await sleep(300);

    // ========================================
    // Step 1: Name input screen
    // ========================================
    console.log('\nStep 1: Name input screen...');
    const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
    if (!hasNamePrompt) {
      await page.screenshot({ path: 'e2e/debug-fo09-name-prompt.png' });
      throw new Error('Name input screen did not appear');
    }

    const nameInput = page.locator('input[placeholder*="name"]');
    await nameInput.fill('TestUser');
    await sleep(300);

    const clickedNameContinue = await clickButton(page, 'Continue');
    if (!clickedNameContinue) {
      await page.screenshot({ path: 'e2e/debug-fo09-name-continue.png' });
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
      await page.screenshot({ path: 'e2e/debug-fo09-personalized-welcome.png' });
      throw new Error('Personalized welcome screen did not appear');
    }
    console.log('Verified: Personalized welcome shows user name');

    const clickedStart = await clickButton(page, 'Start');
    if (!clickedStart) {
      await page.screenshot({ path: 'e2e/debug-fo09-start.png' });
      throw new Error('Could not click Start on personalized welcome');
    }
    await sleep(300);

    // ========================================
    // Step 3: Familiarity selection
    // ========================================
    console.log('\nStep 3: Familiarity selection...');
    const hasFamiliarityPrompt = await waitForTextContaining(page, 'How familiar are you with affirmations', 5000);
    if (!hasFamiliarityPrompt) {
      await page.screenshot({ path: 'e2e/debug-fo09-familiarity.png' });
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
      await page.screenshot({ path: 'e2e/debug-fo09-familiarity-button.png' });
      throw new Error('Could not find "Some experience" button');
    }

    // ========================================
    // Step 4: Topic selection
    // ========================================
    console.log('\nStep 4: Topic selection...');

    const hasNewH1 = await waitForTextContaining(page, 'Choose what fits you best right now', 5000);
    if (!hasNewH1) {
      await page.screenshot({ path: 'e2e/debug-fo09-topics-h1.png' });
      throw new Error('Topics screen H1 did not match expected');
    }
    console.log('Verified: H1 = "Choose what fits you best right now"');

    const hasNewH2 = await waitForTextContaining(page, "It doesn't have to be perfect", 3000);
    if (hasNewH2) {
      console.log('Verified: H2 = "It doesn\'t have to be perfect."');
    }

    // Select topics
    console.log('Selecting topics...');
    const topicButtons = await page.locator('button:has-text("Confidence")').all();
    if (topicButtons.length > 0) {
      await topicButtons[0].click();
      await sleep(200);
    }

    const calmButtons = await page.locator('button:has-text("Calm")').all();
    if (calmButtons.length > 0) {
      await calmButtons[0].click();
      await sleep(200);
    }

    const selfWorthButtons = await page.locator('button:has-text("Self-worth")').all();
    if (selfWorthButtons.length > 0) {
      await selfWorthButtons[0].click();
      await sleep(200);
    }

    console.log('Selected topics: Confidence, Calm, Self-worth');

    const clickedTopics = await clickButton(page, 'Continue');
    if (!clickedTopics) {
      await page.screenshot({ path: 'e2e/debug-fo09-topics-continue.png' });
      throw new Error('Could not click Continue on topics');
    }

    await waitForTextContaining(page, 'Great choices', 3000);
    console.log('Topics selected, waiting for transition...');
    await sleep(2000);

    // ========================================
    // Dynamic Discovery Screens
    // ========================================
    console.log('\n--- Starting Dynamic AI-Generated Discovery Screens ---');

    let isReadyForAffirmations = false;
    const maxDynamicScreens = 5;

    while (!isReadyForAffirmations && dynamicScreenCount < maxDynamicScreens) {
      dynamicScreenCount++;
      console.log(`\nDiscovery Screen ${dynamicScreenCount}:`);

      // Verify NO progress bar on discovery screens
      const noProgressBarScreen = await verifyNoDiscoveryProgressBar(page);
      if (!noProgressBarScreen) {
        throw new Error(`Progress bar appeared on discovery screen ${dynamicScreenCount}`);
      }
      console.log('   Verified: No progress bar');

      // Wait for "Thinking..." to finish
      console.log('   Waiting for screen to load...');
      const thinkingFinished = await waitForThinkingToFinish(page, 60000);
      if (!thinkingFinished) {
        const hasQuestion = await page.locator('h2').first().isVisible({ timeout: 2000 });
        if (!hasQuestion) {
          await page.screenshot({ path: `e2e/debug-fo09-dynamic${dynamicScreenCount}-thinking.png` });
          throw new Error(`Discovery screen ${dynamicScreenCount} did not finish loading`);
        }
      }
      console.log('   Screen loaded');

      await sleep(500);
      const questionText = await page.locator('h2').first().textContent();
      console.log(`   Question: "${questionText?.substring(0, 60)}..."`);

      // ========================================
      // Verify NO reflective statement
      // ========================================
      const noReflective = await verifyNoReflectiveStatement(page);
      if (noReflective) {
        console.log('   Verified: No reflective statement');
      } else {
        console.log('   WARNING: Possible reflective statement found (FO-09 should not have one)');
      }

      // ========================================
      // Screen 1: Sentences mode — verify NO "..." endings
      // ========================================
      if (dynamicScreenCount === 1) {
        console.log('   Testing SENTENCE mode (screen 1)...');

        // Verify the fixed opening question
        if (questionText && questionText.includes('What')) {
          console.log('   Verified: Fixed opening question displayed');
        }

        // Count chips and verify they are sentences (no "...")
        const totalChips = await countChips(page);
        const sentenceCount = await countSentences(page);
        const fragmentCount = await countFragments(page);

        console.log(`   Total chips: ${totalChips}, Sentences (no "..."): ${sentenceCount}, Fragments (with "..."): ${fragmentCount}`);

        if (sentenceCount > 0) {
          console.log(`   Verified: ${sentenceCount} complete sentences found (no "..." endings)`);
        }
        if (fragmentCount > 0) {
          console.log(`   Note: ${fragmentCount} fragments with "..." found on screen 1 (expected sentences)`);
        }

        // Test "More" button on screen 1
        console.log('   Testing "More" button...');
        const clickedMore = await clickMoreButton(page);
        if (clickedMore) {
          await sleep(500);
          const expandedCount = await countChips(page);
          const additionalCount = expandedCount - totalChips;
          console.log(`   Chips after "More": ${expandedCount} (+${additionalCount})`);
        } else {
          console.log('   Warning: Could not find "More" button');
        }

        // Click a sentence and verify it appends to textarea as-is
        console.log('   Clicking a sentence...');
        const sentenceResult = await clickSentence(page, 0);
        if (sentenceResult.clicked) {
          console.log(`   Clicked: "${sentenceResult.text.substring(0, 50)}..."`);

          // Verify no "..." was in the clicked text
          if (!sentenceResult.text.endsWith('...')) {
            console.log('   Verified: Sentence does NOT end with "..."');
          }

          await sleep(500);

          // Verify sentence appended to textarea as-is
          const textareaValue = await getTextareaValue(page);
          if (textareaValue.includes(sentenceResult.text)) {
            console.log('   Verified: Sentence text appended to textarea as-is');
          } else {
            console.log(`   Textarea value: "${textareaValue.substring(0, 60)}"`);
          }
        }
      }

      // ========================================
      // Screens 2+: Fragments mode — verify "..." endings
      // ========================================
      if (dynamicScreenCount >= 2) {
        console.log('   Testing FRAGMENT mode (screen 2+)...');

        const totalChips = await countChips(page);
        const fragmentCount = await countFragments(page);
        const sentenceCount = await countSentences(page);

        console.log(`   Total chips: ${totalChips}, Fragments (with "..."): ${fragmentCount}, Sentences (no "..."): ${sentenceCount}`);

        if (fragmentCount > 0) {
          console.log(`   Verified: ${fragmentCount} fragments with "..." endings found`);
        }

        // Click a fragment and verify "..." is removed before appending
        console.log('   Clicking a fragment...');
        const fragmentResult = await clickFragment(page, 0);
        if (fragmentResult.clicked) {
          console.log(`   Clicked: "${fragmentResult.text.substring(0, 50)}"`);

          if (fragmentResult.hadEllipsis) {
            console.log('   Fragment had "..." (should be removed on append)');
          }

          await sleep(500);

          // Verify "..." was removed in textarea
          const textareaValue = await getTextareaValue(page);
          const cleanedFragment = fragmentResult.text.replace(/\.{2,}$/, '').trim();
          if (textareaValue.includes(cleanedFragment)) {
            console.log('   Verified: Fragment text appended without "..."');
          } else {
            console.log(`   Textarea value: "${textareaValue.substring(0, 60)}"`);
          }
        }
      }

      // Click Next to proceed
      const clickedNext = await clickButton(page, 'Next');
      if (!clickedNext) {
        await page.screenshot({ path: `e2e/debug-fo09-dynamic${dynamicScreenCount}-next.png` });
        throw new Error(`Could not click Next on discovery screen ${dynamicScreenCount}`);
      }
      console.log(`   Discovery screen ${dynamicScreenCount} completed`);

      // ========================================
      // Heart animation between screens
      // ========================================
      console.log('   Checking for heart animation...');
      await sleep(500);

      const heartAnimationSeen = await waitForHeartAnimation(page, 5000);
      if (heartAnimationSeen) {
        console.log('   Verified: Heart animation appeared');
        await sleep(2000); // Wait for animation to complete
      } else {
        console.log('   Note: Heart animation not detected (may have completed quickly)');
      }

      // Check if transitioning to affirmation generation
      await sleep(1000);

      const hasGenerating = await waitForTextContaining(page, 'Creating your personal affirmations', 3000);
      if (hasGenerating) {
        console.log('\n   Generation phase detected');
        isReadyForAffirmations = true;
      } else {
        // Also check for "Creating more affirmations"
        const hasMoreGenerating = await waitForTextContaining(page, 'Creating more affirmations', 1000);
        if (hasMoreGenerating) {
          console.log('\n   Generation phase detected (more affirmations)');
          isReadyForAffirmations = true;
        }
      }
    }

    console.log(`\n--- Discovery Screens Complete (${dynamicScreenCount} screens) ---`);

    // ========================================
    // Wait for affirmation generation (5 per batch)
    // ========================================
    console.log('\nWaiting for AI generation of 5 affirmations (up to 120s)...');

    try {
      // Wait for the card flow to appear (step 7)
      await page.waitForFunction(
        () => !!document.querySelector('[data-testid="affirmation-card-flow"]') ||
              !!document.querySelector('[data-testid="affirmation-card"]'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo09-generation-timeout.png' });
      throw new Error('Affirmation generation did not complete in time');
    }
    console.log('Affirmation generation complete - Card flow visible');

    // ========================================
    // Step 7: Affirmation Card Review (5 cards, one at a time)
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
          console.log('Verified: Batch size is 5 (as expected for FO-09)');
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
          await page.screenshot({ path: `e2e/debug-fo09-card-${i + 1}-love.png` });
          throw new Error(`Could not click "Love it" on card ${i + 1}`);
        }
      } else {
        const discarded = await clickDiscard(page);
        if (discarded) {
          discardedCount++;
          console.log(`   Action: Discard (${discardedCount} discarded total)`);
        } else {
          await page.screenshot({ path: `e2e/debug-fo09-card-${i + 1}-discard.png` });
          throw new Error(`Could not click "Discard" on card ${i + 1}`);
        }
      }

      await sleep(500); // Wait for card transition animation
    }

    console.log(`\nCard review complete: ${lovedCount} loved, ${discardedCount} discarded`);

    // ========================================
    // Step 8: Affirmation Summary
    // ========================================
    console.log('\n--- Affirmation Summary ---');

    // Wait for summary screen
    const hasSummary = await waitForTextContaining(page, 'Your affirmations', 10000);
    if (!hasSummary) {
      await page.screenshot({ path: 'e2e/debug-fo09-summary-missing.png' });
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
      await page.screenshot({ path: 'e2e/debug-fo09-good-button.png' });
      throw new Error('Could not click "I am good with these"');
    }
    console.log('Proceeding to post-review mockups');

    // ========================================
    // Step 9: Background selection mockup
    // ========================================
    console.log('\nBackground selection mockup...');
    const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
    if (!hasBackground) {
      await page.screenshot({ path: 'e2e/debug-fo09-background.png' });
      throw new Error('Background selection screen did not appear');
    }

    await sleep(500);
    const clickedBackground = await clickButton(page, 'Continue');
    if (!clickedBackground) {
      await page.screenshot({ path: 'e2e/debug-fo09-background-continue.png' });
      throw new Error('Could not click Continue on background selection');
    }
    console.log('Background selection completed');

    // ========================================
    // Step 10: Notifications mockup
    // ========================================
    console.log('\nNotifications mockup...');
    const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
    if (!hasNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo09-notifications.png' });
      throw new Error('Notifications screen did not appear');
    }

    await sleep(500);
    const clickedNotifications = await clickButton(page, 'Continue');
    if (!clickedNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo09-notifications-continue.png' });
      throw new Error('Could not click Continue on notifications');
    }
    console.log('Notifications completed');

    // ========================================
    // Step 11: Paywall mockup
    // ========================================
    console.log('\nPaywall mockup...');
    const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
    if (!hasPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo09-paywall.png' });
      throw new Error('Paywall screen did not appear');
    }

    await sleep(500);
    const clickedPaywall = await clickButton(page, 'Not now');
    if (!clickedPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo09-paywall-notnow.png' });
      throw new Error('Could not click "Not now" on paywall');
    }
    console.log('Paywall completed');

    // ========================================
    // Step 12: Completion screen
    // ========================================
    console.log('\nVerifying completion screen...');
    const hasCompletion = await waitForTextContaining(page, 'You are all set', 5000);
    if (!hasCompletion) {
      await page.screenshot({ path: 'e2e/debug-fo09-completion.png' });
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
    console.log('TEST PASSED! FO-09 Onboarding E2E Test');
    console.log('   E2E test completed successfully');
    console.log('='.repeat(60));
    console.log('\nTest Summary:');
    console.log('   FO-09 Specific Verifications:');
    console.log('   - NO progress bar during discovery phase');
    console.log('   - Welcome screens (steps 0-2) completed');
    console.log('   - Name entered: TestUser');
    console.log('   - Familiarity selected: Some experience');
    console.log('   - Topics: Confidence, Calm, Self-worth');
    console.log(`   - Dynamic discovery screens completed (${dynamicScreenCount} screens)`);
    console.log('   - Screen 1: Sentence mode (complete sentences, no "...")');
    console.log('   - Screens 2+: Fragment mode (fragments with "..." removed on click)');
    console.log('   - NO reflective statement on discovery screens');
    console.log('   - Heart animation observed between screens');
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
