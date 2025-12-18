'use client';

interface DoneScreenProps {
  savedAffirmations: string[];
  onStartOver: () => void;
  onCopy: () => void;
}

export function DoneScreen({ savedAffirmations, onStartOver, onCopy }: DoneScreenProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Saved Affirmations
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {savedAffirmations.length} affirmation{savedAffirmations.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Saved Affirmations List */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-4">
        {savedAffirmations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>You didn't save any affirmations yet.</p>
            <p className="mt-2 text-sm">Start over and tap the heart on ones you like.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {savedAffirmations.map((affirmation, index) => (
              <li
                key={`${affirmation}-${index}`}
                className="p-4 rounded-xl bg-gradient-to-r from-[#D4E8DC] to-[#D4DEE8] text-gray-800"
              >
                {affirmation}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-3">
        {savedAffirmations.length > 0 && (
          <button
            onClick={onCopy}
            className="w-full py-4 px-6 text-base font-medium text-white bg-[#5B7FE1] rounded-xl hover:bg-[#4A6ED0] transition-colors flex items-center justify-center gap-2"
          >
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy to Clipboard
          </button>
        )}

        <button
          onClick={onStartOver}
          className="w-full py-4 px-6 text-base font-medium text-[#5B7FE1] bg-white dark:bg-gray-900 border border-[#5B7FE1] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
