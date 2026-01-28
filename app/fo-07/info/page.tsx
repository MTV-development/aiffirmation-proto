import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO07InfoPage() {
  return (
    <InfoPageWrapper id="FO-07" name="Full Onboarding (Card Selection)" tagline="Rate affirmations with Like/Don't Like instead of swiping">
      <InfoSummaryBox>
        A simplified affirmation selection flow where users review 20 AI-generated affirmations using
        Like/Don&apos;t Like buttons instead of swipe gestures. The interface presents all cards at once
        for a more deliberate, thoughtful selection process.
        <BestFor>Best for users who prefer button-based interactions over swipe gestures.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-04 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-04</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-07 is closely based on FO-04 in terms of prompts and mechanics. It shares the same:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li>Welcome flow (steps 0-3: welcome, name, personalized greeting, familiarity)</li>
          <li>Topic selection with the same chip options</li>
          <li>Dynamic discovery AI agent and prompts</li>
          <li>Affirmation generation agent and prompts</li>
        </ul>
        <p className="mt-2 text-amber-700 dark:text-amber-400">
          The key differences are in the affirmation selection UI (buttons vs swipe) and transitions (heart vs confetti).
        </p>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Choose your affirmations deliberately, not reactively.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          FO-07 replaces the swipe-based card selection with explicit Like/Don&apos;t Like buttons.
          This allows users to make more considered choices about which affirmations resonate with them,
          reviewing all 20 cards in a single session with a pulsing heart transition effect.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction to set the tone</li>
          <li><strong>Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Welcome Back</strong> - Personalized welcome with name</li>
          <li><strong>Familiarity</strong> - How familiar are you with affirmations? (same as FO-04)</li>
          <li><strong>Topics</strong> - Choose what fits you best right now</li>
          <li><strong>Dynamic Discovery</strong> - AI-generated questions with reflective chips</li>
          <li><strong>Card Selection</strong> - Review 20 affirmations with Like/Don&apos;t Like buttons</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View your curated affirmation list</li>
        </ol>
      </InfoSection>

      {/* Key Difference */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-04</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-04</th>
                <th className="pb-2">FO-07</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Affirmation selection</td>
                <td className="py-1 pr-4">Swipe cards (keep/discard)</td>
                <td className="py-1">Like/Don&apos;t Like buttons</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Batch size</td>
                <td className="py-1 pr-4">10 at a time, 3 batches</td>
                <td className="py-1">20 at once</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Feedback loop</td>
                <td className="py-1 pr-4">Iterative (learns from swipes)</td>
                <td className="py-1">Single review</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Progress bar</td>
                <td className="py-1 pr-4">Yes</td>
                <td className="py-1">No</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Transitions</td>
                <td className="py-1 pr-4">Confetti</td>
                <td className="py-1">Pulsing heart</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Button-based selection</strong> - Like/Don&apos;t Like buttons replace swipe gestures</li>
          <li><strong>20 cards at once</strong> - All affirmations presented in a single batch</li>
          <li><strong>Pulsing heart transition</strong> - Visual feedback when liking an affirmation</li>
          <li><strong>No progress bar</strong> - Simpler UI without batch progress tracking</li>
          <li><strong>Single review pass</strong> - One opportunity to evaluate all affirmations</li>
          <li><strong>Same dynamic discovery</strong> - AI-generated questions from FO-04</li>
        </ul>
      </InfoSection>

      {/* Selection Interface */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Card Selection Interface</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>Each affirmation card displays:</strong></p>
          <ol className="list-decimal list-inside ml-4 mb-3">
            <li><strong>Affirmation text</strong> - The personalized affirmation to consider</li>
            <li><strong>Like button</strong> - Add this affirmation to your collection</li>
            <li><strong>Don&apos;t Like button</strong> - Skip this affirmation</li>
          </ol>
          <p><strong>Transition effect:</strong> When you like an affirmation, a pulsing heart animation provides positive feedback.</p>
        </div>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-07</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-07.*</code></p>
        <p>Card batch: 20 affirmations (single batch)</p>
        <p>Selection method: Like/Don&apos;t Like buttons</p>
        <p>Model: openai/gpt-4o-mini</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
