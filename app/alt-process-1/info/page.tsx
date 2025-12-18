export default function AltProcess1InfoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AP-01: The Contextual Mirror</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Alternative Process 1 implements <strong>Concept A</strong> from the UX strategy exploration:
          a minimal-friction experience that shifts cognitive burden from the user to the AI.
        </p>
      </section>

      <section className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">
          Core Concept
        </h2>
        <p className="text-blue-700 dark:text-blue-400 italic">
          &quot;One unstructured input → AI Structure&quot;
        </p>
        <p className="mt-2 text-blue-700 dark:text-blue-400">
          Users don&apos;t need to know what they&apos;re feeling yet. The AI figures it out.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Why This Works</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            <strong>Zero Form Fatigue</strong> - No multi-step wizards or category selection
          </li>
          <li>
            <strong>Visual Trust</strong> - AI visually &quot;parses&quot; your text into tags, proving it understands
          </li>
          <li>
            <strong>Permission to be Messy</strong> - &quot;Just start talking&quot; grants freedom to vent
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Flow</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            <strong>The Open Invitation</strong> - Type freely about what&apos;s on your mind
          </li>
          <li>
            <strong>Visualization of Intelligence</strong> - Watch tags appear as AI &quot;thinks&quot;
          </li>
          <li>
            <strong>Personalization & Agency</strong> - Review cards, heart what resonates, shuffle for more
          </li>
        </ol>
      </section>

      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-emerald-800 dark:text-emerald-300">
          Feedback Loop
        </h2>
        <p className="text-emerald-700 dark:text-emerald-400">
          When you shuffle for new cards, the AI learns from your saves and skips. Each batch
          becomes more personalized based on your preferences.
        </p>
      </section>
    </div>
  );
}
