import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO09InfoPage() {
  return (
    <InfoPageWrapper id="FO-09" name="Registration and Final Validation" tagline="Discover in stages, curate without limits">
      <InfoSummaryBox>
        Builds on FO-08 with two key innovations: two-stage discovery (complete sentences first,
        then hybrid fragments) and card-based affirmation curation. The first discovery screen
        uses complete sentences to lower the barrier to entry, while subsequent screens use
        FO-08&apos;s hybrid fragments for deeper exploration. Affirmations are presented one at a
        time on cards with &quot;Love it&quot; / &quot;Discard&quot; buttons, and users can generate
        unlimited batches until satisfied.
        <BestFor>Best for users who want a low-friction start and full control over their affirmation collection.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-08 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-08</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-09 uses FO-08 as its technical base, keeping the 5 Dimensions discovery framework
          and hybrid fragment mechanics while introducing two key changes:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>Two-stage discovery:</strong> Complete sentences on screen 1 (lower friction), hybrid fragments on screens 2+</li>
          <li><strong>Card-based curation:</strong> One-at-a-time affirmation cards with &quot;Love it&quot; / &quot;Discard&quot; instead of thumbs up/down list</li>
          <li><strong>Unlimited batches:</strong> 5 affirmations per batch with unlimited &quot;generate more&quot; cycles</li>
        </ul>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Discover in stages, curate without limits.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Two-stage discovery eases users in: <strong>complete sentences</strong> on the first screen
          let users simply click what resonates (no thought-completion needed), then <strong>hybrid
          fragments</strong> on subsequent screens invite deeper personal expression. Card-based curation
          with unlimited batches means users build their collection at their own pace.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-purple-700 dark:text-purple-400">
                <th className="pb-2 pr-4">Stage</th>
                <th className="pb-2 pr-4">Input Type</th>
                <th className="pb-2">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-purple-700 dark:text-purple-400">
              <tr>
                <td className="py-1 pr-4">Screen 1</td>
                <td className="py-1 pr-4">Complete sentences</td>
                <td className="py-1">Low-friction entry — just click what resonates</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Screens 2+</td>
                <td className="py-1 pr-4">Hybrid fragments</td>
                <td className="py-1">Deeper exploration — complete the thought yourself</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Review</td>
                <td className="py-1 pr-4">Cards (5 per batch)</td>
                <td className="py-1">Focused evaluation — one at a time, unlimited cycles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction to set the tone</li>
          <li><strong>Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Welcome Back</strong> - Personalized welcome with name</li>
          <li><strong>Familiarity</strong> - How familiar are you with affirmations?</li>
          <li><strong>Topics</strong> - Choose what fits you best right now</li>
          <li><strong>Discovery (Sentences)</strong> - First screen uses complete sentences (8 initial + 15 via &quot;More&quot;)</li>
          <li><strong>Discovery (Fragments)</strong> - Subsequent screens use hybrid fragments for deeper exploration</li>
          <li><strong>Card Review</strong> - 5 affirmations presented one at a time: &quot;Love it&quot; or &quot;Discard&quot;</li>
          <li><strong>Summary</strong> - See loved affirmations, choose &quot;I&apos;m good with these&quot; or &quot;I want to create more&quot;</li>
          <li><strong>More Cycles</strong> - Generate another batch of 5, repeat until satisfied (unlimited)</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View all loved affirmations across all batches</li>
        </ol>
      </InfoSection>

      {/* Key Differences */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-08</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-08</th>
                <th className="pb-2">FO-09</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Discovery screen 1</td>
                <td className="py-1 pr-4">Hybrid fragments</td>
                <td className="py-1 font-semibold">Complete sentences</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Reflective statements</td>
                <td className="py-1 pr-4">Optional (agent-generated)</td>
                <td className="py-1 font-semibold">Removed</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Affirmation count</td>
                <td className="py-1 pr-4">20 total (2x10)</td>
                <td className="py-1 font-semibold">5 per batch, unlimited batches</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Affirmation review</td>
                <td className="py-1 pr-4">List with thumbs up/down</td>
                <td className="py-1 font-semibold">One-at-a-time cards</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Review actions</td>
                <td className="py-1 pr-4">Thumbs up / Thumbs down</td>
                <td className="py-1 font-semibold">&quot;Love it&quot; / &quot;Discard&quot;</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Batch cycles</td>
                <td className="py-1 pr-4">Single batch</td>
                <td className="py-1 font-semibold">Unlimited cycles</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Progress bar</td>
                <td className="py-1 pr-4">No</td>
                <td className="py-1 font-semibold">No</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Post-review choice</td>
                <td className="py-1 pr-4">Proceed automatically</td>
                <td className="py-1 font-semibold">&quot;I&apos;m good with these&quot; / &quot;I want to create more&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Two-Stage Discovery">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          The first discovery screen uses complete sentences to ease the user in:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>&quot;I often feel anxious about my performance at work&quot; (complete — just click)</li>
          <li>&quot;I compare myself to others and feel like I&apos;m falling behind&quot; (complete — just click)</li>
          <li>&quot;I struggle to believe compliments are genuine&quot; (complete — just click)</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400 mt-3 mb-3">
          Subsequent screens switch to hybrid fragments for deeper expression:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>&quot;I keep doubting whether I&apos;m...&quot; (fragment — complete the thought)</li>
          <li>&quot;I wish I could feel more confident about...&quot; (fragment — complete the thought)</li>
          <li>&quot;Part of me believes I don&apos;t deserve...&quot; (fragment — complete the thought)</li>
        </ul>
      </InfoSection>

      {/* Card-Based Curation */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Card-Based Curation</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>How card review works:</strong></p>
          <ol className="list-decimal list-inside ml-4 mb-3">
            <li><strong>5 affirmations generated</strong> - AI creates a batch based on discovery answers</li>
            <li><strong>One card at a time</strong> - Each affirmation displayed prominently on its own card</li>
            <li><strong>&quot;Love it&quot; or &quot;Discard&quot;</strong> - Binary choice per card, no going back</li>
            <li><strong>Progress counter</strong> - Shows &quot;1/5&quot;, &quot;2/5&quot;, etc.</li>
            <li><strong>Summary screen</strong> - Lists all loved affirmations with two options</li>
          </ol>
          <p><strong>After reviewing all 5:</strong> Choose &quot;I&apos;m good with these&quot; to proceed, or &quot;I want to create more&quot; for another batch. Subsequent batches are informed by previous likes and dislikes.</p>
        </div>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-09-discovery</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-09.*</code></p>
        <p>Affirmation count: 5 per batch (unlimited batches)</p>
        <p>Discovery screen 1: Complete sentences (no &quot;...&quot;)</p>
        <p>Discovery screens 2+: Hybrid fragments (with &quot;...&quot;)</p>
        <p>Selection method: Card-based &quot;Love it&quot; / &quot;Discard&quot;</p>
        <p>Model: openai/gpt-4o-mini</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
