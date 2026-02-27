'use client';

interface StepFeedProps {
  name: string;
  lovedCount: number;
}

/**
 * Screen 14 for FO-13: Feed screen (final screen).
 *
 * Adapted from FO-12's StepCompletion:
 * - "Welcome to your personal affirmation feed" (not "Welcome to SELF")
 * - No confetti
 * - Shows count of loved affirmations
 */
export function StepFeed({ name, lovedCount }: StepFeedProps) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
        Welcome to your personal affirmation feed, {name}!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        You have {lovedCount} affirmation{lovedCount !== 1 ? 's' : ''} ready for you.
        Open your affirmations now — say them out loud or read them to yourself silently.
        You deserve kind words.
      </p>
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
        <p className="text-purple-800 dark:text-purple-200 font-medium">
          Your personal feed is ready
        </p>
        <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">
          {lovedCount} affirmation{lovedCount !== 1 ? 's' : ''} saved
        </p>
      </div>
    </div>
  );
}
