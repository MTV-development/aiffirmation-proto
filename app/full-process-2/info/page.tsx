export default function FullProcess2InfoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Full Process 2 - Feedback-Aware Generator</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Full Process 2 is an enhanced affirmation generator that <strong>learns from what you skip</strong>.
          As you skip affirmations that don&apos;t resonate, the system learns to avoid similar patterns
          in subsequent batches.
        </p>
      </section>

      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">What&apos;s New in FP-02</h2>
        <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-400">
          <li><strong>Negative Feedback Learning</strong> - The agent learns from affirmations you skip</li>
          <li><strong>Pattern Avoidance</strong> - It learns what style, length, and tone to avoid</li>
          <li><strong>Adaptive Generation</strong> - Each batch avoids patterns you&apos;ve rejected</li>
          <li><strong>Same Great UX</strong> - The interface works exactly like Full Process 1</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">How Feedback Learning Works</h2>
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h3 className="font-medium mb-1 text-orange-800 dark:text-orange-300">Skipped Affirmations</h3>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              Affirmations you skip are sent to the agent as negative examples. The agent learns
              what to avoid: If you consistently skip assertive statements, it will generate
              gentler alternatives in the next batch.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium mb-1 text-purple-800 dark:text-purple-300">Learning by Exclusion</h3>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              By showing the agent what you don&apos;t like, it narrows down to your preferences
              over time. Skip enough similar styles and the agent will stop generating them.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Discovery Wizard</strong> - Tell us about your focus, timing, challenges, and preferred tone</li>
          <li><strong>First Batch</strong> - Initial affirmations based on your preferences (like FP-01)</li>
          <li><strong>Review & Like/Skip</strong> - Like to save, skip to teach the agent what to avoid</li>
          <li><strong>Check-In</strong> - Request more affirmations (now with feedback learning!)</li>
          <li><strong>Improved Batches</strong> - Each subsequent batch avoids patterns you&apos;ve skipped</li>
          <li><strong>Export</strong> - Copy or download your curated collection</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Tips for Best Results</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>Skip confidently — the agent learns from what you reject</li>
          <li>Go through 2-3 batches to see feedback learning in action</li>
          <li>Use the adjustment panel to refine tone if skipping alone isn&apos;t enough</li>
          <li>The more you skip, the better the agent understands what to avoid</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Technical Details</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm">
          <li>Agent ID: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">fp-02</code></li>
          <li>KV Namespace: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">versions.fp-02.*</code></li>
          <li>Feedback limit: 20 skipped affirmations (most recent)</li>
          <li>Model: Configurable via KV store (default: gpt-4o)</li>
          <li>Temperature: Configurable via KV store (default: 0.95)</li>
        </ul>
      </section>
    </div>
  );
}
