import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO14InfoPage() {
  return (
    <InfoPageWrapper id="FO-14" name="Production Onboarding" tagline="Feedback-driven batches with thinking transitions">
      <InfoSummaryBox>
        FO-14 evolves FO-12&apos;s structured selection into a production-ready onboarding flow. Phase 1
        delivers 4 batches of 5 affirmations with feedback-driven regeneration between each batch.
        Phase 2 delivers 20 affirmations in one batch. Thinking screens with sequential personalized
        messages replace simple heart animations.
        <BestFor>Best for production deployment with iterative feedback loops and polished transitions.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-12 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-12</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-14 uses FO-12 as its base, keeping the hybrid discovery approach (static goal + LLM-adapted
          context and tone) while restructuring the affirmation delivery:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>Feedback-driven Phase 1:</strong> 4 batches of 5 with loved/discarded feedback between each</li>
          <li><strong>Streamlined Phase 2:</strong> Single batch of 20 (optional via &quot;Add more later&quot;)</li>
          <li><strong>Thinking screens:</strong> Sequential personalized messages replace heart animations</li>
          <li><strong>No check-in screens:</strong> Thinking transitions serve as natural pauses</li>
        </ul>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Feedback-driven batches with thinking transitions.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Each batch of 5 affirmations in Phase 1 uses the user&apos;s loved and discarded feedback from
          previous batches to generate increasingly personalized content. Thinking screens with
          sequential messages create a sense of the AI actively working for the user.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction</li>
          <li><strong>Name</strong> - Personal greeting</li>
          <li><strong>Familiarity</strong> - Have you used affirmations before? (cosmetic only)</li>
          <li><strong>Goal (Step 3)</strong> - Static question with predefined topic chips</li>
          <li><strong>Thinking A</strong> - Sequential messages while loading context step</li>
          <li><strong>Context (Step 4)</strong> - LLM-adapted question with fragment chips, OR silently skipped</li>
          <li><strong>Thinking B</strong> - Sequential messages while loading tone step</li>
          <li><strong>Tone (Step 5)</strong> - LLM-adapted question with single-word tone chips</li>
          <li><strong>Thinking C</strong> - Sequential messages while generating first batch</li>
          <li><strong>Phase 1</strong> - 4 batches of 5 affirmations with feedback between each</li>
          <li><strong>Theme Selection</strong> - Choose themes for Phase 2 or &quot;Add more later&quot;</li>
          <li><strong>Phase 2</strong> - Review 20 affirmations in one batch</li>
          <li><strong>Completion</strong> - View all loved affirmations</li>
        </ol>
      </InfoSection>

      {/* Key Differences */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-12</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-12</th>
                <th className="pb-2">FO-14</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Phase 1 structure</td>
                <td className="py-1 pr-4">1 batch of 10</td>
                <td className="py-1 font-semibold">4 batches of 5 with feedback</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Phase 2 structure</td>
                <td className="py-1 pr-4">10 + continuous until 30</td>
                <td className="py-1 font-semibold">1 batch of 20 (optional)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Target</td>
                <td className="py-1 pr-4">30 loved affirmations</td>
                <td className="py-1 font-semibold">20 (Phase 1) + 20 (Phase 2) = 40 reviewed</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Transitions</td>
                <td className="py-1 pr-4">Heart animation (single message)</td>
                <td className="py-1 font-semibold">ThinkingScreen (sequential messages)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Check-in screens</td>
                <td className="py-1 pr-4">2 between phases</td>
                <td className="py-1 font-semibold">Replaced by thinking transitions</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Feedback loop</td>
                <td className="py-1 pr-4">Between phases only</td>
                <td className="py-1 font-semibold">Between every batch in Phase 1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <TechnicalDetails>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-14.*</code></p>
        <p>Phase 1 batch size: 5 (4 batches = 20 total)</p>
        <p>Phase 2 batch size: 20 (1 batch)</p>
        <p>Discovery: 2 adaptive steps (steps 4-5, step 4 skippable)</p>
        <p>Question sequence: Goal (static) &rarr; Context (LLM, skippable) &rarr; Tone (LLM)</p>
        <p>Selection method: Card-based &quot;Love it&quot; / &quot;Discard&quot; with per-batch feedback</p>
        <p>Model: openai/gpt-4o</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
