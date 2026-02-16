import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO12InfoPage() {
  return (
    <InfoPageWrapper id="FO-12" name="Structured 30-Affirmation Journey" tagline="Guided selection with emotional check-ins">
      <InfoSummaryBox>
        FO-12 replaces FO-11&apos;s open-ended affirmation review loop with a structured 30-affirmation
        selection journey across three phases (10+10+remaining). The discovery phase is reduced to 2 LLM
        steps (context and tone), and emotional check-in screens between phases validate effort and
        reinforce personalization.
        <BestFor>Best for users who thrive with a clear target and structured progression toward a curated set of affirmations.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-11 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-11</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-12 uses FO-11 as its base, keeping the hybrid discovery approach (static goal + LLM-adapted
          context and tone) while introducing a structured selection flow:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>3-phase selection:</strong> 10 + 10 + remaining affirmations across three distinct phases</li>
          <li><strong>Emotional check-ins:</strong> Supportive screens between phases that validate effort</li>
          <li><strong>30-affirmation target:</strong> Clear goal replaces open-ended &quot;generate more&quot; loop</li>
          <li><strong>Removed Additional Context:</strong> Discovery reduced to 2 LLM steps (context + tone)</li>
        </ul>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Guided selection with emotional check-ins.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          The user selects exactly 30 affirmations across three phases. Between each phase, a check-in
          screen validates their effort and signals that the next batch is personalized based on their
          selections. This creates a sense of progression and investment.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Welcome</strong> - Warm introduction</li>
          <li><strong>Name</strong> - Personal greeting</li>
          <li><strong>Familiarity</strong> - Have you used affirmations before? (cosmetic only)</li>
          <li><strong>Goal (Step 3)</strong> - Static question with predefined topic chips</li>
          <li><strong>Context (Step 4)</strong> - LLM-adapted question with fragment chips, OR silently skipped</li>
          <li><strong>Tone (Step 5)</strong> - LLM-adapted question with single-word tone chips</li>
          <li><strong>Start Screen</strong> - Motivational screen before first affirmations</li>
          <li><strong>Phase 1</strong> - Review 10 affirmations: &quot;Love it&quot; or &quot;Discard&quot;</li>
          <li><strong>Check-in 1</strong> - Validates effort, signals refinement</li>
          <li><strong>Phase 2</strong> - Review 10 feedback-refined affirmations</li>
          <li><strong>Check-in 2</strong> - Signals progress, introduces final phase</li>
          <li><strong>Phase 3</strong> - Continue until 30 total loved affirmations</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View all 30 loved affirmations</li>
        </ol>
      </InfoSection>

      {/* Key Differences */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-11</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-11</th>
                <th className="pb-2">FO-12</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Review flow</td>
                <td className="py-1 pr-4">Open-ended with summary</td>
                <td className="py-1 font-semibold">3-phase structured (10+10+remaining)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Target</td>
                <td className="py-1 pr-4">User decides when done</td>
                <td className="py-1 font-semibold">Exactly 30 loved affirmations</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Batch size</td>
                <td className="py-1 pr-4">5 per batch</td>
                <td className="py-1 font-semibold">10 per batch (phases 1-2), dynamic (phase 3)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Check-in screens</td>
                <td className="py-1 pr-4">None</td>
                <td className="py-1 font-semibold">2 emotional check-ins between phases</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Additional Context</td>
                <td className="py-1 pr-4">Step 7 (optional)</td>
                <td className="py-1 font-semibold">Removed</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Progress counter</td>
                <td className="py-1 pr-4">Per-batch (3/5)</td>
                <td className="py-1 font-semibold">Global (X of 30 selected)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Summary screen</td>
                <td className="py-1 pr-4">After each batch</td>
                <td className="py-1 font-semibold">Removed (replaced by check-ins)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <TechnicalDetails>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-12.*</code></p>
        <p>Affirmation count: 10 per batch (phases 1-2), dynamic (phase 3)</p>
        <p>Target: 30 loved affirmations</p>
        <p>Discovery: 2 adaptive steps (steps 4-5, step 4 skippable)</p>
        <p>Question sequence: Goal (static) &rarr; Context (LLM, skippable) &rarr; Tone (LLM)</p>
        <p>Selection method: Card-based &quot;Love it&quot; / &quot;Discard&quot; across 3 phases</p>
        <p>Model: openai/gpt-4o</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
