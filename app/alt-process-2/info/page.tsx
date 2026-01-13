import { InfoPageWrapper, InfoSummaryBox, BestFor, InfoSection, TechnicalDetails } from '@/components/info-page-wrapper';

export default function AltProcess2InfoPage() {
  return (
    <InfoPageWrapper id="AP-02" name="Reactive Stream" tagline="Zero input needed - just swipe and the AI learns">
      <InfoSummaryBox>
        A TikTok/Tinder-style discovery experience. No onboarding, no questions - affirmations
        appear immediately and you swipe. The AI learns your preferences purely from swipe
        behavior and adapts in real-time.
        <BestFor>Best for exploration and discovery when you just want to browse.</BestFor>
      </InfoSummaryBox>

      {/* Core Concept */}
      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300">Core Concept</h3>
        <p className="text-purple-700 dark:text-purple-400 italic text-lg">&quot;Zero input → Behavioral tuning&quot;</p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          Content arrives instantly. No onboarding, no setup. The algorithm trains itself from your swipes.
        </p>
      </section>

      <InfoSection title="Two-Phase Learning">
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Phase 1: Exploration (0-10 swipes)</h4>
            <p className="text-sm mt-1">
              Initial affirmations deliberately explore different subjects, tones, lengths, and structures
              to gather meaningful signal about what you prefer.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Phase 2: Personalization (10+ swipes)</h4>
            <p className="text-sm mt-1">
              Once enough signal is collected, batches become strongly personalized based on
              what you saved (swipe right) and skipped (swipe left).
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="What Makes This Version Unique">
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
          <li><strong>Instant value</strong> - Content in the first 0.1 seconds</li>
          <li><strong>Lower cognitive load</strong> - Swiping is easier than typing or selecting</li>
          <li><strong>Behavioral learning</strong> - Algorithm trains itself without surveys</li>
          <li><strong>Endless stream</strong> - Always more to discover</li>
        </ul>
      </InfoSection>

      <InfoSection title="Controls">
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p><strong>Touch:</strong> Swipe left to skip, swipe right to save</p>
          <p><strong>Keyboard:</strong> Arrow Left (←) to skip, Arrow Right (→) to save</p>
        </div>
      </InfoSection>

      {/* Tune Feature */}
      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">Tune Feature</h3>
        <p className="text-emerald-700 dark:text-emerald-400 mb-2">
          If the stream doesn&apos;t feel right, use the &quot;Tune&quot; button to adjust:
        </p>
        <ul className="text-emerald-700 dark:text-emerald-400 list-disc list-inside space-y-1">
          <li><strong>Gentler &amp; Calmer</strong> - Soft, nurturing affirmations</li>
          <li><strong>Stronger &amp; Direct</strong> - Assertive, action-oriented affirmations</li>
          <li><strong>Change Topic</strong> - Fresh variety across new themes</li>
        </ul>
      </section>

      <TechnicalDetails>
        <p>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">ap-02</code></p>
        <p>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">versions.ap-02.*</code></p>
        <p>Output: 10-12 affirmations per batch (JSON object)</p>
        <p>Confidence scaling: 70% personalized at 10-20 swipes, 85% at 20+ swipes</p>
      </TechnicalDetails>
    </InfoPageWrapper>
  );
}
