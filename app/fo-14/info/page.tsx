import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO14InfoPage() {
  return (
    <InfoPageWrapper id="FO-14" name="Production Onboarding v2" tagline="Sub-batched Phase 2 with shown-count cards">
      <InfoSummaryBox>
        FO-14 evolves FO-13&apos;s production onboarding with two targeted changes: Phase 2 is split
        into 3 sub-batches (8+8+4) with thinking transitions between them, and the card counter
        now tracks affirmations shown rather than loved. Discovery, Phase 1, and all prompts are
        identical to FO-13.
        <BestFor>Best for testing sub-batched Phase 2 delivery and shown-count card UX.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-13 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-13</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-14 is a delta from FO-13, keeping everything identical except for two changes:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>Phase 2 sub-batches:</strong> 20 affirmations split into 3 card review screens (8+8+4) with Thinking H/I/J between them</li>
          <li><strong>Card counter &amp; headline:</strong> Counter shows &quot;X of 20&quot; (affirmations shown) instead of loved count, with headline &quot;Does this affirmation resonate with you?&quot;</li>
        </ul>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Break Phase 2 into digestible chunks with progress clarity.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Instead of reviewing all 20 Phase 2 affirmations in a single long session, they arrive
          in 3 sub-batches (8, 8, then 4) with thinking transitions that give the user natural
          pauses. The &quot;X of 20&quot; counter shows progress through all affirmations shown, not just
          the ones loved, giving a clearer sense of how far along the user is.
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
          <li><strong>Phase 1</strong> - 4 batches of 5 affirmations with feedback between each (same as FO-13)</li>
          <li><strong>Create List</strong> - Continue to Phase 2 or &quot;Add more later&quot; to skip</li>
          <li><strong>Phase 2</strong> - 3 sub-batches: 8 + 8 + 4 cards with Thinking H/I/J between them</li>
          <li><strong>Theme &rarr; Notifications &rarr; Premium &rarr; Feed</strong></li>
        </ol>
      </InfoSection>

      {/* Key Differences */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-13</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-13</th>
                <th className="pb-2">FO-14</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Phase 2 structure</td>
                <td className="py-1 pr-4">1 batch of 20 cards</td>
                <td className="py-1 font-semibold">3 sub-batches: 8 + 8 + 4 cards</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Phase 2 thinking screens</td>
                <td className="py-1 pr-4">1 (Thinking H only)</td>
                <td className="py-1 font-semibold">3 (Thinking H, I, J between sub-batches)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Card counter</td>
                <td className="py-1 pr-4">Loved count</td>
                <td className="py-1 font-semibold">&quot;X of 20&quot; — affirmations shown</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Card headline</td>
                <td className="py-1 pr-4">None</td>
                <td className="py-1 font-semibold">&quot;Does this affirmation resonate with you?&quot;</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Total thinking screens</td>
                <td className="py-1 pr-4">8 (A through H)</td>
                <td className="py-1 font-semibold">10 (A through J)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">State machine steps</td>
                <td className="py-1 pr-4">0–19</td>
                <td className="py-1 font-semibold">0–23</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <TechnicalDetails>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-14.*</code></p>
        <p>Phase 1 batch size: 5 (4 batches = 20 total, same as FO-13)</p>
        <p>Phase 2: 20 affirmations generated in 1 LLM call, sliced into sub-batches [8, 8, 4] at render time</p>
        <p>Discovery: 2 adaptive steps (steps 4-5, step 4 skippable, same as FO-13)</p>
        <p>Question sequence: Goal (static) &rarr; Context (LLM, skippable) &rarr; Tone (LLM)</p>
        <p>Selection method: Card-based &quot;Love it&quot; / &quot;Discard&quot; with per-batch feedback</p>
        <p>Prompts: Byte-for-byte identical to FO-13 (Prompt Integrity Constraint)</p>
        <p>Model: openai/gpt-4o</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
