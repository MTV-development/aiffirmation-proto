import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function FullProcess3InfoPage() {
  return (
    <InfoPageWrapper id="FP-03" name="Full Process 3" tagline="Chat-first onboarding with conversational flow">
      <InfoSummaryBox>
        Same powerful feedback-learning as FP-02, but with a completely different UX: a
        chat-centric, conversational experience instead of a step-by-step wizard. Quick replies
        and tap-to-answer make onboarding feel natural and friendly.
        <BestFor>Best for users who prefer conversational interfaces over forms.</BestFor>
      </InfoSummaryBox>

      {/* What's Different */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-emerald-800 dark:text-emerald-300">What&apos;s Different vs FP-02</h3>
        <ul className="list-disc list-inside space-y-2 text-emerald-700 dark:text-emerald-400">
          <li><strong>Chat-first</strong> - Guided conversation instead of a step wizard</li>
          <li><strong>Quick replies</strong> - Easy tap-to-answer choices</li>
          <li><strong>Inspiration baked in</strong> - Sample lines you can &quot;steer&quot; toward</li>
          <li><strong>Onboarding pacing</strong> - Short, friendly, and skippable</li>
          <li><strong>Same core logic</strong> - Still learns from your swipes like FP-02</li>
        </ul>
      </section>

      <InfoSection title="How It Works">
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Pick a focus</strong> - Tap a suggestion or type your own</li>
          <li><strong>Add friction</strong> - What gets in the way? (optional)</li>
          <li><strong>Choose voice</strong> - Select tone and style inspiration</li>
          <li><strong>Generate &amp; Save</strong> - Swipe through and save what resonates</li>
        </ol>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li>More natural, conversational feel than form-based wizards</li>
          <li>Quick-reply buttons reduce typing effort</li>
          <li>Flexible pacing - answer as much or as little as you want</li>
          <li>Still includes feedback learning from FP-02</li>
        </ul>
      </InfoSection>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">fp-03</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.fp-03.*</code></p>
        <p>Output: 8 affirmations per batch (JSON array)</p>
        <p>Feedback learning: Same as FP-02 (learns from both likes and skips)</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
