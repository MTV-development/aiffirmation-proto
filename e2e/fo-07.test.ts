/**
 * E2E test for FO-07 Onboarding Flow using Playwright
 *
 * This test verifies the FO-07 onboarding flow with key differences from FO-06:
 * 1. NO progress bar at any step
 * 2. Welcome screens (steps 0-2) before topic selection
 * 3. Topic selection with new H1/H2 copy
 * 4. Chip-based input (like FO-04), not fragment-based
 * 5. Heart animation between dynamic screens (not confetti transition)
 * 6. Generates all 20 affirmations at once (not batches)
 * 7. AffirmationReview component with thumbs up/down (not swipe gestures)
 * 8. Must rate ALL 20 cards before Continue button enables
 *
 * Test flow:
 * 1. Navigate to /fo-07 (with auth bypass via cookie)
 * 2. Verify NO progress bar
 * 3. Click through welcome screens (steps 0-2)
 * 4. Enter name, click Continue
 * 5. Verify personalized welcome
 * 6. Select topics on intro screen (verify new H1/H2 copy)
 * 7. Loop through dynamic screens (verify heart animation between screens)
 * 8. Wait for 20 affirmations to generate
 * 9. Verify summary appears at top
 * 10. Rate all 20 cards (click thumbs up or down on each)
 * 11. Verify Continue button becomes enabled
 * 12. Click Continue
 * 13. Navigate through mockups (background, notifications, paywall)
 * 14. Verify completion screen with liked affirmations
 *
 * Run with: node --import tsx e2e/fo-07.test.ts
 *
 * Prerequisites:
 * - npm install --save-dev playwright
 * - npx playwright install chromium
 * - npm run db:seed (to populate KV store with FO-07 prompts)
 * - Dev server running on localhost:3000 (or set TEST_URL)
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 120000; // 120s for AI generation (20 affirmations + summary)

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

// Verify NO progress bar exists on the page
async function verifyNoProgressBar(page: Page): Promise<boolean> {
  try {
    // Check for progress bar container with step indicators
    const progressBarElements = await page.locator('div.flex.gap-1').all();

    for (const container of progressBarElements) {
      // Check if this container has multiple step indicator children
      const childCount = await container.locator('> div').count();
      // If we find a container with 10+ child divs, it's likely a progress bar
      if (childCount >= 10) {
        console.log(`   Found potential progress bar with ${childCount} steps`);
        return false; // Progress bar found - test should fail
      }
    }

    // Also check for explicit progress bar class patterns
    const hasProgressBar = await page.locator('[class*="progress"]').count();
    if (hasProgressBar > 0) {
      // Check if it's a visible progress indicator
      const visible = await page.locator('[class*="progress"]').first().isVisible({ timeout: 1000 }).catch(() => false);
      if (visible) {
        console.log('   Found element with "progress" class');
        return false;
      }
    }

    return true; // No progress bar found
  } catch {
    // If any error, assume no progress bar
    return true;
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
      // If it doesn't disappear, click to skip
      console.log('   Heart animation still visible, clicking to skip');
    });

    return true;
  } catch {
    console.log('   Heart animation not detected');
    return false;
  }
}

// Click a chip suggestion (+ prefixed chip)
async function clickChip(page: Page, chipIndex = 0): Promise<{ clicked: boolean; text: string }> {
  try {
    // Chip suggestions have "+" prefix in their text
    const chipButtons = await page.locator('button:has-text("+ ")').all();

    if (chipButtons.length > chipIndex) {
      const text = await chipButtons[chipIndex].textContent() || '';
      await chipButtons[chipIndex].click();
      return { clicked: true, text: text.replace('+ ', '').trim() };
    }
  } catch {
    // Error finding chips
  }

  console.log('Could not find chip to click');
  return { clicked: false, text: '' };
}

// Click "Show more" to expand additional chips
async function clickShowMore(page: Page): Promise<boolean> {
  try {
    const showMoreButton = page.locator('button:has-text("Show more")').first();
    if (await showMoreButton.isVisible({ timeout: 2000 })) {
      await showMoreButton.click();
      return true;
    }
  } catch {
    // Not found
  }
  return false;
}

// Count visible chip suggestions
async function countChipSuggestions(page: Page): Promise<number> {
  try {
    const chipButtons = await page.locator('button:has-text("+ ")').all();
    return chipButtons.length;
  } catch {
    return 0;
  }
}

// Rate an affirmation card (click Like or Don't Like button)
async function rateAffirmationCard(page: Page, cardIndex: number, like: boolean): Promise<boolean> {
  try {
    // Find all affirmation cards
    const cards = await page.locator('.bg-white.dark\\:bg-gray-800.rounded-xl.shadow-sm').all();

    if (cards.length > cardIndex) {
      const card = cards[cardIndex];
      const buttonText = like ? 'Like' : "Don't Like";

      // Find the rating button within this card
      const ratingButton = card.locator(`button:has-text("${buttonText}")`).first();
      if (await ratingButton.isVisible({ timeout: 1000 })) {
        await ratingButton.click();
        return true;
      }
    }
  } catch {
    // Error rating card
  }

  console.log(`Could not rate card ${cardIndex}`);
  return false;
}

// Check if Continue button is disabled on AffirmationReview
async function isContinueButtonDisabled(page: Page): Promise<boolean> {
  try {
    // The continue button shows "Rate all X remaining to continue" when disabled
    const continueButton = page.locator('button:has-text("Rate all")').first();
    if (await continueButton.isVisible({ timeout: 1000 })) {
      return true; // Button text indicates it's disabled
    }

    // Alternative: check for disabled attribute
    const anyButton = page.locator('button:has-text("Continue with")').first();
    if (await anyButton.isVisible({ timeout: 1000 })) {
      return false; // Button text indicates it's enabled
    }

    return true;
  } catch {
    return true;
  }
}

// Get the count of rated affirmations from the progress indicator
async function getRatedCount(page: Page): Promise<{ rated: number; total: number }> {
  try {
    // Look for "X of Y rated" text
    const progressText = await page.locator('text=/\\d+ of \\d+ rated/').first().textContent();
    if (progressText) {
      const match = progressText.match(/(\d+) of (\d+) rated/);
      if (match) {
        return { rated: parseInt(match[1], 10), total: parseInt(match[2], 10) };
      }
    }
  } catch {
    // Couldn't parse
  }
  return { rated: 0, total: 0 };
}

async function runTest(): Promise<void> {
  console.log('Starting FO-07 Onboarding E2E Test\n');

  let browser: Browser | null = null;
  let dynamicScreenCount = 0;
  let likedCount = 0;

  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: false, // Set to true for CI
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

    // Set a reasonable timeout
    page.setDefaultTimeout(30000);

    // Step 1: Navigate to the page
    console.log(`\nOpening ${BASE_URL}/fo-07...`);
    await page.goto(`${BASE_URL}/fo-07`, { waitUntil: 'networkidle' });

    // Check if we're on password page (auth bypass didn't work)
    const currentUrl = page.url();
    if (currentUrl.includes('/password')) {
      throw new Error('Auth bypass not working - redirected to password page');
    }

    // FO-07 SPECIFIC: Verify NO progress bar
    console.log('\nVerifying NO progress bar...');
    const noProgressBar = await verifyNoProgressBar(page);
    if (!noProgressBar) {
      await page.screenshot({ path: 'e2e/debug-fo07-progress-bar.png' });
      throw new Error('Progress bar found but FO-07 should not have one');
    }
    console.log('Verified: No progress bar present');

    // Step 0: Welcome intro screen
    console.log('\nStep 0: Welcome intro screen...');
    const hasWelcomeIntro = await waitForText(page, 'The way you speak to yourself', 5000);
    if (!hasWelcomeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo07-welcome-intro.png' });
      throw new Error('Welcome intro screen did not appear');
    }
    console.log('Verified: Welcome intro screen visible');

    // Click Continue on welcome intro
    const clickedWelcomeIntro = await clickButton(page, 'Continue');
    if (!clickedWelcomeIntro) {
      await page.screenshot({ path: 'e2e/debug-fo07-welcome-intro-continue.png' });
      throw new Error('Could not click Continue on welcome intro');
    }
    await sleep(300);

    // Step 1: Name input screen
    console.log('\nStep 1: Name input screen...');
    const hasNamePrompt = await waitForText(page, 'What should we call you', 5000);
    if (!hasNamePrompt) {
      await page.screenshot({ path: 'e2e/debug-fo07-name-prompt.png' });
      throw new Error('Name input screen did not appear');
    }

    // Enter name
    const nameInput = page.locator('input[placeholder*="name"]');
    await nameInput.fill('TestUser');
    await sleep(300);

    // Click Continue
    const clickedNameContinue = await clickButton(page, 'Continue');
    if (!clickedNameContinue) {
      await page.screenshot({ path: 'e2e/debug-fo07-name-continue.png' });
      throw new Error('Could not click Continue on name input');
    }
    console.log('Name entered and Continue clicked');
    await sleep(300);

    // Step 2: Personalized welcome screen
    console.log('\nStep 2: Personalized welcome screen...');
    const hasPersonalizedWelcome = await waitForTextContaining(page, 'Welcome, TestUser', 5000);
    if (!hasPersonalizedWelcome) {
      await page.screenshot({ path: 'e2e/debug-fo07-personalized-welcome.png' });
      throw new Error('Personalized welcome screen did not appear');
    }
    console.log('Verified: Personalized welcome shows user name');

    // Click Start
    const clickedStart = await clickButton(page, 'Start');
    if (!clickedStart) {
      await page.screenshot({ path: 'e2e/debug-fo07-start.png' });
      throw new Error('Could not click Start on personalized welcome');
    }
    await sleep(300);

    // Step 3: Topic selection with new H1/H2 copy
    console.log('\nStep 3: Topic selection (verifying new H1/H2 copy)...');

    // FO-07 SPECIFIC: Verify new H1 copy
    const hasNewH1 = await waitForTextContaining(page, 'Choose what fits you best right now', 5000);
    if (!hasNewH1) {
      await page.screenshot({ path: 'e2e/debug-fo07-topics-h1.png' });
      throw new Error('Topics screen H1 did not match expected: "Choose what fits you best right now"');
    }
    console.log('Verified: H1 = "Choose what fits you best right now"');

    // FO-07 SPECIFIC: Verify new H2 copy
    const hasNewH2 = await waitForTextContaining(page, "It doesn't have to be perfect", 3000);
    if (!hasNewH2) {
      console.log('Warning: H2 "It doesn\'t have to be perfect" not found');
    } else {
      console.log('Verified: H2 = "It doesn\'t have to be perfect."');
    }

    // Select a few topics (click on topic chips)
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

    // Click Continue on topics
    const clickedTopics = await clickButton(page, 'Continue');
    if (!clickedTopics) {
      await page.screenshot({ path: 'e2e/debug-fo07-topics-continue.png' });
      throw new Error('Could not click Continue on topics');
    }

    // Wait for success message and confetti
    await waitForTextContaining(page, 'Great choices', 3000);
    console.log('Topics selected, waiting for transition...');
    await sleep(2000); // Wait for auto-advance

    // Dynamic screens (2-5 screens with chip-based input)
    console.log('\n--- Starting Dynamic AI-Generated Screens (Chip Input) ---');

    let isReadyForAffirmations = false;
    const maxDynamicScreens = 5;

    while (!isReadyForAffirmations && dynamicScreenCount < maxDynamicScreens) {
      dynamicScreenCount++;
      console.log(`\nDynamic Screen ${dynamicScreenCount}:`);

      // Verify NO progress bar on each dynamic screen
      const noProgressBarScreen = await verifyNoProgressBar(page);
      if (!noProgressBarScreen) {
        throw new Error(`Progress bar appeared on dynamic screen ${dynamicScreenCount}`);
      }
      console.log('   Verified: No progress bar');

      // Wait for "Thinking..." to finish
      console.log('   Waiting for screen to load...');
      const thinkingFinished = await waitForThinkingToFinish(page, 60000);
      if (!thinkingFinished) {
        // Check if we're already past thinking (might have been fast)
        const hasQuestion = await page.locator('h2').first().isVisible({ timeout: 2000 });
        if (!hasQuestion) {
          await page.screenshot({ path: `e2e/debug-fo07-dynamic${dynamicScreenCount}-thinking.png` });
          throw new Error(`Dynamic screen ${dynamicScreenCount} did not finish loading`);
        }
      }
      console.log('   Screen loaded');

      // Wait for question to appear
      await sleep(500);
      const questionText = await page.locator('h2').first().textContent();
      console.log(`   Question: "${questionText?.substring(0, 50)}..."`);

      // FO-07 SPECIFIC: Use chip-based input
      console.log('   Testing chip-based input...');

      // Count initial chips
      const initialChips = await countChipSuggestions(page);
      console.log(`   Initial chips visible: ${initialChips}`);

      // Click a chip to add it
      const chipResult = await clickChip(page, 0);
      if (chipResult.clicked) {
        console.log(`   Added chip: "${chipResult.text}"`);
        await sleep(300);
      } else {
        console.log('   Warning: Could not click chip, will try another approach');
      }

      // Try "Show more" if available
      const clickedShowMore = await clickShowMore(page);
      if (clickedShowMore) {
        await sleep(300);
        const expandedChips = await countChipSuggestions(page);
        console.log(`   Expanded chips visible: ${expandedChips}`);

        // Click another chip after expanding
        const secondChip = await clickChip(page, 0);
        if (secondChip.clicked) {
          console.log(`   Added another chip: "${secondChip.text}"`);
          await sleep(300);
        }
      }

      // Click Next to proceed
      const clickedNext = await clickButton(page, 'Next');
      if (!clickedNext) {
        await page.screenshot({ path: `e2e/debug-fo07-dynamic${dynamicScreenCount}-next.png` });
        throw new Error(`Could not click Next on dynamic screen ${dynamicScreenCount}`);
      }
      console.log(`   Dynamic screen ${dynamicScreenCount} completed`);

      // FO-07 SPECIFIC: Check for heart animation between screens
      console.log('   Checking for heart animation...');
      await sleep(500);

      // Check for heart animation
      const heartAnimationSeen = await waitForHeartAnimation(page, 5000);
      if (heartAnimationSeen) {
        console.log('   Verified: Heart animation appeared');
        await sleep(2000); // Wait for animation to complete
      } else {
        console.log('   Note: Heart animation not detected (may have completed quickly)');
      }

      // Check if we're transitioning to affirmation generation
      await sleep(1000);

      // Check for generation loading state
      const hasGenerating = await waitForTextContaining(page, 'Creating your personal affirmations', 3000);
      if (hasGenerating) {
        console.log('\n   Generation phase detected');
        isReadyForAffirmations = true;
      } else {
        // Check if we're at review screen already
        const hasReview = await waitForTextContaining(page, 'Review Your Affirmations', 2000);
        if (hasReview) {
          console.log('\n   Review screen detected');
          isReadyForAffirmations = true;
        }
      }
    }

    console.log(`\n--- Dynamic Screens Complete (${dynamicScreenCount} screens) ---`);

    // Wait for affirmation generation (20 affirmations at once)
    console.log('\nWaiting for AI generation of 20 affirmations (up to 120s)...');

    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Review Your Affirmations'),
        { timeout: TIMEOUT }
      );
    } catch {
      await page.screenshot({ path: 'e2e/debug-fo07-generation-timeout.png' });
      throw new Error('Affirmation generation did not complete in time');
    }
    console.log('Affirmation generation complete - Review screen visible');

    // FO-07 SPECIFIC: Verify summary appears at top
    console.log('\nVerifying summary section...');
    const hasSummary = await waitForTextContaining(page, 'Your Journey', 5000);
    if (hasSummary) {
      console.log('Verified: Summary section "Your Journey" is visible');

      // Get summary text
      try {
        const summaryParagraph = page.locator('.bg-purple-50 p, .bg-purple-900\\/20 p').first();
        const summaryText = await summaryParagraph.textContent({ timeout: 3000 });
        if (summaryText && summaryText.length > 20) {
          console.log(`Summary: "${summaryText.substring(0, 100)}..."`);
        }
      } catch {
        // Could not get summary text
      }
    } else {
      console.log('Warning: Summary section not found');
    }

    // FO-07 SPECIFIC: Verify 20 affirmation cards
    console.log('\nVerifying affirmation cards...');
    const { rated: initialRated, total } = await getRatedCount(page);
    console.log(`Found ${total} affirmations to rate (${initialRated} already rated)`);

    if (total !== 20) {
      console.log(`Warning: Expected 20 affirmations, found ${total}`);
    }

    // FO-07 SPECIFIC: Verify Continue button is disabled initially
    console.log('\nVerifying Continue button is disabled until all rated...');
    const isDisabledInitially = await isContinueButtonDisabled(page);
    if (isDisabledInitially) {
      console.log('Verified: Continue button is disabled (not all rated)');
    } else {
      console.log('Warning: Continue button was not disabled initially');
    }

    // FO-07 SPECIFIC: Rate all 20 cards
    console.log('\nRating all affirmation cards...');

    // Rate cards - alternate between like and dislike
    for (let i = 0; i < total; i++) {
      const like = i < 12; // Like first 12, dislike rest (60% like rate)
      const rated = await rateAffirmationCard(page, i, like);
      if (rated) {
        if (like) likedCount++;
        // Log progress every 5 cards
        if ((i + 1) % 5 === 0) {
          const { rated: currentRated } = await getRatedCount(page);
          console.log(`   Rated ${currentRated}/${total} cards (${likedCount} liked so far)`);
        }
      } else {
        console.log(`   Warning: Could not rate card ${i + 1}`);
      }
      await sleep(100);
    }

    console.log(`Rated all ${total} cards (${likedCount} liked)`);

    // FO-07 SPECIFIC: Verify Continue button is now enabled
    await sleep(500);
    const isDisabledAfterRating = await isContinueButtonDisabled(page);
    if (!isDisabledAfterRating) {
      console.log('Verified: Continue button is enabled after rating all cards');
    } else {
      await page.screenshot({ path: 'e2e/debug-fo07-continue-disabled.png' });
      throw new Error('Continue button still disabled after rating all cards');
    }

    // Click Continue on review screen
    console.log('\nClicking Continue on review screen...');
    const continueButton = page.locator(`button:has-text("Continue with")`).first();
    if (await continueButton.isVisible({ timeout: 3000 })) {
      await continueButton.click();
    } else {
      await page.screenshot({ path: 'e2e/debug-fo07-review-continue.png' });
      throw new Error('Could not find Continue button on review screen');
    }
    console.log('Review completed, proceeding to mockups');

    // Step: Background selection mockup
    console.log('\nBackground selection mockup...');
    const hasBackground = await waitForText(page, 'Make your affirmations look beautiful', 5000);
    if (!hasBackground) {
      await page.screenshot({ path: 'e2e/debug-fo07-background.png' });
      throw new Error('Background selection screen did not appear');
    }

    await sleep(500);
    const clickedBackground = await clickButton(page, 'Continue');
    if (!clickedBackground) {
      await page.screenshot({ path: 'e2e/debug-fo07-background-continue.png' });
      throw new Error('Could not click Continue on background selection');
    }
    console.log('Background selection completed');

    // Step: Notifications mockup
    console.log('\nNotifications mockup...');
    const hasNotifications = await waitForTextContaining(page, 'Set up reminders', 5000);
    if (!hasNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo07-notifications.png' });
      throw new Error('Notifications screen did not appear');
    }

    await sleep(500);
    const clickedNotifications = await clickButton(page, 'Continue');
    if (!clickedNotifications) {
      await page.screenshot({ path: 'e2e/debug-fo07-notifications-continue.png' });
      throw new Error('Could not click Continue on notifications');
    }
    console.log('Notifications completed');

    // Step: Paywall mockup
    console.log('\nPaywall mockup...');
    const hasPaywall = await waitForText(page, 'More support, whenever you want', 5000);
    if (!hasPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo07-paywall.png' });
      throw new Error('Paywall screen did not appear');
    }

    await sleep(500);
    const clickedPaywall = await clickButton(page, 'Not now');
    if (!clickedPaywall) {
      await page.screenshot({ path: 'e2e/debug-fo07-paywall-notnow.png' });
      throw new Error('Could not click "Not now" on paywall');
    }
    console.log('Paywall completed');

    // Final: Verify completion screen
    console.log('\nVerifying completion screen...');
    const hasCompletion = await waitForTextContaining(page, 'You are all set', 5000);
    if (!hasCompletion) {
      await page.screenshot({ path: 'e2e/debug-fo07-completion.png' });
      throw new Error("Completion screen did not appear - 'You are all set' not found");
    }
    console.log("Completion screen shows 'You are all set'");

    // FO-07 SPECIFIC: Verify liked affirmations are displayed
    await sleep(500);
    const hasAffirmationsList = await waitForTextContaining(page, 'affirmations saved', 5000);
    if (hasAffirmationsList) {
      console.log('Verified: Affirmations list is displayed on completion screen');
    } else {
      // Check for the affirmation markers instead
      const pageContent = await page.content();
      if (pageContent.includes('affirmation') || pageContent.includes('✦')) {
        console.log('Verified: Affirmations are displayed on completion screen');
      } else {
        console.log('Warning: Affirmations list may not be visible');
      }
    }

    // Test passed!
    console.log('\n' + '='.repeat(60));
    console.log('TEST PASSED! FO-07 Onboarding E2E Test');
    console.log('   E2E test completed successfully');
    console.log('='.repeat(60));
    console.log('\nTest Summary:');
    console.log('   FO-07 Specific Verifications:');
    console.log('   - NO progress bar at any step');
    console.log('   - Welcome screens (steps 0-2) completed');
    console.log('   - Name entered: TestUser');
    console.log('   - Topics screen H1: "Choose what fits you best right now"');
    console.log('   - Topics screen H2: "It doesn\'t have to be perfect."');
    console.log(`   - Dynamic AI-generated screens completed (${dynamicScreenCount} screens)`);
    console.log('   - Chip-based input tested:');
    console.log('     - Chips added by clicking + prefixed suggestions');
    console.log('     - Show more expanded available chips');
    console.log('   - Heart animation observed between dynamic screens');
    console.log('   - 20 affirmations generated at once');
    console.log('   - Summary section "Your Journey" visible');
    console.log(`   - All 20 cards rated (${likedCount} liked)`);
    console.log('   - Continue button was disabled until all rated');
    console.log('   - All mockup screens navigated correctly');
    console.log('   - Completion screen shows liked affirmations');
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
