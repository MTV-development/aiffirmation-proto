'use client';

export interface GenerationLoadingProps {
  name: string;
  batchNumber: 1 | 2 | 3;
  error?: string | null;
  onRetry?: () => void;
}

const LOADING_COPY = {
  1: {
    headline: "Creating your first affirmations, {name}...",
    subtext: "Based on what you shared with us",
  },
  2: {
    headline: "Creating more affirmations just for you, {name}...",
    subtext: "We're learning from what resonated with you",
  },
  3: {
    headline: "One more round of affirmations, {name}...",
    subtext: "These should feel even more personal",
  },
};

/**
 * Loading component shown between batch generations.
 *
 * Shows personalized copy based on which batch is being generated.
 * Auto-advances when generation completes (controlled by parent).
 *
 * Also handles error state with retry option.
 */
export function GenerationLoading({ name, batchNumber, error, onRetry }: GenerationLoadingProps) {
  const copy = LOADING_COPY[batchNumber];
  const headline = copy.headline.replace('{name}', name);

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-medium mb-2 text-gray-800 dark:text-gray-200">
          We couldn&apos;t create your affirmations
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Loading state
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h2 className="text-2xl font-medium mb-4 text-gray-800 dark:text-gray-200">
        {headline}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {copy.subtext}
      </p>
      <div className="flex justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
