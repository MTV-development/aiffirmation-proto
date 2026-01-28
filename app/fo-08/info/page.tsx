import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FO08InfoPage() {
  return (
    <InfoPageWrapper id="FO-08" name="Hybrid Fragments" tagline="Suggest the direction, invite the completion">
      <InfoSummaryBox>
        Combines FO-06 fragment mechanics with FO-07 discovery framework. Hybrid fragments
        suggest content direction while inviting personal completion. Unlike chips (which propose
        complete answers) or pure fragments (which offer only structure), hybrid fragments
        hint at common experiences while leaving space for authentic self-expression.
        <BestFor>Best for users who want guidance without losing their authentic voice.</BestFor>
      </InfoSummaryBox>

      {/* Based on FO-06 + FO-07 */}
      <section className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">Based on FO-06 + FO-07</h3>
        <p className="text-amber-700 dark:text-amber-400">
          FO-08 combines the best of both approaches:
        </p>
        <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-400 space-y-1">
          <li><strong>FO-06 (technical base):</strong> Fragment UI mechanics, text area input, click-to-append behavior</li>
          <li><strong>FO-07 (framework base):</strong> 5 Dimensions discovery, reflective statements, thumbs up/down review</li>
        </ul>
        <p className="mt-2 text-amber-700 dark:text-amber-400">
          The key innovation is <strong>hybrid fragments</strong> that suggest a direction while remaining open-ended.
        </p>
      </section>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Suggest the direction, invite the completion.&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Hybrid fragments give users three things: <strong>normalization</strong> (&quot;others experience this too&quot;),
          <strong> direction</strong> (&quot;maybe this resonates with you&quot;), and <strong>space for authenticity</strong>
          (&quot;but tell me YOUR specific version&quot;).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-purple-700 dark:text-purple-400">
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Example</th>
                <th className="pb-2">Problem</th>
              </tr>
            </thead>
            <tbody className="text-purple-700 dark:text-purple-400">
              <tr>
                <td className="py-1 pr-4">Chip (closed)</td>
                <td className="py-1 pr-4">&quot;self-doubt&quot;</td>
                <td className="py-1">Complete answer, no personal expression</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Pure fragment</td>
                <td className="py-1 pr-4">&quot;I keep worrying that...&quot;</td>
                <td className="py-1">No content hint, too open</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-semibold">Hybrid fragment</td>
                <td className="py-1 pr-4 font-semibold">&quot;I keep doubting whether I&apos;m...&quot;</td>
                <td className="py-1 font-semibold">Suggests self-doubt, user completes what they doubt</td>
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
          <li><strong>Dynamic Discovery</strong> - AI-generated questions with hybrid fragments (8 visible, 15 more via &quot;More&quot;)</li>
          <li><strong>Affirmation Review</strong> - Rate 10 affirmations with thumbs up/down</li>
          <li><strong>Background</strong> - Visual personalization (mockup)</li>
          <li><strong>Notifications</strong> - Reminder preferences (mockup)</li>
          <li><strong>Paywall</strong> - Premium offering (mockup)</li>
          <li><strong>Completion</strong> - View your curated affirmation list</li>
        </ol>
      </InfoSection>

      {/* Key Differences */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Key Differences from FO-06 and FO-07</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-emerald-700 dark:text-emerald-400">
                <th className="pb-2 pr-4">Aspect</th>
                <th className="pb-2 pr-4">FO-06</th>
                <th className="pb-2 pr-4">FO-07</th>
                <th className="pb-2">FO-08</th>
              </tr>
            </thead>
            <tbody className="text-emerald-700 dark:text-emerald-400">
              <tr>
                <td className="py-1 pr-4">Discovery input</td>
                <td className="py-1 pr-4">Pure fragments</td>
                <td className="py-1 pr-4">Reflective chips</td>
                <td className="py-1 font-semibold">Hybrid fragments</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Fragment count</td>
                <td className="py-1 pr-4">5 + 8 (13 total)</td>
                <td className="py-1 pr-4">N/A (chips)</td>
                <td className="py-1 font-semibold">8 + 15 (23 total)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Framework</td>
                <td className="py-1 pr-4">Custom discovery</td>
                <td className="py-1 pr-4">5 Dimensions</td>
                <td className="py-1 font-semibold">5 Dimensions</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Affirmation selection</td>
                <td className="py-1 pr-4">Swipe cards</td>
                <td className="py-1 pr-4">Thumbs up/down</td>
                <td className="py-1 font-semibold">Thumbs up/down</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Progress bar</td>
                <td className="py-1 pr-4">Yes</td>
                <td className="py-1 pr-4">No</td>
                <td className="py-1 font-semibold">No</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Fragment visibility</td>
                <td className="py-1 pr-4">Behind &quot;Inspiration&quot; link</td>
                <td className="py-1 pr-4">N/A</td>
                <td className="py-1 font-semibold">8 visible immediately</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">Transitions</td>
                <td className="py-1 pr-4">Confetti</td>
                <td className="py-1 pr-4">Heart animation</td>
                <td className="py-1 font-semibold">Heart animation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <InfoSection title="Hybrid Fragment Examples">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Each hybrid fragment suggests ONE direction while remaining incomplete:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>&quot;I&apos;ve been feeling drained from...&quot; (suggests overwhelm)</li>
          <li>&quot;I keep doubting whether I&apos;m...&quot; (suggests self-doubt)</li>
          <li>&quot;I wish I could feel more confident about...&quot; (suggests confidence desire)</li>
          <li>&quot;Part of me believes I don&apos;t deserve...&quot; (suggests worthiness struggle)</li>
          <li>&quot;What I really need is to feel...&quot; (invites needs exploration)</li>
        </ul>
      </InfoSection>

      {/* Fragment Interaction */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Fragment Interaction</h3>
        <div className="space-y-2 text-blue-700 dark:text-blue-400">
          <p><strong>How fragments work:</strong></p>
          <ol className="list-decimal list-inside ml-4 mb-3">
            <li><strong>8 fragments visible</strong> - Shown immediately on each dynamic screen</li>
            <li><strong>&quot;More&quot; button</strong> - Reveals 15 additional fragments</li>
            <li><strong>Click to append</strong> - Removes &quot;...&quot;, appends to text area, focuses cursor</li>
            <li><strong>Complete the thought</strong> - User adds their specific situation</li>
          </ol>
          <p><strong>Example:</strong> Click &quot;I keep doubting whether I&apos;m...&quot; and it becomes &quot;I keep doubting whether I&apos;m &quot; in the text area, ready for completion.</p>
        </div>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fo-08-discovery</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fo-08.*</code></p>
        <p>Fragment count: 8 initial + 15 expanded (23 total)</p>
        <p>Affirmation count: 10 (single batch)</p>
        <p>Selection method: Thumbs up/down buttons</p>
        <p>Model: openai/gpt-4o-mini</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
