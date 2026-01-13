import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FullProcess2InfoPage() {
  return (
    <InfoPageWrapper id="FP-02" name="Full Process 2" tagline="Feedback-aware generation that learns from your swipes">
      <InfoSummaryBox>
        Same 3-step wizard as FP-01, but with an important addition: the AI learns from your
        swipe behavior. It notices what you like and what you skip, then adapts subsequent
        batches to better match your preferences.
        <BestFor>Best for users who want affirmations that improve over time.</BestFor>
      </InfoSummaryBox>

      {/* What's New */}
      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">What&apos;s New vs FP-01</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-400">
          <li><strong>Learns from Likes</strong> - Notices patterns in what you save and generates more like them</li>
          <li><strong>Learns from Skips</strong> - Identifies what you reject and avoids similar patterns</li>
          <li><strong>Adaptive Generation</strong> - Each batch gets better at matching your preferences</li>
          <li><strong>Same Great UX</strong> - The interface works exactly like FP-01</li>
        </ul>
      </section>

      <InfoSection title="How Feedback Learning Works">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-1 text-green-800 dark:text-green-300">From Liked Affirmations</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              The agent notices patterns in what you save: preferred length, tone, structure,
              and themes. It generates MORE affirmations with these characteristics.
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-medium mb-1 text-orange-800 dark:text-orange-300">From Skipped Affirmations</h4>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              The agent identifies patterns in what you skip. If you consistently skip
              assertive statements, it will generate gentler alternatives. Skip long
              affirmations, and it keeps them shorter.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Discovery Wizard</strong> - Same 3-step process as FP-01</li>
          <li><strong>First Batch</strong> - Initial affirmations based on your preferences</li>
          <li><strong>Swipe &amp; Teach</strong> - Like to save, skip to teach the agent what to avoid</li>
          <li><strong>Check-In</strong> - Request more affirmations (now with feedback learning!)</li>
          <li><strong>Improved Batches</strong> - Each subsequent batch adapts to your patterns</li>
        </ol>
      </InfoSection>

      <InfoSection title="Tips">
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>Swipe confidently - both likes and skips help the agent learn</li>
          <li>Go through 2-3 batches to see feedback learning in action</li>
          <li>Use the adjustment panel if swipe-learning alone isn&apos;t enough</li>
          <li>The more you interact, the better the agent understands you</li>
        </ul>
      </InfoSection>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fp-02</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fp-02.*</code></p>
        <p>Feedback limit: 20 most recent skipped affirmations</p>
        <p>Output: 8 affirmations per batch (JSON array)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
