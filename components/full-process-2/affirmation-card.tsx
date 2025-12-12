'use client';

interface AffirmationCardProps {
  /** The affirmation text to display */
  affirmation: string;
  /** Current index (1-indexed for display) */
  current: number;
  /** Total number of affirmations in batch */
  total: number;
  /** Number of affirmations liked so far */
  likedCount: number;
  /** Callback when user likes the affirmation */
  onLike: () => void;
  /** Callback when user skips the affirmation */
  onSkip: () => void;
  /** Whether buttons should be disabled (during transitions) */
  disabled?: boolean;
}

/**
 * Displays a single affirmation with like/skip actions
 */
export function AffirmationCard({
  affirmation,
  current,
  total,
  likedCount,
  onLike,
  onSkip,
  disabled = false,
}: AffirmationCardProps) {
  return (
    <div className="max-w-xl mx-auto">
      {/* Header with progress */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {current} of {total}
        </span>
        <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
          {likedCount} liked
        </span>
      </div>

      {/* Affirmation display */}
      <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl mb-8 shadow-sm">
        <p className="text-xl md:text-2xl text-center leading-relaxed font-medium text-gray-800 dark:text-gray-100">
          &ldquo;{affirmation}&rdquo;
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6">
        <button
          onClick={onSkip}
          disabled={disabled}
          className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Skip this affirmation"
        >
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <button
          onClick={onLike}
          disabled={disabled}
          className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-200 dark:shadow-pink-900/30"
          aria-label="Love this affirmation"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
