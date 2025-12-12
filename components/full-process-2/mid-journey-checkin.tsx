'use client';

interface MidJourneyCheckInProps {
  /** Number of affirmations liked so far */
  likedCount: number;
  /** Recent liked affirmations for preview */
  likedAffirmations: string[];
  /** Callback when user wants to continue */
  onContinue: () => void;
  /** Callback when user is done */
  onFinish: () => void;
  /** Callback when user wants to adjust preferences */
  onAdjust?: () => void;
}

/**
 * Mid-journey check-in screen shown at milestone intervals
 * Displays progress and offers options to continue, finish, or adjust
 */
export function MidJourneyCheckIn({
  likedCount,
  likedAffirmations,
  onContinue,
  onFinish,
  onAdjust,
}: MidJourneyCheckInProps) {
  // Show last 5 affirmations as preview
  const previewAffirmations = likedAffirmations.slice(-5);
  const hiddenCount = likedAffirmations.length - previewAffirmations.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Celebration header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">
          You&apos;ve collected {likedCount} affirmation{likedCount === 1 ? '' : 's'}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Would you like to keep going or are you happy with your collection?
        </p>
      </div>

      {/* Collection preview */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          Recent additions:
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {previewAffirmations.map((affirmation, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300"
            >
              &ldquo;{affirmation}&rdquo;
            </div>
          ))}
        </div>
        {hiddenCount > 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            ...and {hiddenCount} more in your collection
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onContinue}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Yes, Keep Going
        </button>

        <button
          onClick={onFinish}
          className="w-full px-6 py-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          I&apos;m Happy with My Collection
        </button>

        {onAdjust && (
          <button
            onClick={onAdjust}
            className="w-full px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm underline transition-colors"
          >
            Let&apos;s Adjust My Preferences
          </button>
        )}
      </div>
    </div>
  );
}
