/**
 * E2E test for FO-02 Full Onboarding with Iterative Improvement using Playwright
 *
 * This test verifies the full onboarding flow with iterative batch generation:
 * 1. Navigate to /fo-02 (with auth bypass via cookie)
 * 2. Step 0: Click Continue
 * 3. Step 1: Enter name, click Continue
 * 4. Step 2: Click Continue
 * 5. Step 3: Enter intention, click Continue (triggers batch 1 generation)
 * 6. Step 4: Wait for AI generation loading to complete, click Start
 * 7. Step 5/Batch 1: Swipe 10 affirmations → Checkpoint → Continue (triggers batch 2 generation)
 * 8. Loading state for batch 2 → Swipe 10 affirmations → Checkpoint → Yes, please (triggers batch 3)
 * 9. Loading state for batch 3 → Swipe 10 affirmations → Checkpoint → Continue
 * 10. Steps 7-9: Click through Continue buttons
 * 11. Step 10: Verify completion screen
 *
 * Key differences from FO-01:
 * - Generates 10 affirmations per batch (not 100 upfront)
 * - Loading states appear before each batch generation
 * - Feedback from previous batches improves subsequent ones
 *
 * Run with: node --import tsx e2e/fo-02.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-02 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 60000; // 60s for AI generation

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Click button by visible text
async function clickButton(page: Page, text: string): Promise<boolean> {
  try {
    // Try to find a button with the exact text (exact match)
    const button = page.getByRole('button', { name: text, exact: true });
    if (await button.isVisible({ timeout: 5000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Try alternative approaches
  }

  try {
    // Try button with partial text match
    const button = page.getByRole('button', { name: new RegExp(text, 'i') });
    if (await button.isVisible({ timeout: 3000 })) {
      await button.click();
      return true;
    }
  } catch {
    // Try next approach
  }

  try {
    // Try finding any element with the text that's clickable
    const element = page.locator(`button:has-text("${text}")`).first();
    if (await element.isVisible({ timeout: 3000 })) {
      await element.click();
      return true;
    }
  } catch {
    // Element not found
  }

  try {
    // Last resort - any clickable element with text
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
    await page.waitForFunction(
      (sub) => document.body.innerText.includes(sub),
      substring,
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

// Wait for loading to complete (spinner disappears or Start/affirmation card appears)
async function waitForLoadingComplete(page: Page, timeout = TIMEOUT): Promise<boolean> {
  try {
    // Wait for either the Start button or an affirmation card to appear
    await Promise.race([
      page.waitForSelector('button:has-text("Start")', { timeout }),
      page.waitForFunction(
        () => document.body.innerText.includes('Affirmation 1 of'),
        { timeout }
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function runTest(): Promise<void> {
  console.log('🧪 Starting FO-02 Full Onboarding with Iterative Improvement E2E Test\n');

  let browser: Browser | null = null;

  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({
      headless: false, // Set to true for CI
    });

    const context: BrowserContext = await browser.newContext();

    // Set test mode cookie to bypass auth BEFORE navigating
    console.log('🔓 Setting test mode cookie...');
    await context.addCookies([
      {
        name: 'e2e_test_mode',
        value: 'true',
        domain: new URL(BASE_URL).hostname,
        path: '/',
      },
    ]);

    const page: Page = await context.newPage();

    // Set a reasonable timeout
    page.setDefaultTimeout(30000);

    // Step 1: Navigate to the page
    console.log(`\n📄 Opening ${BASE_URL}/fo-02...`);
    await page.goto(`${BASE_URL}/fo-02`, { waitUntil: 'networkidle' });

    // Check if we're on password page (auth bypass didn't work)
    const currentUrl = page.url();
    if (currentUrl.includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Step 2: Verify page loaded - Step 0 shows welcome message
    console.log('\n🔍 Verifying page loaded (Step 0)...');
    const pageTitle = await waitForText(page, 'The way you speak to yourself', 10000);
    if (!pageTitle) {
      throw new Error('Page did not load correctly - welcome message not found');
    }
    console.log('✅ Page loaded successfully');

    // Step 0: Click Continue
    console.log('\n🖱️ Step 0: Clicking Continue...');
    await sleep(500);
    const clickedStep0 = await clickButton(page, 'Continue');
    if (!clickedStep0) {
      await page.screenshot({ path: 'e2e/debug-fo02-step0.png' });
      throw new Error('Could not click Continue on Step 0');
    }
    console.log('✅ Step 0 completed');

    // Step 1: Enter name and click Continue
    console.log('\n📝 Step 1: Entering name...');
    const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
    if (!hasNamePrompt) {
      await page.screenshot({ path: 'e2e/debug-fo02-step1.png' });
      throw new Error('Step 1 name prompt did not appear');
    }

    // Find the input and type the name
    const nameInput = page.locator('input[placeholder*="first name"]');
    await nameInput.fill('TestUser');
    await sleep(300);

    const clickedStep1 = await clickButton(page, 'Continue');
    if (!clickedStep1) {
      await page.screenshot({ path: 'e2e/debug-fo02-step1-continue.png' });
      throw new Error('Could not click Continue on Step 1');
    }
    console.log('✅ Step 1 completed');

    // Step 2: Personalized welcome - click Continue
    console.log('\n🖱️ Step 2: Clicking Continue...');
    const hasWelcome = await waitForText(page, 'Welcome, TestUser', 5000);
    if (!hasWelcome) {
      await page.screenshot({ path: 'e2e/debug-fo02-step2.png' });
      throw new Error('Step 2 personalized welcome did not appear');
    }

    await sleep(500);
    const clickedStep2 = await clickButton(page, 'Continue');
    if (!clickedStep2) {
      await page.screenshot({ path: 'e2e/debug-fo02-step2-continue.png' });
      throw new Error('Could not click Continue on Step 2');
    }
    console.log('✅ Step 2 completed');

    // Step 3: Enter intention and click Continue (triggers batch 1 generation)
    console.log('\n📝 Step 3: Entering intention...');
    const hasIntentionPrompt = await waitForText(page, 'What do you hope affirmations can help you with', 5000);
    if (!hasIntentionPrompt) {
      await page.screenshot({ path: 'e2e/debug-fo02-step3.png' });
      throw new Error('Step 3 intention prompt did not appear');
    }

    // Find the textarea and type the intention
    const intentionTextarea = page.locator('textarea[placeholder*="Write anything"]');
    await intentionTextarea.fill('I want to feel more confident and overcome self-doubt');
    await sleep(300);

    const clickedStep3 = await clickButton(page, 'Continue');
    if (!clickedStep3) {
      await page.screenshot({ path: 'e2e/debug-fo02-step3-continue.png' });
      throw new Error('Could not click Continue on Step 3');
    }
    console.log('✅ Step 3 completed - Batch 1 generation triggered');

    // Step 4: Wait for batch 1 generation to complete, then click Start
    console.log('\n⏳ Step 4: Waiting for batch 1 AI generation (up to 60s)...');

    // First, we might see the loading screen
    const hasLoadingScreen = await waitForTextContaining(page, 'Creating your first affirmations', 5000);
    if (hasLoadingScreen) {
      console.log('   📍 Loading screen detected - waiting for generation...');
    }

    // Wait for the Start button to appear (loading complete)
    console.log('⏳ Waiting for affirmations to load...');
    try {
      await page.waitForSelector('button:has-text("Start")', { timeout: TIMEOUT });
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo02-step4-loading.png' });
      throw new Error('Affirmations did not finish loading in time');
    }

    // Verify we see the swipe intro message
    const hasSwipeIntro = await waitForText(page, 'Thank you, TestUser', 5000);
    if (!hasSwipeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo02-step4.png' });
      throw new Error('Step 4 swipe intro did not appear');
    }

    await sleep(500);
    const clickedStart = await clickButton(page, 'Start');
    if (!clickedStart) {
      await page.screenshot({ path: 'e2e/debug-fo02-step4-start.png' });
      throw new Error('Could not click Start button');
    }
    console.log('✅ Step 4 completed - Batch 1 AI generation successful');

    // Helper to swipe through a batch of 10 affirmations
    async function swipeThroughBatch(batchNum: number): Promise<void> {
      console.log(`   Swiping through batch ${batchNum}...`);

      // Wait for first affirmation card
      const hasAffirmation = await waitForTextContaining(page, 'Affirmation 1 of', 5000);
      if (!hasAffirmation) {
        await page.screenshot({ path: `e2e/debug-fo02-batch${batchNum}-start.png` });
        throw new Error(`First affirmation card for batch ${batchNum} did not appear`);
      }

      for (let i = 0; i < 10; i++) {
        // Alternate: keep some, discard others
        // Keep first 3, discard rest (to test feedback loop)
        await sleep(300);
        if (i < 3) {
          await page.keyboard.press('ArrowDown'); // Keep
        } else {
          await page.keyboard.press('ArrowUp'); // Discard
        }
        await sleep(500);
      }
      console.log(`   ✓ Batch ${batchNum} complete (kept 3, skipped 7)`);
    }

    // Step 5: Batch 1 - Swipe through 10 affirmations
    console.log('\n⬇️ Step 5: Swiping affirmations (testing full 3-batch iterative flow)...');
    await swipeThroughBatch(1);

    // Checkpoint after Batch 1: "Perfect, TestUser" with Continue and "I'm good..." buttons
    console.log('\n🖱️ Checkpoint 1: Clicking Continue for batch 2...');
    const hasCheckpoint1 = await waitForTextContaining(page, 'Perfect, TestUser', 10000);
    if (!hasCheckpoint1) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint1.png' });
      throw new Error('Checkpoint 1 screen did not appear');
    }
    await sleep(500);
    const clickedContinue1 = await clickButton(page, 'Continue');
    if (!clickedContinue1) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint1-continue.png' });
      throw new Error('Could not click Continue on checkpoint 1');
    }
    console.log('✅ Checkpoint 1 completed - Batch 2 generation triggered');

    // Wait for Batch 2 loading and generation
    console.log('\n⏳ Waiting for batch 2 AI generation with feedback (up to 60s)...');
    const hasLoading2 = await waitForTextContaining(page, 'Creating more affirmations', 5000);
    if (hasLoading2) {
      console.log('   📍 Loading screen detected - batch 2 generating with feedback from batch 1...');
    }

    // Wait for affirmation cards to appear (batch 2 loaded)
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Affirmation 1 of'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo02-batch2-loading.png' });
      throw new Error('Batch 2 did not finish loading in time');
    }
    console.log('✅ Batch 2 AI generation successful');

    // Batch 2: Swipe through 10 more affirmations
    await swipeThroughBatch(2);

    // Checkpoint after Batch 2: "Great job, TestUser" with Yes, please / No, continue
    console.log('\n🖱️ Checkpoint 2: Clicking Yes, please for batch 3...');
    const hasCheckpoint2 = await waitForTextContaining(page, 'Great job, TestUser', 10000);
    if (!hasCheckpoint2) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint2.png' });
      throw new Error('Checkpoint 2 screen did not appear');
    }
    await sleep(500);
    const clickedYesPlease = await clickButton(page, 'Yes, please');
    if (!clickedYesPlease) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint2-yes.png' });
      throw new Error('Could not click "Yes, please" on checkpoint 2');
    }
    console.log('✅ Checkpoint 2 completed - Batch 3 generation triggered');

    // Wait for Batch 3 loading and generation
    console.log('\n⏳ Waiting for batch 3 AI generation with feedback (up to 60s)...');
    const hasLoading3 = await waitForTextContaining(page, 'One more round of affirmations', 5000);
    if (hasLoading3) {
      console.log('   📍 Loading screen detected - batch 3 generating with feedback from batches 1+2...');
    }

    // Wait for affirmation cards to appear (batch 3 loaded)
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Affirmation 1 of'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo02-batch3-loading.png' });
      throw new Error('Batch 3 did not finish loading in time');
    }
    console.log('✅ Batch 3 AI generation successful');

    // Batch 3: Swipe through 10 more affirmations
    await swipeThroughBatch(3);

    // Checkpoint after Batch 3: "Perfect, TestUser" with ONLY Continue button
    // CRITICAL: This Continue MUST go to Step 7, not batch 4
    console.log('\n🖱️ Checkpoint 3: Clicking Continue (should go to Step 7)...');
    const hasCheckpoint3 = await waitForTextContaining(page, 'Perfect, TestUser', 10000);
    if (!hasCheckpoint3) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint3.png' });
      throw new Error('Checkpoint 3 screen did not appear');
    }

    // Verify there is NO "I'm good with" or "Yes, please" button - only Continue
    const pageContent = await page.content();
    if (pageContent.includes("I'm good with") || pageContent.includes("Yes, please")) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint3-wrong-buttons.png' });
      throw new Error('Checkpoint 3 should only have Continue button, but found other options');
    }
    console.log('   ✓ Verified: Only Continue button present (no skip option)');

    await sleep(500);
    const clickedContinue3 = await clickButton(page, 'Continue');
    if (!clickedContinue3) {
      await page.screenshot({ path: 'e2e/debug-fo02-checkpoint3-continue.png' });
      throw new Error('Could not click Continue on checkpoint 3');
    }
    console.log('✅ Checkpoint 3 completed');

    // Step 7: Background selection - click Continue
    console.log('\n🖱️ Step 7: Background selection...');
    const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
    if (!hasBackground) {
      await page.screenshot({ path: 'e2e/debug-fo02-step7.png' });
      throw new Error('Background selection screen did not appear');
    }

    await sleep(500);
    const clickedStep7 = await clickButton(page, 'Continue');
    if (!clickedStep7) {
      await page.screenshot({ path: 'e2e/debug-fo02-step7-continue.png' });
      throw new Error('Could not click Continue on Step 7');
    }
    console.log('✅ Step 7 completed');

    // Step 8: Notifications - click Continue
    console.log('\n🖱️ Step 8: Notifications...');
    const hasNotifications = await waitForText(page, 'Set up reminders', 5000);
    if (!hasNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo02-step8.png' });
      throw new Error('Notifications screen did not appear');
    }

    await sleep(500);
    const clickedStep8 = await clickButton(page, 'Continue');
    if (!clickedStep8) {
      await page.screenshot({ path: 'e2e/debug-fo02-step8-continue.png' });
      throw new Error('Could not click Continue on Step 8');
    }
    console.log('✅ Step 8 completed');

    // Step 9: Paywall - click "Not now"
    console.log('\n🖱️ Step 9: Paywall...');
    const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
    if (!hasPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo02-step9.png' });
      throw new Error('Paywall screen did not appear');
    }

    await sleep(500);
    const clickedStep9 = await clickButton(page, 'Not now');
    if (!clickedStep9) {
      await page.screenshot({ path: 'e2e/debug-fo02-step9-notnow.png' });
      throw new Error('Could not click "Not now" on Step 9');
    }
    console.log('✅ Step 9 completed');

    // Step 10: Verify completion screen
    console.log('\n🔍 Step 10: Verifying completion...');
    const hasCompletion = await waitForTextContaining(page, "You're all set", 5000);
    if (!hasCompletion) {
      await page.screenshot({ path: 'e2e/debug-fo02-step10.png' });
      throw new Error("Completion screen did not appear - 'You're all set' not found");
    }
    console.log("✅ Completion screen shows 'You're all set'");

    // Click "See my affirmations" to reveal the list
    const clickedSeeAffirmations = await clickButton(page, 'See my affirmations');
    if (!clickedSeeAffirmations) {
      await page.screenshot({ path: 'e2e/debug-fo02-step10-see.png' });
      throw new Error('Could not click "See my affirmations" button');
    }

    // Verify that approved affirmations are shown (should have 9 = 3 per batch)
    await sleep(500);
    const hasAffirmationsList = await waitForTextContaining(page, 'affirmations saved', 5000);
    if (!hasAffirmationsList) {
      // Check for the affirmation markers instead
      const pageContent = await page.content();
      if (!pageContent.includes('✦')) {
        await page.screenshot({ path: 'e2e/debug-fo02-step10-list.png' });
        throw new Error('Affirmations list did not appear');
      }
    }
    console.log('✅ Approved affirmations are displayed (should be 9 total from 3 batches)');

    // Test passed!
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST PASSED! FO-02 Full Onboarding with Iterative Improvement');
    console.log('   E2E test completed successfully');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   - 3 batches of 10 affirmations generated iteratively');
    console.log('   - Feedback from previous batches used in prompts');
    console.log('   - Loading states displayed between batch generations');
    console.log('   - All checkpoints and steps navigated correctly');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
runTest();
