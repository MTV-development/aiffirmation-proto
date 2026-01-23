/**
 * E2E test for FO-03 Full Onboarding with Gradual Multi-Question Flow using Playwright
 *
 * This test verifies the complete FO-03 onboarding flow:
 * 1. Navigate to /fo-03 (with auth bypass via cookie)
 * 2. Step 0: Click Continue
 * 3. Step 1: Enter name, click Continue
 * 4. Step 2: Click Start
 * 5. Step 3: Select familiarity option, wait for confetti, auto-advance (1.5s)
 * 6. Step 4: Select 2-3 topic chips, click Continue, wait for confetti (1.5s)
 * 7. Step 5: Type text and/or select chips, click Continue, wait for heart animation
 * 8. Step 6: Type text and/or select chips, click Continue, wait for heart animation
 * 9. Step 7: Type text and/or select chips, click Continue (triggers batch 1 generation)
 * 10. Wait for affirmation generation (60s timeout)
 * 11. Swipe through 10 affirmations (accept some, skip some)
 * 12. Step 8 checkpoint: Click Continue or I am good
 * 13. Steps 10-12: Click Continue through mockup screens
 * 14. Step 13: Verify affirmation list is displayed
 *
 * Key differences from FO-02:
 * - Gradual multi-question onboarding (familiarity, topics, situation, feelings, whatHelps)
 * - Toggleable chips alongside open text fields
 * - Confetti and heart animations with auto-advance
 *
 * Run with: node --import tsx e2e/fo-03.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-03 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 60000; // 60s for AI generation

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    await page.waitForFunction((sub) => document.body.innerText.includes(sub), substring, { timeout });
    return true;
  } catch {
    return false;
  }
}

async function runTest(): Promise<void> {
  console.log('🧪 Starting FO-03 Full Onboarding E2E Test\n');

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
    console.log(`\n📄 Opening ${BASE_URL}/fo-03...`);
    await page.goto(`${BASE_URL}/fo-03`, { waitUntil: 'networkidle' });

    // Check if we're on password page (auth bypass didn't work)
    const currentUrl = page.url();
    if (currentUrl.includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Step 0: Verify page loaded - shows welcome message
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
      await page.screenshot({ path: 'e2e/debug-fo03-step0.png' });
      throw new Error('Could not click Continue on Step 0');
    }
    console.log('✅ Step 0 completed');

    // Step 1: Enter name and click Continue
    console.log('\n📝 Step 1: Entering name...');
    const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
    if (!hasNamePrompt) {
      await page.screenshot({ path: 'e2e/debug-fo03-step1.png' });
      throw new Error('Step 1 name prompt did not appear');
    }

    // Find the input and type the name
    const nameInput = page.locator('input[placeholder*="first name"]');
    await nameInput.fill('TestUser');
    await sleep(300);

    const clickedStep1 = await clickButton(page, 'Continue');
    if (!clickedStep1) {
      await page.screenshot({ path: 'e2e/debug-fo03-step1-continue.png' });
      throw new Error('Could not click Continue on Step 1');
    }
    console.log('✅ Step 1 completed');

    // Step 2: Personalized welcome - click Start
    console.log('\n🖱️ Step 2: Clicking Start...');
    const hasWelcome = await waitForText(page, 'Welcome, TestUser', 5000);
    if (!hasWelcome) {
      await page.screenshot({ path: 'e2e/debug-fo03-step2.png' });
      throw new Error('Step 2 personalized welcome did not appear');
    }

    await sleep(500);
    const clickedStep2 = await clickButton(page, 'Start');
    if (!clickedStep2) {
      await page.screenshot({ path: 'e2e/debug-fo03-step2-start.png' });
      throw new Error('Could not click Start on Step 2');
    }
    console.log('✅ Step 2 completed');

    // Step 3: Familiarity - select option, wait for confetti and auto-advance
    console.log('\n🖱️ Step 3: Selecting familiarity level...');
    const hasFamiliarity = await waitForText(page, 'How familiar are you with affirmations', 5000);
    if (!hasFamiliarity) {
      await page.screenshot({ path: 'e2e/debug-fo03-step3.png' });
      throw new Error('Step 3 familiarity question did not appear');
    }

    await sleep(500);
    // Select "Some experience" option
    const clickedFamiliarity = await clickButton(page, 'Some experience');
    if (!clickedFamiliarity) {
      await page.screenshot({ path: 'e2e/debug-fo03-step3-option.png' });
      throw new Error('Could not select familiarity option');
    }

    // Wait for success message and auto-advance (1.5s)
    const hasSuccess3 = await waitForText(page, 'Super, TestUser', 3000);
    if (!hasSuccess3) {
      console.log('   ⚠️ Success message not visible, but continuing...');
    }
    console.log('   ✓ Waiting for confetti and auto-advance...');
    await sleep(2000); // Wait for confetti animation and auto-advance
    console.log('✅ Step 3 completed');

    // Step 4: Topics - select chips, click Continue, wait for confetti
    console.log('\n🖱️ Step 4: Selecting topics...');
    const hasTopics = await waitForText(page, 'What do you want affirmations to help you with', 5000);
    if (!hasTopics) {
      await page.screenshot({ path: 'e2e/debug-fo03-step4.png' });
      throw new Error('Step 4 topics question did not appear');
    }

    await sleep(500);
    // Select 2-3 topic chips
    const topicsToSelect = ['Motivation', 'Inner peace', 'Confidence'];
    for (const topic of topicsToSelect) {
      const clicked = await clickButton(page, topic);
      if (!clicked) {
        console.log(`   ⚠️ Could not select topic: ${topic}`);
      } else {
        console.log(`   ✓ Selected topic: ${topic}`);
      }
      await sleep(200);
    }

    await sleep(300);
    const clickedStep4 = await clickButton(page, 'Continue');
    if (!clickedStep4) {
      await page.screenshot({ path: 'e2e/debug-fo03-step4-continue.png' });
      throw new Error('Could not click Continue on Step 4');
    }

    // Wait for success message and auto-advance (1.5s)
    const hasSuccess4 = await waitForText(page, 'Great choices', 3000);
    if (!hasSuccess4) {
      console.log('   ⚠️ Success message not visible, but continuing...');
    }
    console.log('   ✓ Waiting for confetti and auto-advance...');
    await sleep(2000);
    console.log('✅ Step 4 completed');

    // Step 5: Situation - type text and/or select chips, click Continue
    console.log('\n📝 Step 5: Entering situation...');
    const hasSituation = await waitForText(page, 'What has been going on lately', 5000);
    if (!hasSituation) {
      await page.screenshot({ path: 'e2e/debug-fo03-step5.png' });
      throw new Error('Step 5 situation question did not appear');
    }

    await sleep(500);
    // Select some chips
    const situationChips = ['Feeling stuck', 'Want growth'];
    for (const chip of situationChips) {
      const clicked = await clickButton(page, chip);
      if (clicked) {
        console.log(`   ✓ Selected chip: ${chip}`);
      }
      await sleep(200);
    }

    const clickedStep5 = await clickButton(page, 'Continue');
    if (!clickedStep5) {
      await page.screenshot({ path: 'e2e/debug-fo03-step5-continue.png' });
      throw new Error('Could not click Continue on Step 5');
    }

    // Wait for heart animation
    console.log('   ✓ Waiting for heart animation...');
    await sleep(2500);
    console.log('✅ Step 5 completed');

    // Step 6: Feelings - type text and/or select chips, click Continue
    console.log('\n📝 Step 6: Entering feelings...');
    const hasFeelings = await waitForText(page, 'What are you feeling right now', 5000);
    if (!hasFeelings) {
      await page.screenshot({ path: 'e2e/debug-fo03-step6.png' });
      throw new Error('Step 6 feelings question did not appear');
    }

    await sleep(500);
    // Select some chips
    const feelingsChips = ['Motivated', 'Hopeful'];
    for (const chip of feelingsChips) {
      const clicked = await clickButton(page, chip);
      if (clicked) {
        console.log(`   ✓ Selected chip: ${chip}`);
      }
      await sleep(200);
    }

    const clickedStep6 = await clickButton(page, 'Continue');
    if (!clickedStep6) {
      await page.screenshot({ path: 'e2e/debug-fo03-step6-continue.png' });
      throw new Error('Could not click Continue on Step 6');
    }

    // Wait for heart animation
    console.log('   ✓ Waiting for heart animation...');
    await sleep(2500);
    console.log('✅ Step 6 completed');

    // Step 7: What helps - select chips, click Continue (triggers batch 1 generation)
    console.log('\n📝 Step 7: Entering what helps...');
    const hasWhatHelps = await waitForText(page, 'What normally makes you feel good', 5000);
    if (!hasWhatHelps) {
      await page.screenshot({ path: 'e2e/debug-fo03-step7.png' });
      throw new Error('Step 7 what helps question did not appear');
    }

    await sleep(500);
    // Select some chips
    const whatHelpsChips = ['Nature', 'Music'];
    for (const chip of whatHelpsChips) {
      const clicked = await clickButton(page, chip);
      if (clicked) {
        console.log(`   ✓ Selected chip: ${chip}`);
      }
      await sleep(200);
    }

    const clickedStep7 = await clickButton(page, 'Continue');
    if (!clickedStep7) {
      await page.screenshot({ path: 'e2e/debug-fo03-step7-continue.png' });
      throw new Error('Could not click Continue on Step 7');
    }
    console.log('✅ Step 7 completed - Batch 1 generation triggered');

    // Wait for affirmation generation (60s timeout)
    console.log('\n⏳ Waiting for batch 1 AI generation (up to 60s)...');

    // First, we might see the loading screen
    const hasLoadingScreen = await waitForTextContaining(page, 'Creating your personal affirmations', 5000);
    if (hasLoadingScreen) {
      console.log('   📍 Loading screen detected - waiting for generation...');
    }

    // Wait for affirmation cards to appear
    try {
      await page.waitForFunction(() => document.body.innerText.includes('Affirmation 1 of'), {
        timeout: TIMEOUT,
      });
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo03-batch1-loading.png' });
      throw new Error('Batch 1 did not finish loading in time');
    }
    console.log('✅ Batch 1 AI generation successful');

    // Helper to swipe through a batch of 10 affirmations
    async function swipeThroughBatch(batchNum: number): Promise<void> {
      console.log(`   Swiping through batch ${batchNum}...`);

      // Wait for first affirmation card
      const hasAffirmation = await waitForTextContaining(page, 'Affirmation 1 of', 5000);
      if (!hasAffirmation) {
        await page.screenshot({ path: `e2e/debug-fo03-batch${batchNum}-start.png` });
        throw new Error(`First affirmation card for batch ${batchNum} did not appear`);
      }

      for (let i = 0; i < 10; i++) {
        // Alternate: keep some, discard others
        // Keep first 5, discard rest (to test feedback loop and have enough affirmations)
        await sleep(300);
        if (i < 5) {
          await page.keyboard.press('ArrowDown'); // Keep
        } else {
          await page.keyboard.press('ArrowUp'); // Discard
        }
        await sleep(500);
      }
      console.log(`   ✓ Batch ${batchNum} complete (kept 5, skipped 5)`);
    }

    // Swipe through batch 1
    console.log('\n⬇️ Swiping affirmations (batch 1)...');
    await swipeThroughBatch(1);

    // Checkpoint after Batch 1: "Perfect, TestUser" with Continue and "I am good..." buttons
    console.log('\n🖱️ Checkpoint 1: Clicking "I am good with the affirmations I chose"...');
    const hasCheckpoint1 = await waitForTextContaining(page, 'Perfect, TestUser', 10000);
    if (!hasCheckpoint1) {
      await page.screenshot({ path: 'e2e/debug-fo03-checkpoint1.png' });
      throw new Error('Checkpoint 1 screen did not appear');
    }

    await sleep(500);
    // For this test, we'll finish after batch 1 to speed things up
    const clickedFinish = await clickButton(page, 'I am good with the affirmations I chose');
    if (!clickedFinish) {
      await page.screenshot({ path: 'e2e/debug-fo03-checkpoint1-finish.png' });
      throw new Error('Could not click "I am good with the affirmations I chose" on checkpoint 1');
    }
    console.log('✅ Checkpoint 1 completed - User chose to finish');

    // Transition screen - "Perfect, TestUser" with next step message
    console.log('\n🖱️ Transition: Clicking Continue...');
    const hasTransition = await waitForTextContaining(page, 'You now have a strong list', 10000);
    if (!hasTransition) {
      await page.screenshot({ path: 'e2e/debug-fo03-transition.png' });
      throw new Error('Transition screen did not appear');
    }

    await sleep(500);
    const clickedTransition = await clickButton(page, 'Continue');
    if (!clickedTransition) {
      await page.screenshot({ path: 'e2e/debug-fo03-transition-continue.png' });
      throw new Error('Could not click Continue on transition screen');
    }
    console.log('✅ Transition completed');

    // Step 10: Background selection - click Continue
    console.log('\n🖱️ Step 10: Background selection...');
    const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
    if (!hasBackground) {
      await page.screenshot({ path: 'e2e/debug-fo03-step10.png' });
      throw new Error('Background selection screen did not appear');
    }

    await sleep(500);
    const clickedStep10 = await clickButton(page, 'Continue');
    if (!clickedStep10) {
      await page.screenshot({ path: 'e2e/debug-fo03-step10-continue.png' });
      throw new Error('Could not click Continue on Step 10');
    }
    console.log('✅ Step 10 completed');

    // Step 11: Notifications - click Continue
    console.log('\n🖱️ Step 11: Notifications...');
    const hasNotifications = await waitForText(page, 'Set up reminders', 5000);
    if (!hasNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo03-step11.png' });
      throw new Error('Notifications screen did not appear');
    }

    await sleep(500);
    const clickedStep11 = await clickButton(page, 'Continue');
    if (!clickedStep11) {
      await page.screenshot({ path: 'e2e/debug-fo03-step11-continue.png' });
      throw new Error('Could not click Continue on Step 11');
    }
    console.log('✅ Step 11 completed');

    // Step 12: Paywall - click "Not now"
    console.log('\n🖱️ Step 12: Paywall...');
    const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
    if (!hasPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo03-step12.png' });
      throw new Error('Paywall screen did not appear');
    }

    await sleep(500);
    const clickedStep12 = await clickButton(page, 'Not now');
    if (!clickedStep12) {
      await page.screenshot({ path: 'e2e/debug-fo03-step12-notnow.png' });
      throw new Error('Could not click "Not now" on Step 12');
    }
    console.log('✅ Step 12 completed');

    // Step 13: Verify completion screen
    console.log('\n🔍 Step 13: Verifying completion...');
    const hasCompletion = await waitForTextContaining(page, 'You are all set', 5000);
    if (!hasCompletion) {
      await page.screenshot({ path: 'e2e/debug-fo03-step13.png' });
      throw new Error("Completion screen did not appear - 'You are all set' not found");
    }
    console.log("✅ Completion screen shows 'You are all set'");

    // Verify that approved affirmations are shown (should have 5 from batch 1)
    await sleep(500);
    const hasAffirmationsList = await waitForTextContaining(page, 'affirmations saved', 5000);
    if (!hasAffirmationsList) {
      // Check for the affirmation markers instead
      const pageContent = await page.content();
      if (!pageContent.includes('✦')) {
        await page.screenshot({ path: 'e2e/debug-fo03-step13-list.png' });
        throw new Error('Affirmations list did not appear');
      }
    }
    console.log('✅ Approved affirmations are displayed (should be 5 total from batch 1)');

    // Test passed!
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST PASSED! FO-03 Full Onboarding E2E Test');
    console.log('   E2E test completed successfully');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   - Gradual multi-question onboarding completed');
    console.log('   - Topics, situation, feelings, and whatHelps collected');
    console.log('   - 1 batch of 10 affirmations generated');
    console.log('   - 5 affirmations kept, 5 skipped');
    console.log('   - All mockup screens navigated correctly');
    console.log('   - Completion screen shows affirmation list');
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
