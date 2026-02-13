import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO11InfoPage() {
  return (
    <InfoPageWrapper id="FO-11" name="Guided Discovery Hybrid" tagline="Structured intent, conversational delivery">
      <InfoSummaryBox>
        An evolution of FO-10 that replaces hardcoded questions (steps 5-7) with LLM-adapted questions
        driven by structured intents. The discovery agent can skip redundant questions and generates
        single-word tone chips instead of full sentences. Step 4 (goal) remains static. Everything
        outside the discovery phase is identical to FO-10.
        <BestFor>Best for users who benefit from adaptive conversation that respects what they already shared.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-10 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-10</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-11 uses FO-10 as its base, keeping card-based curation, unlimited generate-more cycles,
          and the two-stage input approach while introducing three key changes:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>Adaptive questions:</strong> Steps 5-6 use LLM-generated questions that reference prior answers</li>
          <li><strong>Skip logic:</strong> Step 5 (context) is silently skipped if the goal answer already provides life context</li>
          <li><strong>Single-word tone chips:</strong> Step 6 uses single words (Gentle, Bold, Calm) instead of full sentences</li>
        </ul>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Structured intent, conversational delivery.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Each discovery step has a fixed intent (what to discover), but the LLM formulates the actual
          question wording and can skip redundant steps. This preserves FO-10&apos;s structured rails
          while adding FO-09&apos;s conversational adaptability.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-purple-700 dark:text-purple-400">
                <th className="pb-2 pr-4">Step</th>
                <th className="pb-2 pr-4">Intent</th>
                <th className="pb-2">Chip Type</th>
              </tr>
            </thead>
            <tbody className="text-purple-700 dark:text-purple-400">
              <tr>
                <td className="py-1 pr-4">Step 4 (Goal)</td>
                <td className="py-1 pr-4">What is your primary goal?</td>
                <td className="py-1">Predefined single-word chips (36 topics)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 5 (Context)</td>
                <td className="py-1 pr-4">Life context behind the goal (skippable)</td>
                <td className="py-1">LLM-generated fragments (ending with &quot;...&quot;)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 6 (Tone)</td>
                <td className="py-1 pr-4">Preferred support tone</td>
                <td className="py-1">LLM-generated single words</td>
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
          <li><strong>Familiarity</strong> - How familiar are you with affirmations? (cosmetic only)</li>
          <li><strong>Goal (Step 4)</strong> - Static question with predefined single-word topic chips</li>
          <li><strong>Context (Step 5)</strong> - LLM-adapted question with fragment chips, OR silently skipped</li>
          <li><strong>Tone (Step 6)</strong> - LLM-adapted question with single-word tone chips</li>
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
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-10</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-10</th>
                <th className="pb-2">FO-11</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Questions</td>
                <td className="py-1 pr-4">All 4 hardcoded</td>
                <td className="py-1 font-semibold">Step 4 hardcoded; steps 5-6 LLM-adapted</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Discovery flow</td>
                <td className="py-1 pr-4">Fixed 4 steps (4-7)</td>
                <td className="py-1 font-semibold">2-3 steps (4-6), step 5 skippable</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Discovery agent</td>
                <td className="py-1 pr-4">Chip-only agent</td>
                <td className="py-1 font-semibold">Discovery agent (question + chips + skip signal)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Step 5 chips</td>
                <td className="py-1 pr-4">LLM fragments</td>
                <td className="py-1 font-semibold">LLM fragments (with adapted question)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Tone chips (step 6/7)</td>
                <td className="py-1 pr-4">Full sentences</td>
                <td className="py-1 font-semibold">Single words (Gentle, Bold, Calm...)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Open-ended step</td>
                <td className="py-1 pr-4">Step 7 (support tone)</td>
                <td className="py-1 font-semibold">Removed</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Familiarity</td>
                <td className="py-1 pr-4">Passed to chip agent</td>
                <td className="py-1 font-semibold">Cosmetic only</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Total flow steps</td>
                <td className="py-1 pr-4">15 (0-14)</td>
                <td className="py-1 font-semibold">14 (0-13)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Skip Logic */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Skip Logic</h3>
        <p className="text-blue-700 dark:text-blue-400 mb-3">
          The discovery agent evaluates whether step 5 (context) should be skipped based on the
          richness of the user&apos;s goal answer in step 4.
        </p>
        <div className="space-y-3 text-blue-700 dark:text-blue-400">
          <div>
            <p className="font-semibold">Brief goal (no skip):</p>
            <p className="text-sm ml-4">&quot;Motivation&quot; → Step 5 appears with adapted question</p>
          </div>
          <div>
            <p className="font-semibold">Rich goal (skip):</p>
            <p className="text-sm ml-4">&quot;I need motivation because I have a big exam tomorrow and I&apos;m terrified&quot; → Step 5 skipped, goes directly to step 6</p>
          </div>
        </div>
        <p className="text-blue-700 dark:text-blue-400 mt-3 text-sm">
          The skip is silent — the user sees the heart animation transition, then step 6 loads. No
          indication that a step was skipped.
        </p>
      </section>

      <TechnicalDetails>
        <p>Discovery Agent: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-11-discovery</code></p>
        <p>Affirmation Agent: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-11-affirmation</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-11.*</code></p>
        <p>Affirmation count: 5 per batch (unlimited batches)</p>
        <p>Discovery: 2-3 adaptive steps (steps 4-6, step 5 skippable)</p>
        <p>Question sequence: Goal (static) → Context (LLM, skippable) → Tone (LLM)</p>
        <p>Selection method: Card-based &quot;Love it&quot; / &quot;Discard&quot;</p>
        <p>Model: openai/gpt-4o</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
