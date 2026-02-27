'use client';

interface StepReadyProps {
  name: string;
  onContinue: () => void;
}

/**
 * Screen 7 for FO-13: transition screen before card review begins.
 *
 * Headline uses the user's first name. Single "Continue" button.
 */
export function StepReady({ name, onContinue }: StepReadyProps) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
        Your personal affirmations are beginning to form, {name}!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        You&apos;ll now explore a set of affirmations. Select what feels true to
        shape what supports you right now.
      </p>
      <button
        onClick={onContinue}
        className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
