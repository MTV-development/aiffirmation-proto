export default function AltProcess2InfoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AP-02: The Reactive Stream</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Alternative Process 2 implements <strong>Concept B</strong> from the UX strategy exploration:
          a zero-input, swipe-based affirmation discovery experience inspired by TikTok, Tinder, and Spotify.
        </p>
      </section>

      <section className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-purple-800 dark:text-purple-300">
          Core Concept
        </h2>
        <p className="text-purple-700 dark:text-purple-400 italic">
          &quot;Zero Input → Behavioral Tuning&quot;
        </p>
        <p className="mt-2 text-purple-700 dark:text-purple-400">
          The user receives affirmations immediately upon launch. No onboarding, no questions - just content.
          The AI learns preferences through swipe behavior.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Why This Works</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            <strong>Instant Value</strong> - Value delivered in the first 0.1 seconds of app launch
          </li>
          <li>
            <strong>Lower Cognitive Load</strong> - Swiping is easier than typing or selecting
          </li>
          <li>
            <strong>Blue Ocean</strong> - Most affirmation apps force setup first
          </li>
          <li>
            <strong>Behavioral Learning</strong> - The algorithm trains itself without surveys
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Two-Phase Learning</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Phase 1: Exploration (0-10 swipes)</h3>
            <p className="text-sm mt-1">
              Initial affirmations deliberately explore different subjects, tones, lengths, and structures
              to gather meaningful signal about what you prefer.
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Phase 2: Personalization (10+ swipes)</h3>
            <p className="text-sm mt-1">
              Once enough signal is collected, subsequent batches are strongly personalized based on
              what you saved (swipe right) and what you skipped (swipe left).
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Controls</h2>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p><strong>Touch:</strong> Swipe left to pass, swipe right to save</p>
          <p><strong>Keyboard:</strong> Arrow Left (←) to pass, Arrow Right (→) to save</p>
        </div>
      </section>

      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-emerald-800 dark:text-emerald-300">
          Tune Feature
        </h2>
        <p className="text-emerald-700 dark:text-emerald-400">
          If the stream doesn&apos;t feel right, use the &quot;Tune&quot; button to adjust:
        </p>
        <ul className="mt-2 text-emerald-700 dark:text-emerald-400 list-disc list-inside">
          <li><strong>Gentler & Calmer</strong> - Soft, nurturing affirmations</li>
          <li><strong>Stronger & Direct</strong> - Assertive, action-oriented affirmations</li>
          <li><strong>Change Topic</strong> - Fresh variety across new themes</li>
        </ul>
      </section>
    </div>
  );
}
