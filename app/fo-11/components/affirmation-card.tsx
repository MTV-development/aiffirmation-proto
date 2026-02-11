'use client';

import { motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface AffirmationCardProps {
  affirmation: string;
  onLove: () => void;
  onDiscard: () => void;
}

/**
 * Single affirmation card for FO-11 card review flow.
 *
 * Displays one affirmation prominently with "Love it" and "Discard" buttons.
 * Animated with Framer Motion for slide-in/slide-out transitions.
 */
export function AffirmationCard({ affirmation, onLove, onDiscard }: AffirmationCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center"
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      data-testid="affirmation-card"
    >
      <p className="text-lg text-center text-gray-800 dark:text-gray-200 leading-relaxed mb-8">
        {affirmation}
      </p>

      <div className="flex gap-4 w-full">
        <button
          onClick={onDiscard}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          data-testid="discard-button"
        >
          <X className="w-5 h-5" />
          <span>Discard</span>
        </button>

        <button
          onClick={onLove}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          data-testid="love-button"
        >
          <Heart className="w-5 h-5" />
          <span>Love it</span>
        </button>
      </div>
    </motion.div>
  );
}
