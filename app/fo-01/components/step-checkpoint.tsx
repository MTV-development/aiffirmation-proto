'use client';

export interface StepCheckpointProps {
  name: string;
  batchNumber: number;  // 1, 2, or 3
  approvedCount: number;
  onContinue: () => void;  // Go to next batch
  onFinish: () => void;    // Skip to Step 7
}

/**
 * Checkpoint component shown after each swipe batch.
 *
 * Step 6 - After Batch 1: Encourages more swiping with option to finish
 * Step 6.2 - After Batch 2: Similar encouragement with option to finish
 * After Batch 3: Final message, only Continue option (no more batches)
 */
export function StepCheckpoint({
  name,
  batchNumber,
  approvedCount,
  onContinue,
  onFinish,
}: StepCheckpointProps) {
  // Different content based on batch number
  if (batchNumber === 1) {
    // After Batch 1 (Step 6)
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          Perfect, {name} ✨
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The ones you liked are now on your personal affirmation list. Want to add a few more?
          Each swipe helps us show even better affirmations for you.
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
            I&apos;m good with the affirmations I chose
          </button>
        </div>
      </div>
    );
  }

  if (batchNumber === 2) {
    // After Batch 2 (Step 6.2)
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
          Great job, {name} ✨
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your list is getting stronger and more personal. Would you like to add a few more affirmations?
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

  // After Batch 3 - final checkpoint, no more batches
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
        Perfect, {name} ✨
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You now have a strong list of personal affirmations. Next, let&apos;s make them feel
        even more you with a beautiful background.
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
