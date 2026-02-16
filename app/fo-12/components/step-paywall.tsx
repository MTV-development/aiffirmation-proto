'use client';

export interface StepPaywallProps {
  onContinue: () => void;
}

/**
 * Light Paywall (UI mockup)
 *
 * Presents premium upgrade option. Both CTAs proceed to next step.
 */
export function StepPaywall({ onContinue }: StepPaywallProps) {
  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200 text-center">
        More support, whenever you want
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
        Get 3 days free of premium. With Premium, you can create hundreds of lists and expand your
        personal list with 100s of affirmations.
      </p>

      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="w-full px-8 py-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Try free for 3 days
        </button>
        <button
          onClick={onContinue}
          className="w-full px-8 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
