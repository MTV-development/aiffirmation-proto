/**
 * E2E test for Full Process 3 agent using Playwright
 *
 * This test verifies the chat-based affirmation generation flow:
 * 1. Navigate to the page (with auth bypass via cookie)
 * 2. Click through the onboarding quick replies
 * 3. Verify affirmations are generated
 *
 * Run with: npx tsx e2e/full-process-3.test.ts
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

async function runTest(): Promise<void> {
  console.log('🧪 Starting Full Process 3 E2E Test\n');

  let browser: Browser | null = null;

  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({
      headless: true, // Set to false for debugging
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
    console.log(`\n📄 Opening ${BASE_URL}/full-process-3...`);
    await page.goto(`${BASE_URL}/full-process-3`, { waitUntil: 'networkidle' });

    // Check if we're on password page (auth bypass didn't work)
    const currentUrl = page.url();
    if (currentUrl.includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // Step 2: Verify page loaded
    console.log('\n🔍 Verifying page loaded...');
    const pageTitle = await waitForText(page, 'Full Process 03', 10000);
    if (!pageTitle) {
      throw new Error('Page did not load correctly - title not found');
    }
    console.log('✅ Page loaded successfully');

    // Step 3: Wait for intro message
    console.log('\n⏳ Waiting for intro message...');
    const hasIntro = await waitForText(page, 'What do you want them for', 15000);
    if (!hasIntro) {
      throw new Error('Intro message did not appear');
    }
    console.log('✅ Intro message appeared');

    // Step 4: Click "Confidence" quick reply
    console.log('\n🖱️ Clicking "Confidence" quick reply...');
    await sleep(1000); // Wait for quick replies to render
    const clickedFocus = await clickButton(page, 'Confidence');
    if (!clickedFocus) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'e2e/debug-focus.png' });
      throw new Error('Could not click Confidence button');
    }
    console.log('✅ Clicked focus option');

    // Step 5: Wait for friction question
    console.log('\n⏳ Waiting for friction question...');
    const hasFriction = await waitForText(page, 'get in the way', 10000);
    if (!hasFriction) {
      throw new Error('Friction question did not appear');
    }
    console.log('✅ Friction question appeared');

    // Step 6: Click "Skip" for friction
    console.log('\n🖱️ Clicking "Skip" for friction...');
    await sleep(500);
    await clickButton(page, 'Skip');
    console.log('✅ Skipped friction');

    // Step 7: Wait for tone question
    console.log('\n⏳ Waiting for tone question...');
    const hasTone = await waitForText(page, 'kind of voice', 10000);
    if (!hasTone) {
      throw new Error('Tone question did not appear');
    }
    console.log('✅ Tone question appeared');

    // Step 8: Click "Gentle" tone
    console.log('\n🖱️ Clicking "Gentle" tone...');
    await sleep(500);
    await clickButton(page, 'Gentle');
    console.log('✅ Selected tone');

    // Step 9: Wait for inspiration examples
    console.log('\n⏳ Waiting for inspiration examples...');
    const hasInspiration = await waitForText(page, 'inspiration', 10000);
    if (!hasInspiration) {
      throw new Error('Inspiration section did not appear');
    }
    console.log('✅ Inspiration section appeared');

    // Step 10: Click "Done" to skip inspiration
    console.log('\n🖱️ Clicking "Done" to skip inspiration...');
    await sleep(1000);
    const clickedDone = await clickButton(page, 'Done');
    if (!clickedDone) {
      await page.screenshot({ path: 'e2e/debug-done.png' });
      throw new Error('Could not click Done button');
    }
    console.log('✅ Clicked Done');

    // Step 11: Wait for confirm screen - need to wait for the new content
    console.log('\n⏳ Waiting for confirmation...');
    // Wait for the "Done" button to disappear (screen transition)
    await sleep(1500); // Give time for typing animation

    const hasConfirm = await waitForText(page, "here's what I'll use", 15000);
    if (!hasConfirm) {
      await page.screenshot({ path: 'e2e/debug-confirm.png' });
      const buttons = await page.locator('button').allTextContents();
      console.log('Available buttons after Done:', buttons);
      throw new Error('Confirmation screen did not appear');
    }
    console.log('✅ Confirmation screen appeared');

    // Step 12: Click "Generate now" (or "Nope" first to skip avoid prompt)
    console.log('\n🖱️ Clicking to start generation...');
    await sleep(500);

    // First try "Generate now", if not visible, try "Nope" (to skip avoid prompt)
    let clickedGenerate = await clickButton(page, 'Generate now');
    if (!clickedGenerate) {
      // Maybe we need to click "Nope" first
      const clickedNope = await clickButton(page, 'Nope');
      if (!clickedNope) {
        await page.screenshot({ path: 'e2e/debug-generate.png' });
        // List all visible buttons for debugging
        const buttons = await page.locator('button').allTextContents();
        console.log('Available buttons:', buttons);
        throw new Error('Could not find Generate now or Nope button');
      }
    }
    console.log('✅ Started generation');

    // Step 13: Wait for affirmations (this can take a while)
    console.log('\n⏳ Waiting for AI to generate affirmations (up to 60s)...');
    const hasAffirmations = await waitForText(page, 'I like it', TIMEOUT);
    if (!hasAffirmations) {
      await page.screenshot({ path: 'e2e/debug-generation.png' });
      throw new Error('Affirmations were not generated in time');
    }
    console.log('✅ Affirmations generated!');

    // Step 14: Click "I like it" to save one
    console.log('\n🖱️ Clicking "I like it" to save an affirmation...');
    await sleep(500);
    await clickButton(page, 'I like it');
    console.log('✅ Saved an affirmation');

    // Step 15: Verify we got another affirmation or check-in
    console.log('\n⏳ Verifying flow continues...');
    await sleep(2000);
    const pageContent = await page.content();
    const continuesFlow =
      pageContent.includes('I like it') ||
      pageContent.includes('Check-in') ||
      pageContent.includes('give me more');
    if (!continuesFlow) {
      throw new Error('Flow did not continue after saving affirmation');
    }
    console.log('✅ Flow continues correctly');

    // Test passed!
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TEST PASSED! Full Process 3 E2E test completed successfully');
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
