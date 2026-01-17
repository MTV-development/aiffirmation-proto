import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO02InfoPage() {
  return (
    <InfoPageWrapper id="FO-02" name="Full Onboarding (Iterative)" tagline="Complete warm onboarding flow with real-time learning from user feedback">
      <InfoSummaryBox>
        Same 10-step onboarding journey as FO-01, but with true iterative improvement. Instead of
        generating 100 affirmations upfront, FO-02 generates 10 affirmations per batch and learns
        from your swipes between batches.
        <BestFor>Best for users who want a guided onboarding that adapts to their preferences in real-time.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Your swipes help us tailor the next ones to you.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          FO-01 made this promise but couldn&apos;t deliver. FO-02 makes it real.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome &amp; Name</strong> - Personal greeting to establish connection</li>
          <li><strong>Intention Capture</strong> - Open text input (like AP-01) or topic inspiration</li>
          <li><strong>Batch 1 Generation</strong> - 10 affirmations created from your intention</li>
          <li><strong>Swipe Selection</strong> - Down to keep, up to discard (10 cards)</li>
          <li><strong>Checkpoint</strong> - Option to continue or finish</li>
          <li><strong>Batch 2 Generation</strong> - 10 new affirmations informed by batch 1 feedback</li>
          <li><strong>Batch 3 Generation</strong> - Final batch, most aligned with your preferences</li>
          <li><strong>Personalization</strong> - Background and notification preferences</li>
          <li><strong>Completion</strong> - View your curated affirmation collection</li>
        </ol>
      </InfoSection>

      {/* Key Difference */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Difference from FO-01</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-01</th>
                <th className="pb-2">FO-02</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Generation timing</td>
                <td className="py-1 pr-4">100 upfront</td>
                <td className="py-1">10 per batch</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Agent calls</td>
                <td className="py-1 pr-4">1 call total</td>
                <td className="py-1">3 calls (one per batch)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Feedback loop</td>
                <td className="py-1 pr-4">None</td>
                <td className="py-1">Approved/skipped inform next batch</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Learning</td>
                <td className="py-1 pr-4">None</td>
                <td className="py-1">Style matching + pattern avoidance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Key Features">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Same 10-step onboarding UX as FO-01</strong> - Familiar, warm experience</li>
          <li><strong>Batch-by-batch generation</strong> - 10 affirmations per batch (3 batches max)</li>
          <li><strong>Real feedback loop</strong> - Approved affirmations guide style matching</li>
          <li><strong>Pattern avoidance</strong> - Skipped affirmations indicate what to avoid</li>
          <li><strong>Loading states between batches</strong> - Personalized copy during generation</li>
          <li><strong>No duplicates</strong> - All previous affirmations excluded from new batches</li>
        </ul>
      </InfoSection>

      {/* Feedback Loop */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">How the Feedback Loop Works</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>What we learn from approved affirmations:</strong></p>
          <ul className="list-disc list-inside ml-4 mb-3">
            <li>Length preference (short vs. detailed)</li>
            <li>Tone preference (gentle vs. assertive)</li>
            <li>Structure preference (simple &quot;I am&quot; vs. growth-oriented)</li>
            <li>Themes that resonate</li>
          </ul>
          <p><strong>What we learn from skipped affirmations:</strong></p>
          <ul className="list-disc list-inside ml-4">
            <li>Patterns to avoid</li>
            <li>Phrasing styles that don&apos;t connect</li>
            <li>Tones that feel off</li>
          </ul>
        </div>
      </section>

      {/* Inspiration Sources */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Built From Best Practices</h3>
        <ul className="list-disc list-inside text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>FO-01:</strong> 10-step onboarding UX and swipe selection</li>
          <li><strong>AP-01:</strong> Quality guidelines for affirmations</li>
          <li><strong>CS-01:</strong> Feedback loop pattern (approved/skipped lists)</li>
        </ul>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-02</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-02.*</code></p>
        <p>Output: 10 affirmations per batch (JSON array)</p>
        <p>Prompts: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">prompt_initial</code> (batch 1), <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">prompt_with_feedback</code> (batches 2-3)</p>
        <p>Model: openai/gpt-4o-mini (temp 0.9)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
