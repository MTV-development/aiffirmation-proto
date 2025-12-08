export default function AF01InfoPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">About AF-01</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        AF-01 is an AI-powered affirmation generator that creates personalized,
        positive affirmations based on your selected themes and preferences.
      </p>
      <h3 className="text-lg font-semibold mb-2">How it works</h3>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
        <li>Select one or more themes that resonate with you</li>
        <li>Optionally add personal context or details</li>
        <li>Click &quot;Go&quot; to generate 10 unique affirmations</li>
        <li>Use these affirmations in your daily practice</li>
      </ul>
      <h3 className="text-lg font-semibold mt-6 mb-2">Available Themes</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Self-confidence, Anxiety relief, Gratitude, Motivation, Self-love,
        Relationships, Work ethic, Health &amp; wellness, Creativity, and Financial abundance.
      </p>
    </div>
  );
}
