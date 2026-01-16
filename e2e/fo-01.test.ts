/**
 * E2E test for FO-01 Full Onboarding using Playwright
 *
 * This test verifies the full onboarding flow:
 * 1. Navigate to /fo-01 (with auth bypass via cookie)
 * 2. Step 0: Click Continue
 * 3. Step 1: Enter name, click Continue
 * 4. Step 2: Click Continue
 * 5. Step 3: Enter intention, click Continue
 * 6. Step 4: Wait for loading, click Start
 * 7. Step 5: Swipe down on affirmations (use keyboard)
 * 8. Step 6: Click "I'm good with the affirmations I chose"
 * 9. Steps 7-9: Click through Continue buttons
 * 10. Step 10: Verify completion screen
 *
 * Run with: npx tsx e2e/fo-01.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
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

async function runTest(): Promise<void> {
  console.log('🧪 Starting FO-01 Full Onboarding E2E Test\n');

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
    console.log(`\n📄 Opening ${BASE_URL}/fo-01...`);
    await page.goto(`${BASE_URL}/fo-01`, { waitUntil: 'networkidle' });

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
      await page.screenshot({ path: 'e2e/debug-step0.png' });
      throw new Error('Could not click Continue on Step 0');
    }
    console.log('✅ Step 0 completed');

    // Step 1: Enter name and click Continue
    console.log('\n📝 Step 1: Entering name...');
    const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
    if (!hasNamePrompt) {
      await page.screenshot({ path: 'e2e/debug-step1.png' });
      throw new Error('Step 1 name prompt did not appear');
    }

    // Find the input and type the name
    const nameInput = page.locator('input[placeholder*="first name"]');
    await nameInput.fill('TestUser');
    await sleep(300);

    const clickedStep1 = await clickButton(page, 'Continue');
    if (!clickedStep1) {
      await page.screenshot({ path: 'e2e/debug-step1-continue.png' });
      throw new Error('Could not click Continue on Step 1');
    }
    console.log('✅ Step 1 completed');

    // Step 2: Personalized welcome - click Continue
    console.log('\n🖱️ Step 2: Clicking Continue...');
    const hasWelcome = await waitForText(page, 'Welcome, TestUser', 5000);
    if (!hasWelcome) {
      await page.screenshot({ path: 'e2e/debug-step2.png' });
      throw new Error('Step 2 personalized welcome did not appear');
    }

    await sleep(500);
    const clickedStep2 = await clickButton(page, 'Continue');
    if (!clickedStep2) {
      await page.screenshot({ path: 'e2e/debug-step2-continue.png' });
      throw new Error('Could not click Continue on Step 2');
    }
    console.log('✅ Step 2 completed');

    // Step 3: Enter intention and click Continue
    console.log('\n📝 Step 3: Entering intention...');
    const hasIntentionPrompt = await waitForText(page, 'What do you hope affirmations can help you with', 5000);
    if (!hasIntentionPrompt) {
      await page.screenshot({ path: 'e2e/debug-step3.png' });
      throw new Error('Step 3 intention prompt did not appear');
    }

    // Find the textarea and type the intention
    const intentionTextarea = page.locator('textarea[placeholder*="Write anything"]');
    await intentionTextarea.fill('I want to feel more confident');
    await sleep(300);

    const clickedStep3 = await clickButton(page, 'Continue');
    if (!clickedStep3) {
      await page.screenshot({ path: 'e2e/debug-step3-continue.png' });
      throw new Error('Could not click Continue on Step 3');
    }
    console.log('✅ Step 3 completed');

    // Step 4: Wait for loading to complete, then click Start
    console.log('\n⏳ Step 4: Waiting for AI generation (up to 60s)...');
    const hasSwipeIntro = await waitForText(page, 'Thank you, TestUser', 5000);
    if (!hasSwipeIntro) {
      await page.screenshot({ path: 'e2e/debug-step4.png' });
      throw new Error('Step 4 swipe intro did not appear');
    }

    // Wait for the Start button to appear (loading complete)
    console.log('⏳ Waiting for affirmations to load...');
    try {
      await page.waitForSelector('button:has-text("Start")', { timeout: TIMEOUT });
    } catch {
      await page.screenshot({ path: 'e2e/debug-step4-loading.png' });
      throw new Error('Affirmations did not finish loading in time');
    }

    await sleep(500);
    const clickedStart = await clickButton(page, 'Start');
    if (!clickedStart) {
      await page.screenshot({ path: 'e2e/debug-step4-start.png' });
      throw new Error('Could not click Start button');
    }
    console.log('✅ Step 4 completed - AI generation successful');

    // Step 5: Swipe down on at least 2 affirmations using keyboard
    console.log('\n⬇️ Step 5: Swiping affirmations...');

    // Wait for first affirmation card (variable number of affirmations)
    const hasAffirmation = await waitForTextContaining(page, 'Affirmation 1 of', 5000);
    if (!hasAffirmation) {
      await page.screenshot({ path: 'e2e/debug-step5.png' });
      throw new Error('First affirmation card did not appear');
    }

    // Swipe down on 2 affirmations using ArrowDown key (keep them)
    for (let i = 0; i < 2; i++) {
      console.log(`   Keeping affirmation ${i + 1}...`);
      await sleep(500);
      await page.keyboard.press('ArrowDown');
      await sleep(800); // Wait for animation
    }
    console.log('✅ Kept 2 affirmations');

    // Keep swiping until we reach the checkpoint (variable number of affirmations)
    console.log('   Discarding remaining affirmations until checkpoint...');
    let checkpointReached = false;
    for (let i = 0; i < 20; i++) { // Max 20 iterations to prevent infinite loop
      // Check if we've reached the checkpoint
      const pageContent = await page.content();
      if (pageContent.includes('Perfect, TestUser') || pageContent.includes("I'm good with")) {
        checkpointReached = true;
        break;
      }
      await sleep(300);
      await page.keyboard.press('ArrowUp'); // Discard
      await sleep(500);
    }

    // Step 6: Click "I'm good with the affirmations I chose"
    console.log('\n🖱️ Step 6: Finishing affirmation selection...');
    if (!checkpointReached) {
      const hasCheckpoint = await waitForTextContaining(page, 'Perfect, TestUser', 10000);
      if (!hasCheckpoint) {
        await page.screenshot({ path: 'e2e/debug-step6.png' });
        throw new Error('Checkpoint screen did not appear');
      }
    }

    await sleep(500);
    const clickedFinish = await clickButton(page, "I'm good with the affirmations I chose");
    if (!clickedFinish) {
      await page.screenshot({ path: 'e2e/debug-step6-finish.png' });
      throw new Error("Could not click 'I'm good with the affirmations I chose' button");
    }
    console.log('✅ Step 6 completed');

    // Step 7: Background selection - click Continue
    console.log('\n🖱️ Step 7: Background selection...');
    const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
    if (!hasBackground) {
      await page.screenshot({ path: 'e2e/debug-step7.png' });
      throw new Error('Background selection screen did not appear');
    }

    await sleep(500);
    const clickedStep7 = await clickButton(page, 'Continue');
    if (!clickedStep7) {
      await page.screenshot({ path: 'e2e/debug-step7-continue.png' });
      throw new Error('Could not click Continue on Step 7');
    }
    console.log('✅ Step 7 completed');

    // Step 8: Notifications - click Continue
    console.log('\n🖱️ Step 8: Notifications...');
    const hasNotifications = await waitForText(page, 'Set up reminders', 5000);
    if (!hasNotifications) {
      await page.screenshot({ path: 'e2e/debug-step8.png' });
      throw new Error('Notifications screen did not appear');
    }

    await sleep(500);
    const clickedStep8 = await clickButton(page, 'Continue');
    if (!clickedStep8) {
      await page.screenshot({ path: 'e2e/debug-step8-continue.png' });
      throw new Error('Could not click Continue on Step 8');
    }
    console.log('✅ Step 8 completed');

    // Step 9: Paywall - click "Not now"
    console.log('\n🖱️ Step 9: Paywall...');
    const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
    if (!hasPaywall) {
      await page.screenshot({ path: 'e2e/debug-step9.png' });
      throw new Error('Paywall screen did not appear');
    }

    await sleep(500);
    const clickedStep9 = await clickButton(page, 'Not now');
    if (!clickedStep9) {
      await page.screenshot({ path: 'e2e/debug-step9-notnow.png' });
      throw new Error('Could not click "Not now" on Step 9');
    }
    console.log('✅ Step 9 completed');

    // Step 10: Verify completion screen
    console.log('\n🔍 Step 10: Verifying completion...');
    const hasCompletion = await waitForTextContaining(page, "You're all set", 5000);
    if (!hasCompletion) {
      await page.screenshot({ path: 'e2e/debug-step10.png' });
      throw new Error("Completion screen did not appear - 'You're all set' not found");
    }
    console.log("✅ Completion screen shows 'You're all set'");

    // Click "See my affirmations" to reveal the list
    const clickedSeeAffirmations = await clickButton(page, 'See my affirmations');
    if (!clickedSeeAffirmations) {
      await page.screenshot({ path: 'e2e/debug-step10-see.png' });
      throw new Error('Could not click "See my affirmations" button');
    }

    // Verify that approved affirmations are shown
    await sleep(500);
    const hasAffirmationsList = await waitForTextContaining(page, 'affirmations saved', 5000);
    if (!hasAffirmationsList) {
      // Check for the affirmation markers instead
      const pageContent = await page.content();
      if (!pageContent.includes('✦')) {
        await page.screenshot({ path: 'e2e/debug-step10-list.png' });
        throw new Error('Affirmations list did not appear');
      }
    }
    console.log('✅ Approved affirmations are displayed');

    // Test passed!
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TEST PASSED! FO-01 Full Onboarding E2E test completed successfully');
    console.log('='.repeat(50));

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
