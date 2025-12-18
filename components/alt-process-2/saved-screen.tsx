'use client';

import { motion } from 'framer-motion';

interface SavedScreenProps {
  affirmations: string[];
  onBack: () => void;
  onRemove: (affirmation: string) => void;
}

export function SavedScreen({ affirmations, onBack, onRemove }: SavedScreenProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">Saved</h1>
        <span className="text-white/50 text-sm">({affirmations.length})</span>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {affirmations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50">No saved affirmations yet.</p>
            <p className="text-white/30 text-sm mt-2">
              Swipe right on affirmations you love!
            </p>
          </div>
        ) : (
          affirmations.map((affirmation, index) => (
            <motion.div
              key={affirmation}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4">
                <p className="text-white font-medium pr-8">{affirmation}</p>
              </div>
              <button
                onClick={() => onRemove(affirmation)}
                className="absolute top-2 right-2 p-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
