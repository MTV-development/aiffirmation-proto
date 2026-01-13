import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function AF01InfoPage() {
  return (
    <InfoPageWrapper id="AF-01" name="Basic Generator" tagline="Simple theme-based generation">
      <InfoSummaryBox>
        The simplest and fastest way to generate affirmations. Select one or more themes,
        optionally add personal context, and receive 10 tailored affirmations instantly.
        <BestFor>Best for quick generation when you know what themes you want.</BestFor>
      </InfoSummaryBox>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Select one or more themes that resonate with you</li>
          <li>Optionally add personal context or details</li>
          <li>Click &quot;Go&quot; to generate 10 personalized affirmations</li>
          <li>Copy or use in your daily practice</li>
        </ol>
      </InfoSection>

      <InfoSection title="Available Themes">
        <p className="text-gray-600 dark:text-gray-400">
          Self-confidence, Anxiety relief, Gratitude, Motivation, Self-love,
          Relationships, Work ethic, Health &amp; wellness, Creativity, and Financial abundance.
        </p>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>Fastest path to affirmations - no wizard or conversation needed</li>
          <li>Theme-based approach for targeted results</li>
          <li>Batch output of 10 affirmations at once</li>
          <li>Good starting point for exploring what resonates with you</li>
        </ul>
      </InfoSection>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">af-01</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.af-01.*</code></p>
        <p>Output: 10 affirmations (numbered list)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
