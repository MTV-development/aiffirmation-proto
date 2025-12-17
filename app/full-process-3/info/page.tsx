export default function FullProcess3InfoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Full Process 3 - Chat-First Onboarding</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Full Process 3 is a completely different take on the UX: a <strong>chat-centric</strong>,
          onboarding-friendly experience that helps you create <strong>personal, relevant, high-quality</strong>{' '}
          affirmations with minimal effort.
        </p>
      </section>

      <section className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-emerald-800 dark:text-emerald-300">
          What&apos;s Different vs FP-02
        </h2>
        <ul className="list-disc list-inside space-y-2 text-emerald-700 dark:text-emerald-400">
          <li>
            <strong>Chat-first</strong> guided conversation instead of a step wizard
          </li>
          <li>
            <strong>Quick replies</strong> and easy choices (tap-to-answer)
          </li>
          <li>
            <strong>Inspiration</strong> baked in (sample lines you can “steer” toward)
          </li>
          <li>
            <strong>Onboarding pacing</strong>: short, friendly, and skippable
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Flow</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            <strong>Pick a focus</strong> (tap a suggestion or type your own)
          </li>
          <li>
            <strong>Add friction</strong> (what gets in the way, optional)
          </li>
          <li>
            <strong>Choose voice</strong> (tone + style inspiration)
          </li>
          <li>
            <strong>Generate</strong> and save the affirmations you want
          </li>
        </ol>
      </section>
    </div>
  );
}



