'use client';

interface StepSwipeIntroProps {
  name: string;
  isLoading: boolean;
  onStart: () => void;
}

/**
 * Swipe intro step (4) for FO-02 onboarding
 *
 * Explains swipe mechanics before the card swiping experience.
 * Shows loading indicator if affirmations are still being generated.
 */
export function StepSwipeIntro({ name, isLoading, onStart }: StepSwipeIntroProps) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-gray-200">
        Thank you, {name} — let&apos;s shape this together 💛
      </h2>

      <div className="text-left text-gray-600 dark:text-gray-400 space-y-4 mb-8">
        <p>Next, we&apos;ll show affirmations based on what you shared.</p>
        <p>You&apos;ll see them one by one.</p>
        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">Swipe DOWN</span> (toward you) to{' '}
          <span className="font-medium text-gray-800 dark:text-gray-200">KEEP</span> it.
        </p>
        <p>
          <span className="font-medium text-gray-800 dark:text-gray-200">Swipe UP</span> (away) if it doesn&apos;t feel right.
        </p>
        <p>Your swipes help us tailor the next ones to you.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Creating your personalized affirmations...
          </p>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Start
        </button>
      )}
    </div>
  );
}
