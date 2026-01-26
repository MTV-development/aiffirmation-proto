'use client';

export type CheckpointVariant = 'batch1' | 'subsequent' | 'transition';

export interface StepCheckpointProps {
  name: string;
  variant: CheckpointVariant;
  onContinue: () => void; // Go to next batch or proceed to post-swipe
  onFinish?: () => void; // Skip to post-swipe (not used for transition variant)
}

/**
 * Checkpoint component shown after each swipe batch in FO-06.
 *
 * Variants:
 * - batch1: After first 10 affirmations (Step 8)
 * - subsequent: After batches 2+ (Step 9)
 * - transition: Final transition before post-swipe (background selection)
 */
export function StepCheckpoint({
  name,
  variant,
  onContinue,
  onFinish,
}: StepCheckpointProps) {
  // Step 8 - After first 10 affirmations
  if (variant === 'batch1') {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          Perfect, {name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The ones you liked are now on your personal affirmation list. Let us add more, so you
          have a full personal list that fits you.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={onFinish}
            className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            I am good with the affirmations I chose
          </button>
        </div>
      </div>
    );
  }

  // Step 9 - After subsequent batches (batch 2+)
  if (variant === 'subsequent') {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          Great job, {name}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your list is getting stronger and more personal. Would you like to add a few more
          affirmations?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Yes, please
          </button>
          <button
            onClick={onFinish}
            className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            No, continue
          </button>
        </div>
      </div>
    );
  }

  // Transition to post-swipe (before background selection)
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
        Perfect, {name}!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You now have a strong list of personal affirmations. Next, let us make them feel even
        more you with a beautiful background.
      </p>
      <button
        onClick={onContinue}
        className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
