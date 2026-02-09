'use client';

import { motion } from 'framer-motion';
import { Heart, RefreshCw, Check } from 'lucide-react';

interface AffirmationSummaryProps {
  lovedAffirmations: string[];
  onDone: () => void;
  onMore: () => void;
}

/**
 * Summary screen showing all loved affirmations after card review.
 *
 * Displays a flat list of loved affirmations with count.
 * If affirmations exist: "I am good with these" + "I want to create more" buttons.
 * If empty: encouragement message + "Generate new affirmations" button.
 */
export function AffirmationSummary({ lovedAffirmations, onDone, onMore }: AffirmationSummaryProps) {
  const hasAffirmations = lovedAffirmations.length > 0;

  return (
    <motion.div
      className="max-w-md mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-testid="affirmation-summary"
    >
      <h2 className="text-2xl font-medium mb-2 text-center text-gray-800 dark:text-gray-200">
        Your affirmations
      </h2>

      {hasAffirmations ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            {lovedAffirmations.length} affirmation{lovedAffirmations.length !== 1 ? 's' : ''} collected
          </p>

          <motion.div
            className="space-y-3 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {lovedAffirmations.map((affirmation, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                <Heart className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0 fill-current" />
                <span className="text-gray-800 dark:text-gray-200">{affirmation}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="space-y-3">
            <button
              onClick={onDone}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
              data-testid="done-button"
            >
              <Check className="w-5 h-5" />
              I am good with these
            </button>
            <button
              onClick={onMore}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              data-testid="more-button"
            >
              <RefreshCw className="w-5 h-5" />
              I want to create more
            </button>
          </div>
        </>
      ) : (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            None of those resonated? Let us try again.
          </p>
          <button
            onClick={onMore}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
            data-testid="generate-new-button"
          >
            <RefreshCw className="w-5 h-5" />
            Generate new affirmations
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
