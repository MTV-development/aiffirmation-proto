'use client';

import { AffirmationCard } from './affirmation-card';

interface ResultsScreenProps {
  affirmations: string[];
  savedAffirmations: string[];
  onToggleSave: (affirmation: string) => void;
  onShuffle: () => void;
  onFinish: () => void;
  isShuffling?: boolean;
}

export function ResultsScreen({
  affirmations,
  savedAffirmations,
  onToggleSave,
  onShuffle,
  onFinish,
  isShuffling,
}: ResultsScreenProps) {
  const savedSet = new Set(savedAffirmations);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Affirmations Just For You
        </h1>
        {savedAffirmations.length > 0 && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {savedAffirmations.length} saved
          </p>
        )}
      </div>

      {/* Affirmation Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pb-4">
        {affirmations.map((affirmation, index) => (
          <AffirmationCard
            key={`${affirmation}-${index}`}
            affirmation={affirmation}
            index={index}
            isSaved={savedSet.has(affirmation)}
            onToggleSave={() => onToggleSave(affirmation)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-3">
        <button
          onClick={onShuffle}
          disabled={isShuffling}
          className="w-full py-4 px-6 text-base font-medium text-white bg-[#5B7FE1] rounded-xl hover:bg-[#4A6ED0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isShuffling ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              Shuffle for New Cards
            </>
          )}
        </button>

        <button
          onClick={onFinish}
          disabled={isShuffling}
          className="w-full py-4 px-6 text-base font-medium text-[#5B7FE1] bg-white dark:bg-gray-900 border border-[#5B7FE1] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
