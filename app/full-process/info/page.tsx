export default function FullProcessInfoPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Full Process Affirmation Generator</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Overview</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The Full Process Generator guides you through a personalized affirmation creation experience.
          It uses a 4-step discovery wizard to understand your needs, then generates tailored affirmations
          that you can review, refine, and export.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>Discovery Wizard</strong> - Tell us about your focus, timing, challenges, and preferred tone</li>
          <li><strong>Review Loop</strong> - Review affirmations one by one, keeping the ones that resonate</li>
          <li><strong>Check-Ins</strong> - At milestones, confirm your direction or adjust preferences</li>
          <li><strong>Export</strong> - Copy or download your curated collection</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Discovery Steps</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-1">Step 1: Primary Focus</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose an area of life to focus on: Career Growth, Relationships, Health & Wellness,
              Confidence, Creativity, or Self-Worth. Or enter your own custom focus.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-1">Step 2: Timing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              When will you use these affirmations? Morning (energizing), Evening (calming),
              or All-Day (balanced). Select multiple options if needed.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-1">Step 3: Challenges</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select challenges you want to address: Anxiety, Self-Doubt, Imposter Syndrome,
              Procrastination, Perfectionism, or Burnout. This step is optional.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-1">Step 4: Tone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose the voice of your affirmations: Gentle & Compassionate, Powerful & Commanding,
              Practical & Grounded, or Spiritual & Reflective.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Tips for Best Results</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>Be specific about your focus area for more personalized results</li>
          <li>Select challenges that truly resonate with your current situation</li>
          <li>Choose a tone that feels comfortable and believable to you</li>
          <li>Like affirmations that feel authentic, skip ones that don&apos;t</li>
          <li>Use the check-in to adjust if the affirmations aren&apos;t quite right</li>
        </ul>
      </section>
    </div>
  );
}
