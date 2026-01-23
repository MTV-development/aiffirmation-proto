'use client';

export interface StepCompletionProps {
  name: string;
  approvedAffirmations: string[];
}

/**
 * Step 13: Completion screen
 *
 * Final screen showing the user's complete list of approved affirmations.
 * Displays all affirmations directly (no button click needed).
 * Shows encouraging message if no affirmations were approved.
 */
export function StepCompletion({ name, approvedAffirmations }: StepCompletionProps) {
  const hasAffirmations = approvedAffirmations.length > 0;

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        You are all set, {name} — this is your list!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Open your affirmations now — say them out loud or read them to yourself silently.
        You deserve kind words.
      </p>

      {hasAffirmations ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 max-h-80 overflow-y-auto">
            <ul className="space-y-3">
              {approvedAffirmations.map((affirmation, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                >
                  <span className="text-purple-500 text-lg mt-0.5">✦</span>
                  <span className="text-gray-800 dark:text-gray-200">{affirmation}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {approvedAffirmations.length} affirmation{approvedAffirmations.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6 text-center">
          <p className="text-amber-800 dark:text-amber-200 mb-2 font-medium">
            No affirmations saved yet
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            That&apos;s okay! You can always come back and create new affirmations
            that resonate with you. Every journey starts somewhere.
          </p>
        </div>
      )}
    </div>
  );
}
