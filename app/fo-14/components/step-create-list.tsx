'use client';

interface StepCreateListProps {
  name: string;
  lovedCount: number;
  onContinue: () => void;
  onSkip: () => void;
}

/**
 * Screen 9 for FO-14: Create-List interstitial after Phase 1.
 *
 * Congratulates user on Phase 1 completion, offers Continue to Phase 2
 * or "Add more later" link to skip directly to Theme.
 */
export function StepCreateList({ name, lovedCount, onContinue, onSkip }: StepCreateListProps) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
        You&apos;ve already built something personal, {name}.
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        Your personal feed is now updated with the {lovedCount} affirmation{lovedCount !== 1 ? 's' : ''} you
        love. Add more to create a richer and more varied daily feed.
      </p>

      <div className="space-y-4">
        <button
          onClick={onContinue}
          className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Continue
        </button>
        <button
          onClick={onSkip}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm underline transition-colors"
          data-testid="add-more-later"
        >
          Add more later
        </button>
      </div>
    </div>
  );
}
