import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function AltProcess1InfoPage() {
  return (
    <InfoPageWrapper id="AP-01" name="Contextual Mirror" tagline="Zero-structure input - just vent and the AI figures it out">
      <InfoSummaryBox>
        A minimal-friction experience that shifts the cognitive burden from you to the AI.
        Just type freely about what&apos;s on your mind - vent, worry, hope - and the AI extracts
        context, shows you what it understood as tags, then generates personalized affirmations.
        <BestFor>Best for emotional processing when you don&apos;t know what you need yet.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Core Concept</h3>
        <p className="text-blue-700 dark:text-blue-400 italic text-lg">&quot;One unstructured input → AI structures it for you&quot;</p>
        <p className="mt-2 text-blue-700 dark:text-blue-400">
          You don&apos;t need to know what you&apos;re feeling yet. The AI figures it out.
        </p>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>The Open Invitation</strong> - Type freely about what&apos;s on your mind</li>
          <li><strong>Visual Understanding</strong> - Watch tags appear as the AI &quot;parses&quot; your text</li>
          <li><strong>Personalized Cards</strong> - Review affirmations, heart what resonates</li>
          <li><strong>Shuffle for More</strong> - Request new cards (AI learns from your saves/skips)</li>
        </ol>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Zero form fatigue</strong> - No multi-step wizards or category selection</li>
          <li><strong>Visual trust</strong> - Tags show the AI understood your input</li>
          <li><strong>Permission to be messy</strong> - &quot;Just start talking&quot; grants freedom to vent</li>
          <li><strong>Feedback learning</strong> - Learns from your saves and skips over time</li>
        </ul>
      </InfoSection>

      {/* Feedback Loop */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Feedback Loop</h3>
        <p className="text-emerald-700 dark:text-emerald-400">
          When you shuffle for new cards, the AI learns from your saves and skips. Each batch
          becomes more personalized based on your preferences.
        </p>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">ap-01</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.ap-01.*</code></p>
        <p>Output: 6-8 affirmations + 3-6 extracted tags (JSON object)</p>
        <p>Capabilities: Tag extraction AND affirmation generation</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
